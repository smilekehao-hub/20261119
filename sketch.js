// 宣告全域變數，用來存放所有圖片精靈、背景圖與角色狀態
let bgImg; // 存放背景圖片 (background1.png)
let stopSheet; // 存放待機動作的圖片精靈 (stop.png)
let walkSheet; // 存放走路動作的圖片精靈 (walk.png)
let runSheet; // 存放跑步動作的圖片精靈 (run.png)
let magicSheet; // 存放施法動作的圖片精靈 (magic.png)
let jumpSheet; // 存放跳躍動作的圖片精靈 (jump.png)
let effectSheet; // 存放魔法特效的圖片精靈 (magic(effect).png)

// 各個動畫的總張數設定
let stopTotalFrames = 11; // 待機圖片總張數
let walkTotalFrames = 9; // 走路圖片總張數
let runTotalFrames = 8; // 跑步圖片總張數
let magicTotalFrames = 15; // 施法圖片總張數
let jumpTotalFrames = 10; // 跳躍圖片總張數
let effectTotalFrames = 3; // 特效圖片總張數

// 【各動作體型微調倍率】用來統一不同圖片精靈之間的角色人物視覺大小（1.0 為待機基準大小）
let actionScaleAdjust = {
  stop: 1.0,  // 待機動作基準倍率
  walk: 1.0,  // 走路動作微調倍率
  run: 1.15,  // 跑步動作微調倍率
  jump: 1.0,  // 跳躍動作微調倍率
  magic: 0.9  // 施法動作微調倍率
};

// 單張畫格的寬度與高度變數（將在 setup 中依據載入的圖片自動精準計算）
let stopFrameWidth, stopFrameHeight;
let walkFrameWidth, walkFrameHeight;
let runFrameWidth, runFrameHeight;
let magicFrameWidth, magicFrameHeight;
let jumpFrameWidth, jumpFrameHeight;
let effectFrameWidth, effectFrameHeight;

// 【背景捲動與三張串接變數】
let bgWidth; // 單張背景圖依照畫布高度等比例縮放後的顯示寬度
let bgOffsetX = 0; // 背景的水平捲動位移量（0 代表正中央那張背景的初始位置）

// 角色水平移動與狀態變數
let charX; // 角色在畫布上的水平中心點 X 座標
let walkSpeed = 5; // 角色左右走路的速度
let runSpeed = 10; // 角色按下 Shift 跑步時的移動速度
let facingDirection = 1; // 角色面向的方向：1 代表朝右，-1 代表朝左
let charState = 'stop'; // 角色目前動作狀態：'stop'(待機)、'walk'(走路)、'run'(跑步)、'magic'(施法)、'jump'(跳躍)

// 【物理跳躍與嚴格二段跳控制變數】
let jumpOffset = 0; // 角色距離地面的垂直高度（0 代表踩在地面上，大於 0 代表在空中）
let velocityY = 0; // 角色目前的垂直速度（正值代表往上衝，負值代表往下掉）
let gravity = 1.1; // 重力加速度（控制角色下墜的速度）
let jumpForce = 20; // 單次跳躍的向上推力（決定跳躍高度）
let jumpCount = 0; // 目前已經消耗的跳躍次數（0=在地面, 1=已一段跳, 2=已二段跳上限）
const MAX_JUMPS = 2; // 嚴格限制最大連跳次數為 2（最多只能二段跳）

// 動畫播放與空中施法滯空控制變數
let currentFrame = 0; // 目前播放到第幾張畫格（從 0 開始計算）
let animationSpeed = 5; // 動畫播放速度（數值越小播放越快）
let hasSpawnedEffect = false; // 記錄本次施法是否已經產生過特效
let isAirCasting = false; // 記錄目前是否處於「空中施法滯空狀態」

// 存放畫面上所有發射出去的魔法特效陣列
let effects = [];

// preload 函式會在 setup 之前執行，確保所有外部圖片都載入完成
function preload() {
  // 載入背景圖片與角色的所有動作圖片精靈
  bgImg = loadImage('1/background/background1.png');
  stopSheet = loadImage('1/stop/stop.png');
  walkSheet = loadImage('1/walk/walk.png');
  runSheet = loadImage('1/run/run.png');
  magicSheet = loadImage('1/magic/magic.png');
  jumpSheet = loadImage('1/jump/jump.png');
  effectSheet = loadImage('1/magic(effect)/magic(effect).png');
}

