// 宣告全域變數，用來存放所有圖片精靈與角色狀態
let stopSheet; // 存放待機動作的圖片精靈 (stop.png)
let walkSheet; // 存放走路動作的圖片精靈 (walk.png)
let runSheet; // 存放跑步動作的圖片精靈 (run.png)
let magicSheet; // 存放施法動作的圖片精靈 (magic.png)
let jumpSheet; // 存放跳躍動作的圖片精靈 (jump.png)
let effectSheet; // 存放魔法特效的圖片精靈 (magic(effect).png)

// 各個動畫的總張數設定
let stopTotalFrames = 11; // 待機圖片總張數
let walkTotalFrames = 9; // 走路圖片總張數
let runTotalFrames = 8; // 跑步圖片總張數（總寬 1547，總高 147，共 8 張）
let magicTotalFrames = 15; // 施法圖片總張數
let jumpTotalFrames = 10; // 跳躍圖片總張數
let effectTotalFrames = 3; // 特效圖片總張數

// 單張畫格的寬度與高度變數（將在 setup 中依據載入的圖片自動精準計算）
let stopFrameWidth, stopFrameHeight;
let walkFrameWidth, walkFrameHeight;
let runFrameWidth, runFrameHeight;
let magicFrameWidth, magicFrameHeight;
let jumpFrameWidth, jumpFrameHeight;
let effectFrameWidth, effectFrameHeight;

// 角色控制與狀態變數
let charX; // 角色在畫布上的水平中心點 X 座標
let walkSpeed = 5; // 角色左右走路的速度
let runSpeed = 10; // 角色按下 Shift 跑步時的移動速度（比走路快）
let facingDirection = 1; // 角色面向的方向：1 代表朝右，-1 代表朝左
let charState = 'stop'; // 角色目前狀態：'stop'(待機)、'walk'(走路)、'run'(跑步)、'magic'(施法)、'jump'(跳躍)

// 動畫播放控制變數
let currentFrame = 0; // 目前播放到第幾張畫格（從 0 開始計算）
let animationSpeed = 5; // 動畫播放速度（數值越小播放越快）
let hasSpawnedEffect = false; // 記錄本次施法是否已經產生過特效（防止在同一個畫格重複發射）

// 存放畫面上所有發射出去的魔法特效陣列
let effects = [];

// preload 函式會在 setup 之前執行，確保所有外部圖片都載入完成
function preload() {
  // 載入待機、走路、跑步、施法、跳躍與特效六張圖片精靈
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
  
  // 設定角色初始 X 座標在畫布寬度的三分之一處
  charX = width / 3;
}