// setup 函式在程式開始時執行一次，初始化畫布與單張畫格尺寸
function setup() {
  // 建立符合瀏覽器視窗大小的全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 直接讀取圖片實際載入的寬度與高度，計算每張畫格的精準尺寸
  stopFrameWidth = stopSheet.width / stopTotalFrames;
  stopFrameHeight = stopSheet.height;
  
  walkFrameWidth = walkSheet.width / walkTotalFrames;
  walkFrameHeight = walkSheet.height;
  
  runFrameWidth = runSheet.width / runTotalFrames;
  runFrameHeight = runSheet.height;
  
  magicFrameWidth = magicSheet.width / magicTotalFrames;
  magicFrameHeight = magicSheet.height;
  
  jumpFrameWidth = jumpSheet.width / jumpTotalFrames;
  jumpFrameHeight = jumpSheet.height;
  
  effectFrameWidth = effectSheet.width / effectTotalFrames;
  effectFrameHeight = effectSheet.height;
  
  // 計算單張背景圖等比例縮放至全螢幕高度時的寬度
  bgWidth = bgImg.width * (height / bgImg.height);
  
  // 設定角色初始 X 座標在畫布寬度的三分之一處（同時作為背景捲動時的基準站位）
  charX = width / 3;
}

// draw 函式會不斷重複執行，負責處理背景串接捲動、物理運算、角色繪製與特效更新
function draw() {
  // 計算單張背景圖對應目前畫布高度的等比例寬度（確保跨載具或縮放時比例正確）
  bgWidth = bgImg.width * (height / bgImg.height);
  // 確保背景寬度至少等於畫布寬度，避免超寬螢幕左右兩側露出白邊
  if (bgWidth < width) {
    bgWidth = width;
  }
  
  // 計算三張背景圖串接時的捲動最大範圍：
  // 初始狀態下，中間圖對齊畫布中央（或左側起點），左右兩側各接一張相同大小的背景圖
  // 讓三張圖總寬度為 3 * bgWidth，正中央圖置中對齊畫面中央 (width - bgWidth) / 2
  let centerBgBaseX = (width - bgWidth) / 2;
  // 往右捲動到最底端（看到右邊那張圖的最右邊緣）時的最小 bgOffsetX
  let minBgOffsetX = width - (centerBgBaseX + 2 * bgWidth);
  // 往左捲動到最底端（看到左邊那張圖的最左邊緣）時的最大 bgOffsetX
  let maxBgOffsetX = -(centerBgBaseX - bgWidth);
  
  // 限制背景捲動位移量不超出三張拼接圖片的總邊界
  bgOffsetX = constrain(bgOffsetX, minBgOffsetX, maxBgOffsetX);
  
  // 【繪製三張串接連結的背景圖片（左、中、右無縫拼接）】
  let middleX = centerBgBaseX + bgOffsetX; // 中間背景圖的實際 X 座標
  let leftX = middleX - bgWidth; // 左側複製串接的背景圖 X 座標
  let rightX = middleX + bgWidth; // 右側複製串接的背景圖 X 座標
  
  // 依序在左、中、右三個相連位置繪製相同大小的背景圖片
  image(bgImg, leftX, 0, bgWidth, height);
  image(bgImg, middleX, 0, bgWidth, height);
  image(bgImg, rightX, 0, bgWidth, height);
  
  // 以待機圖片 (stop) 作為基準高度（畫布高度的 1/4）與基準縮放倍率
  let baseDisplayHeight = height / 4;
  let baseScale = baseDisplayHeight / stopFrameHeight;
  
  // 偵測目前是否按住 Shift 鍵
  let isShiftPressed = keyIsDown(SHIFT);
  
  // 【1. 垂直重力與空中施法滯空物理運算】
  if (isAirCasting) {
    velocityY = 0; // 空中施法蓄力時暫停重力
  } else if (jumpOffset > 0 || velocityY > 0) {
    jumpOffset += velocityY;
    velocityY -= gravity;
    
    // 落地偵測
    if (jumpOffset <= 0 && velocityY <= 0) {
      jumpOffset = 0;
      velocityY = 0;
      jumpCount = 0;
      isAirCasting = false;
      
      if (charState === 'jump') {
        charState = 'stop';
        currentFrame = 0;
      }
    }
  }
  
  // 判斷角色目前是否處於騰空狀態
  let isAirborne = (jumpOffset > 0);
  
  // 【2. 水平捲動背景與角色移動控制】
  // 規則：優先捲動背景；只有當背景捲動到最右端或最左端暫停時，角色1才在畫布上左右移動
  let currentMoveSpeed = isShiftPressed ? runSpeed : walkSpeed;
  let anchorX = width / 3; // 角色在捲動背景時的基準站位（畫布寬度三分之一處）
  
  // 按下往右鍵時：
  if (keyIsDown(RIGHT_ARROW)) {
    facingDirection = 1; // 角色面向右邊
    
    // 若角色先前因為走到最左邊而偏離了基準站位（在基準點左側），先讓角色走回基準點
    if (charX < anchorX) {
      charX = min(charX + currentMoveSpeed, anchorX);
    } 
    // 若背景還沒捲動到最右邊界，則讓背景往左移動，角色位置保持不動
    else if (bgOffsetX > minBgOffsetX) {
      bgOffsetX = max(bgOffsetX - currentMoveSpeed, minBgOffsetX);
    } 
    // 當背景已經到達最右邊暫停捲動時，角色 1 才開始往右移動（直到畫布最右端）
    else {
      charX += currentMoveSpeed;
    }
  } 
  // 按下往左鍵時：
  else if (keyIsDown(LEFT_ARROW)) {
    facingDirection = -1; // 角色面向左邊
    
    // 若角色先前因為走到最右邊而偏離了基準站位（在基準點右側），先讓角色走回基準點
    if (charX > anchorX) {
      charX = max(charX - currentMoveSpeed, anchorX);
    } 
    // 若背景還沒捲動到最左邊界，則讓背景往右移動，角色位置保持不動
    else if (bgOffsetX < maxBgOffsetX) {
      bgOffsetX = min(bgOffsetX + currentMoveSpeed, maxBgOffsetX);
    } 
    // 當背景已經到達最左邊暫停捲動時，角色 1 才開始往左移動（直到畫布最左端）
    else {
      charX -= currentMoveSpeed;
    }
  }
  
  // 【3. 角色動作狀態切換邏輯】
  if (charState !== 'magic') {
    let previousState = charState;
    
    if (isAirborne) {
      charState = 'jump';
    } else {
      if (keyIsDown(RIGHT_ARROW) || keyIsDown(LEFT_ARROW)) {
        charState = isShiftPressed ? 'run' : 'walk';
      } else {
        charState = 'stop';
      }
    }
    
    if (previousState !== charState) {
      currentFrame = 0;
    }
  }
  
  // 【4. 依據最終決定的 charState 指派對應的圖片精靈與總張數】
  let activeSheet, activeTotalFrames, activeFrameWidth, activeFrameHeight;
  if (charState === 'magic') {
    activeSheet = magicSheet;
    activeTotalFrames = magicTotalFrames;
    activeFrameWidth = magicFrameWidth;
    activeFrameHeight = magicFrameHeight;
  } else if (charState === 'jump') {
    activeSheet = jumpSheet;
    activeTotalFrames = jumpTotalFrames;
    activeFrameWidth = jumpFrameWidth;
    activeFrameHeight = jumpFrameHeight;
  } else if (charState === 'run') {
    activeSheet = runSheet;
    activeTotalFrames = runTotalFrames;
    activeFrameWidth = runFrameWidth;
    activeFrameHeight = runFrameHeight;
  } else if (charState === 'walk') {
    activeSheet = walkSheet;
    activeTotalFrames = walkTotalFrames;
    activeFrameWidth = walkFrameWidth;
    activeFrameHeight = walkFrameHeight;
  } else {
    activeSheet = stopSheet;
    activeTotalFrames = stopTotalFrames;
    activeFrameWidth = stopFrameWidth;
    activeFrameHeight = stopFrameHeight;
  }
  
  // 計算水平圖片精靈的裁切起點
  let sourceX = currentFrame * activeFrameWidth;
  let sourceY = 0;
  
  // 套用各動作獨立微調倍率，計算最終顯示在畫布上的寬度與高度
  let currentAdjust = actionScaleAdjust[charState] || 1.0;
  let finalScale = baseScale * currentAdjust;
  let displayWidth = activeFrameWidth * finalScale;
  let displayHeight = activeFrameHeight * finalScale;
  
  // 計算角色頂端的 Y 座標
  let posY = height - displayHeight - jumpOffset;
  
  // 限制角色的 X 軸移動範圍在畫布左右兩端之內（當背景停止捲動後，角色最多走到畫布最左或最右邊緣）
  charX = constrain(charX, displayWidth / 2, width - displayWidth / 2);
  
  // 【5. 特效發射與解除空中滯空判斷】
  if (charState === 'magic' && currentFrame === 5 && !hasSpawnedEffect) {
    spawnMagicEffect(charX, posY, displayWidth, displayHeight, facingDirection, baseScale);
    hasSpawnedEffect = true;
    isAirCasting = false;
  }
  
  // 【6. 繪製角色 1】
  push();
  translate(charX, posY);
  scale(facingDirection, 1);
  image(
    activeSheet,
    -displayWidth / 2,
    0,
    displayWidth,
    displayHeight,
    sourceX,
    sourceY,
    activeFrameWidth,
    activeFrameHeight
  );
  pop();
  
  // 【7. 控制角色動畫幀數切換】
  let currentAnimSpeed = (charState === 'run') ? 4 : animationSpeed;
  if (frameCount % currentAnimSpeed === 0) {
    if (charState === 'magic') {
      if (currentFrame < magicTotalFrames - 1) {
        currentFrame++;
      } else {
        isAirCasting = false;
        charState = (jumpOffset > 0) ? 'jump' : 'stop';
        currentFrame = 0;
      }
    } else if (charState === 'jump') {
      if (currentFrame < jumpTotalFrames - 1) {
        currentFrame++;
      }
    } else {
      currentFrame = (currentFrame + 1) % activeTotalFrames;
    }
  }
  
  // 更新並繪製畫面上所有的魔法特效
  updateAndDrawEffects();
}

// keyPressed 是 p5.js 的內建事件，每次按下按鍵的瞬間只會觸發一次
function keyPressed() {
  // 【空白鍵：支援地面與空中連續施法】
  if ((key === ' ' || keyCode === 32) && (charState !== 'magic' || hasSpawnedEffect)) {
    charState = 'magic';
    currentFrame = 0;
    hasSpawnedEffect = false;
    
    if (jumpOffset > 0) {
      isAirCasting = true;
      velocityY = 0;
    }
  }
  
  // 【上鍵：支援一段跳與二段跳】
  if (keyCode === UP_ARROW && jumpCount < MAX_JUMPS && (charState !== 'magic' || hasSpawnedEffect)) {
    isAirCasting = false;
    velocityY = jumpForce;
    jumpCount++;
    charState = 'jump';
    currentFrame = 0;
  }
}

// 產生魔法特效的函式
function spawnMagicEffect(cX, cY, cWidth, cHeight, dir, baseScale) {
  let effWidth = effectFrameWidth * baseScale * 0.65;
  let effHeight = effectFrameHeight * baseScale * 0.65;
  let startX = cX + dir * (cWidth / 2);
  let startY = cY + (cHeight * 0.35);
  
  effects.push({
    x: startX,
    y: startY,
    width: effWidth,
    height: effHeight,
    dir: dir,
    speed: 10,
    frame: 0
  });
}