// draw 函式會不斷重複執行，負責處理狀態邏輯、角色繪製與特效更新
function draw() {
  // 設定畫布的背景顏色為 #48cae4
  background('#48cae4');
  
  // 計算角色在畫布上顯示的基準高度（畫布高度的 1/4）與地面 Y 軸底端座標
  let displayHeight = height / 4;
  let groundY = height - displayHeight;
  let posY = groundY; // 預設角色的 Y 座標貼齊地面
  
  // 宣告目前動作的圖片與裁切參數變數
  let activeSheet, activeTotalFrames, activeFrameWidth, activeFrameHeight;
  
  // 偵測目前是否按住 Shift 鍵（keyCode 為 16）
  let isShiftPressed = keyIsDown(SHIFT);
  
  // 【狀態判斷 1】如果角色正在施放魔法（'magic' 狀態）
  if (charState === 'magic') {
    activeSheet = magicSheet;
    activeTotalFrames = magicTotalFrames;
    activeFrameWidth = magicFrameWidth;
    activeFrameHeight = magicFrameHeight;
  } 
  // 【狀態判斷 2】如果角色正在跳躍（'jump' 狀態）
  else if (charState === 'jump') {
    activeSheet = jumpSheet;
    activeTotalFrames = jumpTotalFrames;
    activeFrameWidth = jumpFrameWidth;
    activeFrameHeight = jumpFrameHeight;
    
    // 計算跳躍進度（從 0.0 到 1.0），並利用正弦波 sin(PI * progress) 產生平滑的「往上跳再落回地面」拋物線位移
    let jumpProgress = currentFrame / (jumpTotalFrames - 1);
    let maxJumpHeight = displayHeight * 0.8; // 設定最高跳躍高度為角色身高的 0.8 倍
    let jumpOffset = sin(PI * jumpProgress) * maxJumpHeight;
    posY = groundY - jumpOffset; // 往上跳時 Y 座標減少，第 10 張結束時 jumpOffset 歸零回到原位
    
    // 跳躍期間依然允許按左右鍵在空中微調水平方向與位置（若有按 Shift 則水平位移較快）
    let airSpeed = isShiftPressed ? runSpeed : walkSpeed;
    if (keyIsDown(RIGHT_ARROW)) {
      facingDirection = 1;
      charX += airSpeed;
    } else if (keyIsDown(LEFT_ARROW)) {
      facingDirection = -1;
      charX -= airSpeed;
    }
  } 
  // 【狀態判斷 3】如果不在施法也不在跳躍，則偵測方向鍵與 Shift 鍵進行跑步、走路或待機
  else {
    let previousState = charState; // 記錄切換前的狀態
    
    // 按下右鍵：面向右邊並往右移動
    if (keyIsDown(RIGHT_ARROW)) {
      facingDirection = 1;
      // 若同時按住 Shift 鍵則進入跑步狀態，否則為走路狀態
      if (isShiftPressed) {
        charState = 'run';
        charX += runSpeed;
      } else {
        charState = 'walk';
        charX += walkSpeed;
      }
    } 
    // 按下左鍵：面向左邊並往左移動
    else if (keyIsDown(LEFT_ARROW)) {
      facingDirection = -1;
      // 若同時按住 Shift 鍵則進入跑步狀態，否則為走路狀態
      if (isShiftPressed) {
        charState = 'run';
        charX -= runSpeed;
      } else {
        charState = 'walk';
        charX -= walkSpeed;
      }
    } 
    // 鬆開左右鍵：恢復待機狀態
    else {
      charState = 'stop';
    }
    
    // 若狀態在待機、走路、跑步之間切換，將畫格索引歸零避免索引超出陣列範圍
    if (previousState !== charState) {
      currentFrame = 0;
    }
    
    // 根據待機、走路或跑步設定對應的圖片精靈參數
    if (charState === 'run') {
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
  }
  
  // 所有圖片精靈皆為水平排列，因此 X 軸隨畫格往右移動，Y 軸固定為 0
  let sourceX = currentFrame * activeFrameWidth;
  let sourceY = 0;
  
  // 依照原圖高度與顯示高度的比例，等比例計算出角色顯示的寬度
  let scaleRatio = displayHeight / activeFrameHeight;
  let displayWidth = activeFrameWidth * scaleRatio;
  
  // 限制角色的 X 軸移動範圍在畫布左右兩端之內
  charX = constrain(charX, displayWidth / 2, width - displayWidth / 2);
  
  // 【特效發射時機判斷】
  // 當處於施法狀態、播放到第 6 張圖片（索引值 currentFrame === 5），且本次施法尚未產生過特效時
  if (charState === 'magic' && currentFrame === 5 && !hasSpawnedEffect) {
    // 在角色前方產生一個新的魔法特效物件
    spawnMagicEffect(charX, posY, displayWidth, displayHeight, facingDirection);
    // 標記為已產生，確保第 6 張停留的幾個 draw 週期內只會發射一次
    hasSpawnedEffect = true;
  }
  
  // 繪製角色 1
  push(); // 儲存當前座標狀態
  translate(charX, posY); // 將原點移至角色水平中心與當前垂直頂端位置
  scale(facingDirection, 1); // 依據面向方向決定是否水平翻轉（1 朝右，-1 朝左）
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
  pop(); // 恢復座標狀態
  
  // 控制角色動畫幀數切換（跑步時加快動畫幀率，讓奔跑感更流暢）
  let currentAnimSpeed = (charState === 'run') ? 4 : animationSpeed;
  if (frameCount % currentAnimSpeed === 0) {
    // 如果目前是施法動作（只播放一次）
    if (charState === 'magic') {
      if (currentFrame < magicTotalFrames - 1) {
        currentFrame++; // 繼續播放下一張
      } else {
        // 15 張施法動作全部播放完畢，將角色切回待機狀態並重置畫格
        charState = 'stop';
        currentFrame = 0;
      }
    } 
    // 如果目前是跳躍動作（只播放一次）
    else if (charState === 'jump') {
      if (currentFrame < jumpTotalFrames - 1) {
        currentFrame++; // 繼續播放下一張跳躍畫格
      } else {
        // 10 張跳躍動作全部播放完畢並回到地面原位，切回待機狀態並重置畫格
        charState = 'stop';
        currentFrame = 0;
      }
    }
    // 如果是待機、走路或跑步動作，則維持無限循環播放
    else {
      currentFrame = (currentFrame + 1) % activeTotalFrames;
    }
  }
  
  // 更新並繪製畫面上所有的魔法特效
  updateAndDrawEffects();
}

// keyPressed 是 p5.js 的內建事件，當鍵盤按鍵被按下的一瞬間觸發一次
function keyPressed() {
  // 偵測是否按下空白鍵（key === ' ' 或 keyCode === 32），且目前不在施法或跳躍中
  if ((key === ' ' || keyCode === 32) && charState !== 'magic' && charState !== 'jump') {
    charState = 'magic'; // 將角色切換為施法狀態
    currentFrame = 0; // 從第 1 張施法圖片開始播放
    hasSpawnedEffect = false; // 重置特效發射標記，允許在播到第 6 張時發射特效
  }
  
  // 偵測是否按下鍵盤上鍵（UP_ARROW），且目前不在跳躍或施法中
  if (keyCode === UP_ARROW && charState !== 'jump' && charState !== 'magic') {
    charState = 'jump'; // 將角色切換為跳躍狀態
    currentFrame = 0; // 從第 1 張跳躍圖片開始播放
  }
}

// 產生魔法特效的函式
function spawnMagicEffect(cX, cY, cWidth, cHeight, dir) {
  // 設定特效在畫布上的顯示高度（設為角色高度的一半，並依原圖比例計算寬度）
  let effHeight = cHeight * 0.5;
  let effRatio = effHeight / effectFrameHeight;
  let effWidth = effectFrameWidth * effRatio;
  
  // 計算特效產生的初始 X 座標（在角色面向的那一側邊緣）
  let startX = cX + dir * (cWidth / 2);
  // 計算特效產生的初始 Y 座標（在角色身體垂直置中偏上的位置）
  let startY = cY + (cHeight * 0.25);
  
  // 將新產生的特效物件加入陣列中管理
  effects.push({
    x: startX, // 特效目前中心 X 座標
    y: startY, // 特效目前頂端 Y 座標
    width: effWidth, // 特效顯示寬度
    height: effHeight, // 特效顯示高度
    dir: dir, // 移動與面向方向（1 往右，-1 往左）
    speed: 10, // 特效飛行的速度
    frame: 0 // 特效目前的動畫畫格（0 到 2）
  });
}

// 更新位置、播放動畫並繪製所有魔法特效的函式
function updateAndDrawEffects() {
  // 使用反向迴圈遍歷特效陣列，方便在特效飛出邊界時安全地將其刪除
  for (let i = effects.length - 1; i >= 0; i--) {
    let eff = effects[i];
    
    // 依照方向更新特效的 X 座標（面向右則往右加，面向左則往左減）
    eff.x += eff.dir * eff.speed;
    
    // 讓特效自身的 3 張圖片精靈循環播放
    if (frameCount % animationSpeed === 0) {
      eff.frame = (eff.frame + 1) % effectTotalFrames;
    }
    
    // 計算特效圖片精靈的 X 軸裁切起點
    let effSourceX = eff.frame * effectFrameWidth;
    
    // 繪製特效圖片（同樣支援依據飛行方向進行水平翻轉）
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
    
    // 邊界消失判斷：
    // 若特效往右移動（dir === 1）且完全超出畫布最右端，或往左移動（dir === -1）且完全超出畫布最左端
    if ((eff.dir === 1 && eff.x - eff.width / 2 > width) || 
        (eff.dir === -1 && eff.x + eff.width / 2 < 0)) {
      // 從陣列中移除該特效，使其消失不見並釋放記憶體
      effects.splice(i, 1);
    }
  }
}

// windowResized 事件：當瀏覽器視窗大小改變時自動觸發
function windowResized() {
  // 記錄視窗縮放前角色在畫布上的相對比例位置
  let relativeX = charX / width;
  
  // 重新調整畫布大小以適應新的視窗尺寸
  resizeCanvas(windowWidth, windowHeight);
  
  // 依照原本的比例重新計算角色 X 座標
  charX = relativeX * width;
}