// 更新位置、播放動畫並繪製所有魔法特效的函式
function updateAndDrawEffects() {
  for (let i = effects.length - 1; i >= 0; i--) {
    let eff = effects[i];
    eff.x += eff.dir * eff.speed;
    
    if (frameCount % animationSpeed === 0) {
      eff.frame = (eff.frame + 1) % effectTotalFrames;
    }
    
    let effSourceX = eff.frame * effectFrameWidth;
    
    push();
    translate(eff.x, eff.y);
    scale(eff.dir, 1);
    image(
      effectSheet,
      -eff.width / 2,
      0,
      eff.width,
      eff.height,
      effSourceX,
      0,
      effectFrameWidth,
      effectFrameHeight
    );
    pop();
    
    if ((eff.dir === 1 && eff.x - eff.width / 2 > width) || 
        (eff.dir === -1 && eff.x + eff.width / 2 < 0)) {
      effects.splice(i, 1);
    }
  }
}

// windowResized 事件：當瀏覽器視窗大小改變時自動觸發
function windowResized() {
  let relativeX = charX / width;
  let relativeBgOffset = bgOffsetX / bgWidth;
  
  resizeCanvas(windowWidth, windowHeight);
  
  // 視窗尺寸改變後，依比例同步調整角色 X 座標與背景捲動偏移量
  charX = relativeX * width;
  bgWidth = max(bgImg.width * (height / bgImg.height), width);
  bgOffsetX = relativeBgOffset * bgWidth;
}