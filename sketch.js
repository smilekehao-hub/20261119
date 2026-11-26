// 宣告全域變數，用來存放所有圖片精靈、背景圖與角色狀態
let bgImg; // 存放背景圖片 (background1.png)

// 角色 1 圖片精靈變數
let stopSheet; // 存放角色 1 待機動作 (1/stop/stop.png)
let walkSheet; // 存放角色 1 走路動作 (1/walk/walk.png)
let runSheet; // 存放角色 1 跑步動作 (1/run/run.png)
let magicSheet; // 存放角色 1 施法動作 (1/magic/magic.png)
let jumpSheet; // 存放角色 1 跳躍動作 (1/jump/jump.png)
let effectSheet; // 存放魔法特效 (1/magic(effect)/magic(effect).png)

// 角色 2 (NPC) 圖片精靈變數
let npcStopSheet; // 存放角色 2 待機動作 (2/stop/stop.png，寬1627 高171 共12張)
let npcQuestionSheet; // 存放角色 2 提問動作 (2/quastion/quastion.png，寬4477 高214 共18張)
let npcDieSheet; // 存放角色 2 倒地動作 (2/die/die.png，寬3700 高171 共15張)
let npcSmileSheet; // 存放角色 2 微笑動作 (2/smile/smile.png，寬1975 高189 共12張)

// 角色 1 各個動畫的總張數設定
let stopTotalFrames = 11; // 待機圖片總張數
let walkTotalFrames = 9; // 走路圖片總張數
let runTotalFrames = 8; // 跑步圖片總張數
let magicTotalFrames = 15; // 施法圖片總張數
let jumpTotalFrames = 10; // 跳躍圖片總張數
let effectTotalFrames = 3; // 特效圖片總張數

// 角色 2 各個動畫的總張數設定
let npcStopTotalFrames = 12; // 角色 2 待機總張數
let npcQuestionTotalFrames = 18; // 角色 2 提問總張數
let npcDieTotalFrames = 15; // 角色 2 倒地總張數
let npcSmileTotalFrames = 12; // 角色 2 微笑總張數

// 【角色 1 各動作體型微調倍率】用來統一不同圖片精靈之間的角色人物視覺大小（1.0 為待機基準大小）
let actionScaleAdjust = {
  stop: 1.0,  // 待機動作基準倍率
  walk: 1.0,  // 走路動作微調倍率
  run: 1.15,  // 跑步動作微調倍率
  jump: 1.0,  // 跳躍動作微調倍率
  magic: 0.9  // 施法動作微調倍率
};

// 【角色 2 各動作體型微調倍率】使角色 2 與角色 1 身高視覺大小統一
let npcScaleAdjust = {
  stop: 1.0,     // 角色 2 待機基準倍率
  question: 1.0, // 角色 2 提問微調倍率
  die: 1.0,      // 角色 2 倒地微調倍率
  smile: 1.0     // 角色 2 微笑微調倍率
};

// 角色 1 單張畫格的寬度與高度變數
let stopFrameWidth, stopFrameHeight;
let walkFrameWidth, walkFrameHeight;
let runFrameWidth, runFrameHeight;
let magicFrameWidth, magicFrameHeight;
let jumpFrameWidth, jumpFrameHeight;
let effectFrameWidth, effectFrameHeight;

// 角色 2 單張畫格的寬度與高度變數
let npcStopFrameWidth, npcStopFrameHeight;
let npcQuestionFrameWidth, npcQuestionFrameHeight;
let npcDieFrameWidth, npcDieFrameHeight;
let npcSmileFrameWidth, npcSmileFrameHeight;

// 【背景捲動與三張串接變數】
let bgWidth; // 單張背景圖依照畫布高度等比例縮放後的顯示寬度
let bgOffsetX = 0; // 背景的水平捲動位移量

// 角色 1 水平移動與狀態變數
let charX; // 角色 1 在畫布上的水平中心點 X 座標
let walkSpeed = 5; // 角色左右走路的速度
let runSpeed = 10; // 角色按下 Shift 跑步時的移動速度
let facingDirection = -1; // 角色面向的方向：預設面向左邊 (-1)，方便往左側探索尋找角色 2
let charState = 'stop'; // 角色目前動作狀態：'stop'(待機)、'walk'(走路)、'run'(跑步)、'magic'(施法)、'jump'(跳躍)

// 【物理跳躍與嚴格二段跳控制變數】
let jumpOffset = 0; // 角色距離地面的垂直高度（0 代表踩在地面上，大於 0 代表在空中）
let velocityY = 0; // 角色目前的垂直速度（正值代表往上衝，負值代表往下掉）
let gravity = 1.1; // 重力加速度（控制角色下墜的速度）
let jumpForce = 20; // 單次跳躍的向上推力（決定跳躍高度）
let jumpCount = 0; // 目前已經消耗的跳躍次數（0=在地面, 1=已一段跳, 2=已二段跳上限）
const MAX_JUMPS = 2; // 嚴格限制最大連跳次數為 2（最多只能二段跳）

// 角色 1 動畫播放與空中施法滯空控制變數
let currentFrame = 0; // 目前播放到第幾張畫格
let animationSpeed = 5; // 動畫播放速度（數值越小播放越快）
let hasSpawnedEffect = false; // 記錄本次施法是否已經產生過特效
let isAirCasting = false; // 記錄目前是否處於「空中施法滯空狀態」

// 【角色 2 狀態與行為主義測驗互動變數】
let npcState = 'stop'; // 角色 2 目前狀態：'stop'(待機)、'question'(提問)、'die'(答對或被擊中倒地)、'smile'(答錯微笑)
let npcCurrentFrame = 0; // 角色 2 目前播放的畫格索引
let isNearNpc = false; // 記錄角色 1 目前是否靠近角色 2
let showQuiz = false; // 是否在螢幕上顯示行為主義測驗面板
let currentQuestionIndex = -1; // 目前抽到的題目索引
let quizFeedback = ''; // 答題或擊中回饋狀態：''(無)、'correct'(顯示KO)、'wrong'(答錯)
let koTimer = 0; // 顯示「KO」與倒地動畫的計時器
let optionBoxes = []; // 儲存畫面上四個選項按鈕的點擊區域座標

// 記錄角色 2 目前在畫面上的即時碰撞框（供魔法特效碰撞偵測使用）
let npcBounds = { x: 0, y: 0, width: 0, height: 0 };

// 存放畫面上所有發射出去的魔法特效陣列
let effects = [];

// 【行為主義心理學簡單測驗題庫】每次靠近角色 2 時會從中隨機抽取不同題目
const behaviorismQuestions = [
  {
    question: "提出「古典制約」(Classical Conditioning) 並以狗進行唾液分泌實驗的學者是誰？",
    options: ["A. 巴夫洛夫 (Pavlov)", "B. 史金納 (Skinner)", "C. 班杜拉 (Bandura)", "D. 皮亞傑 (Piaget)"],
    answer: 0
  },
  {
    question: "史金納 (Skinner) 提出的「操作制約」中，給予獎勵以增加行為出現頻率稱為什麼？",
    options: ["A. 負懲罰", "B. 正增強 (Positive Reinforcement)", "C. 消弱 (Extinction)", "D. 類化 (Generalization)"],
    answer: 1
  },
  {
    question: "「小艾伯特實驗」(Little Albert) 證明人類的情緒反應也能透過制約學習，這是哪位學者的實驗？",
    options: ["A. 桑代克 (Thorndike)", "B. 華生 (John B. Watson)", "C. 維高斯基 (Vygotsky)", "D. 托爾曼 (Tolman)"],
    answer: 1
  },
  {
    question: "桑代克 (Thorndike) 透過貓咪逃出迷箱的實驗，提出了哪一項著名的學習定律？",
    options: ["A. 效果律 (Law of Effect)", "B. 頓悟學習律", "C. 社會觀察律", "D. 認知平衡律"],
    answer: 0
  },
  {
    question: "行為主義心理學派在研究人類與動物行為時，最強調觀察哪一個部分？",
    options: ["A. 潛意識的夢境解析", "B. 內在的自我實現需求", "C. 可客觀觀察與測量的外顯行為", "D. 大腦神經元的基因結構"],
    answer: 2
  },
  {
    question: "在操作制約中，當原本給予的增強物（獎勵）完全停止後，制約行為逐漸減少直到消失，這稱為什麼？",
    options: ["A. 辨別 (Discrimination)", "B. 自然恢復", "C. 消弱 (Extinction)", "D. 塑造 (Shaping)"],
    answer: 2
  }
];

// preload 函式會在 setup 之前執行，確保所有外部圖片都載入完成
function preload() {
  // 載入背景圖片與角色 1 的所有動作圖片精靈
  bgImg = loadImage('1/background/background1.png');
  stopSheet = loadImage('1/stop/stop.png');
  walkSheet = loadImage('1/walk/walk.png');
  runSheet = loadImage('1/run/run.png');
  magicSheet = loadImage('1/magic/magic.png');
  jumpSheet = loadImage('1/jump/jump.png');
  effectSheet = loadImage('1/magic(effect)/magic(effect).png');
  
  // 載入角色 2 的四種狀態圖片精靈
  npcStopSheet = loadImage('2/stop/stop.png');
  npcQuestionSheet = loadImage('2/quastion/quastion.png');
  npcDieSheet = loadImage('2/die/die.png');
  npcSmileSheet = loadImage('2/smile/smile.png');
}

// setup 函式在程式開始時執行一次，初始化畫布與單張畫格尺寸
function setup() {
  // 建立符合瀏覽器視窗大小的全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 計算角色 1 各動作單張畫格的精準尺寸
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
  
  // 計算角色 2 各動作單張畫格的精準尺寸
  npcStopFrameWidth = npcStopSheet.width / npcStopTotalFrames;
  npcStopFrameHeight = npcStopSheet.height;
  
  npcQuestionFrameWidth = npcQuestionSheet.width / npcQuestionTotalFrames;
  npcQuestionFrameHeight = npcQuestionSheet.height;
  
  npcDieFrameWidth = npcDieSheet.width / npcDieTotalFrames;
  npcDieFrameHeight = npcDieSheet.height;
  
  npcSmileFrameWidth = npcSmileSheet.width / npcSmileTotalFrames;
  npcSmileFrameHeight = npcSmileSheet.height;
  
  // 計算單張背景圖等比例縮放至全螢幕高度時的寬度
  bgWidth = max(bgImg.width * (height / bgImg.height), width);
  
  // 設定初始鏡頭對準最右方背景圖，並將角色 1 放置在該背景圖的中間處
  let centerBgBaseX = (width - bgWidth) / 2;
  bgOffsetX = width - (centerBgBaseX + 2 * bgWidth);
  charX = width / 2;
}

// draw 函式會不斷重複執行，負責處理背景串接、角色 1 與角色 2 互動、碰撞偵測與動畫更新
function draw() {
  // 計算單張背景圖對應目前畫布高度的等比例寬度
  bgWidth = max(bgImg.width * (height / bgImg.height), width);
  
  // 計算三張背景圖串接時的捲動最大範圍
  let centerBgBaseX = (width - bgWidth) / 2;
  let minBgOffsetX = width - (centerBgBaseX + 2 * bgWidth); // 最右端邊界
  let maxBgOffsetX = -(centerBgBaseX - bgWidth); // 最左端邊界
  
  // 限制背景捲動位移量不超出三張拼接圖片的總邊界
  bgOffsetX = constrain(bgOffsetX, minBgOffsetX, maxBgOffsetX);
  
  // 【繪製三張串接連結的背景圖片（左、中、右無縫拼接）】
  let middleX = centerBgBaseX + bgOffsetX; // 中間背景圖的實際 X 座標
  let leftX = middleX - bgWidth; // 左側複製串接的背景圖 X 座標（最左側背景圖）
  let rightX = middleX + bgWidth; // 右側複製串接的背景圖 X 座標（最右方背景圖）
  
  image(bgImg, leftX, 0, bgWidth, height);
  image(bgImg, middleX, 0, bgWidth, height);
  image(bgImg, rightX, 0, bgWidth, height);
  
  // 以角色 1 待機圖片 (stop) 作為基準高度（畫布高度的 1/4）與基準縮放倍率
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
  
  // 判斷角色 1 目前是否處於騰空狀態
  let isAirborne = (jumpOffset > 0);
  
  // 【2. 水平捲動背景與角色 1 移動控制】
  let currentMoveSpeed = isShiftPressed ? runSpeed : walkSpeed;
  let anchorX = width / 2;
  
  if (keyIsDown(RIGHT_ARROW)) {
    facingDirection = 1;
    if (charX < anchorX) {
      charX = min(charX + currentMoveSpeed, anchorX);
    } else if (bgOffsetX > minBgOffsetX) {
      bgOffsetX = max(bgOffsetX - currentMoveSpeed, minBgOffsetX);
    } else {
      charX += currentMoveSpeed;
    }
  } else if (keyIsDown(LEFT_ARROW)) {
    facingDirection = -1;
    if (charX > anchorX) {
      charX = max(charX - currentMoveSpeed, anchorX);
    } else if (bgOffsetX < maxBgOffsetX) {
      bgOffsetX = min(bgOffsetX + currentMoveSpeed, maxBgOffsetX);
    } else {
      charX -= currentMoveSpeed;
    }
  }
  
  // 【3. 角色 1 動作狀態切換邏輯】
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
  
  // 【4. 依據最終決定的 charState 指派角色 1 對應的圖片精靈與總張數】
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
  
  // 計算角色 1 水平圖片精靈的裁切起點與縮放尺寸
  let sourceX = currentFrame * activeFrameWidth;
  let sourceY = 0;
  let currentAdjust = actionScaleAdjust[charState] || 1.0;
  let finalScale = baseScale * currentAdjust;
  let displayWidth = activeFrameWidth * finalScale;
  let displayHeight = activeFrameHeight * finalScale;
  let posY = height - displayHeight - jumpOffset;
  
  // 限制角色 1 的 X 軸移動範圍在畫布左右兩端之內
  charX = constrain(charX, displayWidth / 2, width - displayWidth / 2);
  
  // =========================================================================
  // 【角色 2 (NPC) 位置計算、距離偵測與狀態控制】
  // =========================================================================
  // 角色 2 生成在「最左側背景圖 (leftX)」的中間處
  let npcX = leftX + bgWidth / 2;
  
  // 計算角色 1 與角色 2 之間的水平距離（當兩者距離小於角色寬度 1.2 倍時判定為「靠近」）
  let distToNpc = abs(charX - npcX);
  let triggerDistance = displayWidth * 1.2;
  let currentlyNear = (distToNpc < triggerDistance);
  
  // 【靠近觸發邏輯】當角色 1「剛靠近」角色 2 的那一瞬間
  if (currentlyNear && !isNearNpc) {
    isNearNpc = true;
    if (npcState !== 'die') {
      npcState = 'question';
      npcCurrentFrame = 0;
      showQuiz = true;
      quizFeedback = '';
      pickNewQuestion(); // 每次靠近都抽取與上次不同的新題目
    }
  } 
  // 【離開邏輯】當角色 1 離開角色 2 身邊時
  else if (!currentlyNear && isNearNpc) {
    isNearNpc = false;
    showQuiz = false;
    quizFeedback = '';
    if (npcState !== 'die') {
      npcState = 'stop';
      npcCurrentFrame = 0;
    }
  }
  
  // 根據角色 2 目前狀態選擇對應的圖片精靈與參數
  let npcActiveSheet, npcActiveFrames, npcActiveW, npcActiveH;
  if (npcState === 'question') {
    npcActiveSheet = npcQuestionSheet;
    npcActiveFrames = npcQuestionTotalFrames;
    npcActiveW = npcQuestionFrameWidth;
    npcActiveH = npcQuestionFrameHeight;
  } else if (npcState === 'die') {
    npcActiveSheet = npcDieSheet;
    npcActiveFrames = npcDieTotalFrames;
    npcActiveW = npcDieFrameWidth;
    npcActiveH = npcDieFrameHeight;
  } else if (npcState === 'smile') {
    npcActiveSheet = npcSmileSheet;
    npcActiveFrames = npcSmileTotalFrames;
    npcActiveW = npcSmileFrameWidth;
    npcActiveH = npcSmileFrameHeight;
  } else {
    npcActiveSheet = npcStopSheet;
    npcActiveFrames = npcStopTotalFrames;
    npcActiveW = npcStopFrameWidth;
    npcActiveH = npcStopFrameHeight;
  }
  
  // 計算角色 2 顯示大小：高度與角色 1 相同（baseDisplayHeight = height / 4），並依原圖比例調整寬度
  let npcBaseScale = baseDisplayHeight / npcStopFrameHeight;
  let npcAdjust = npcScaleAdjust[npcState] || 1.0;
  let npcFinalScale = npcBaseScale * npcAdjust;
  let npcDisplayWidth = npcActiveW * npcFinalScale;
  let npcDisplayHeight = npcActiveH * npcFinalScale;
  
  // 角色 2 的 Y 軸座標貼齊畫布最底端
  let npcPosY = height - npcDisplayHeight;
  let npcSourceX = npcCurrentFrame * npcActiveW;
  
  // 更新角色 2 的即時碰撞邊界框，供魔法特效進行碰撞偵測
  npcBounds = {
    x: npcX,
    y: npcPosY,
    width: npcDisplayWidth,
    height: npcDisplayHeight
  };
  
  // 讓角色 2 自動面向角色 1 的方向
  let npcFacing = (charX >= npcX) ? 1 : -1;
  
  // 繪製角色 2（只有當角色 2 進入可視畫布範圍附近時才繪製）
  if (npcX + npcDisplayWidth > 0 && npcX - npcDisplayWidth < width) {
    push();
    translate(npcX, npcPosY);
    scale(npcFacing, 1);
    image(
      npcActiveSheet,
      -npcDisplayWidth / 2,
      0,
      npcDisplayWidth,
      npcDisplayHeight,
      npcSourceX,
      0,
      npcActiveW,
      npcActiveH
    );
    pop();
  }
  
  // 控制角色 2 的動畫幀數切換
  if (frameCount % animationSpeed === 0) {
    if (npcState === 'die') {
      // 播放 2/die/die.png（15 張），播完後停留在最後一格直到 KO 顯示結束再恢復 stop.png
      if (npcCurrentFrame < npcDieTotalFrames - 1) {
        npcCurrentFrame++;
      }
    } else {
      npcCurrentFrame = (npcCurrentFrame + 1) % npcActiveFrames;
    }
  }
  
  // =========================================================================
  // 【5. 角色 1 特效發射與繪製】
  // =========================================================================
  if (charState === 'magic' && currentFrame === 5 && !hasSpawnedEffect) {
    spawnMagicEffect(charX, posY, displayWidth, displayHeight, facingDirection, baseScale);
    hasSpawnedEffect = true;
    isAirCasting = false;
  }
  
  // 繪製角色 1
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
  
  // 控制角色 1 動畫幀數切換
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
  
  // 更新並繪製畫面上所有的魔法特效（包含偵測是否擊中角色 2）
  updateAndDrawEffects();
  
  // =========================================================================
  // 【6. 繪製行為主義測驗介面與大大的 KO 特效】
  // =========================================================================
  if (showQuiz && currentQuestionIndex !== -1) {
    drawBehaviorismQuiz();
  }
  
  // 若玩家答對或用魔法擊中角色 2，在畫面中央顯示大大的「KO!」，並在計時結束後恢復 2/stop/stop.png
  if (quizFeedback === 'correct') {
    drawBigKO();
    koTimer--;
    if (koTimer <= 0) {
      quizFeedback = '';
      showQuiz = false;
      npcState = 'stop'; // 顯示完後恢復 2/stop/stop.png
      npcCurrentFrame = 0;
    }
  }
}

// 【共用觸發函式】讓角色 2 顯示 2/die/die.png 並在螢幕顯示大大的 KO!
function triggerNpcKO() {
  quizFeedback = 'correct';
  showQuiz = false; // 關閉測驗題目框
  npcState = 'die'; // 角色 2 切換為 2/die/die.png
  npcCurrentFrame = 0; // 從第 1 張倒地圖片開始播放
  koTimer = 110; // 設定 KO 特效與倒地動畫顯示約 1.8 秒（110 幀）後恢復 2/stop/stop.png
}

// 隨機抽取與上一題不同的行為主義題目
function pickNewQuestion() {
  let nextIndex;
  do {
    nextIndex = floor(random(behaviorismQuestions.length));
  } while (nextIndex === currentQuestionIndex && behaviorismQuestions.length > 1);
  currentQuestionIndex = nextIndex;
}

// 繪製行為主義測驗視窗與選項按鈕（響應式設計，適應各種載具螢幕）
function drawBehaviorismQuiz() {
  let qData = behaviorismQuestions[currentQuestionIndex];
  
  let boxW = min(width * 0.85, 620);
  let boxH = min(height * 0.55, 360);
  let boxX = (width - boxW) / 2;
  let boxY = height * 0.08;
  
  push();
  fill(20, 33, 61, 230);
  stroke(255);
  strokeWeight(3);
  rect(boxX, boxY, boxW, boxH, 16);
  
  noStroke();
  fill(252, 163, 17);
  textAlign(LEFT, TOP);
  textSize(max(16, boxW * 0.032));
  textStyle(BOLD);
  text("【行為主義小測驗】請點擊正確答案：", boxX + 24, boxY + 18);
  
  fill(255);
  textStyle(NORMAL);
  textSize(max(15, boxW * 0.028));
  text(qData.question, boxX + 24, boxY + 52, boxW - 48, boxH * 0.25);
  
  if (quizFeedback === 'wrong') {
    fill(255, 107, 107);
    textAlign(RIGHT, TOP);
    textStyle(BOLD);
    text("答錯囉！再試一次～", boxX + boxW - 24, boxY + 18);
  }
  
  optionBoxes = [];
  let startOptY = boxY + boxH * 0.36;
  let optH = (boxH * 0.56) / 4 - 8;
  let optW = boxW - 48;
  
  for (let i = 0; i < qData.options.length; i++) {
    let optX = boxX + 24;
    let optY = startOptY + i * (optH + 8);
    
    let isHover = (mouseX >= optX && mouseX <= optX + optW && mouseY >= optY && mouseY <= optY + optH);
    
    if (isHover) {
      fill(72, 202, 228, 220);
    } else {
      fill(255, 255, 255, 35);
    }
    
    stroke(255, 180);
    strokeWeight(1.5);
    rect(optX, optY, optW, optH, 8);
    
    noStroke();
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(max(14, boxW * 0.025));
    text(qData.options[i], optX + 16, optY + optH / 2);
    
    optionBoxes.push({ x: optX, y: optY, w: optW, h: optH, index: i });
  }
  pop();
}

// 繪製大大的「KO!」文字特效
function drawBigKO() {
  push();
  let pulse = 1 + sin(frameCount * 0.3) * 0.08;
  translate(width / 2, height * 0.42);
  scale(pulse);
  
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(min(width, height) * 0.25);
  
  stroke(180, 0, 0);
  strokeWeight(14);
  fill(255, 214, 10);
  text("KO!", 0, 0);
  pop();
}

// mousePressed 事件：處理玩家點擊測驗選項
function mousePressed() {
  if (showQuiz && quizFeedback !== 'correct' && currentQuestionIndex !== -1) {
    let qData = behaviorismQuestions[currentQuestionIndex];
    
    for (let box of optionBoxes) {
      if (mouseX >= box.x && mouseX <= box.x + box.w && mouseY >= box.y && mouseY <= box.y + box.h) {
        if (box.index === qData.answer) {
          // 答對題目，呼叫共用函式觸發角色 2 倒地與 KO!
          triggerNpcKO();
        } else {
          quizFeedback = 'wrong';
          npcState = 'smile';
          npcCurrentFrame = 0;
        }
        break;
      }
    }
  }
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

// 更新位置、播放動畫、偵測擊中角色 2 並繪製所有魔法特效的函式
function updateAndDrawEffects() {
  for (let i = effects.length - 1; i >= 0; i--) {
    let eff = effects[i];
    eff.x += eff.dir * eff.speed;
    
    if (frameCount % animationSpeed === 0) {
      eff.frame = (eff.frame + 1) % effectTotalFrames;
    }
    
    // 【魔法特效與角色 2 碰撞偵測】
    // 計算魔法特效的左右上下邊界
    let effLeft = eff.x - eff.width * 0.35;
    let effRight = eff.x + eff.width * 0.35;
    let effTop = eff.y;
    let effBottom = eff.y + eff.height;
    
    // 計算角色 2 的左右上下邊界（稍微內縮判定框讓視覺命中更精準）
    let npcLeft = npcBounds.x - npcBounds.width * 0.35;
    let npcRight = npcBounds.x + npcBounds.width * 0.35;
    let npcTop = npcBounds.y;
    let npcBottom = npcBounds.y + npcBounds.height;
    
    // 判斷兩個矩形是否發生重疊（碰撞命中）
    let isHitNpc = (
      effRight > npcLeft &&
      effLeft < npcRight &&
      effBottom > npcTop &&
      effTop < npcBottom
    );
    
    // 若魔法特效擊中角色 2：
    if (isHitNpc) {
      // 移除該發擊中的魔法特效
      effects.splice(i, 1);
      // 觸發角色 2 顯示 2/die/die.png 並在螢幕顯示大大的 KO!
      triggerNpcKO();
      continue; // 跳過本次繪製，繼續檢查下一發特效
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
    
    // 超出畫布左右邊界則移除特效
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
  
  charX = relativeX * width;
  bgWidth = max(bgImg.width * (height / bgImg.height), width);
  bgOffsetX = relativeBgOffset * bgWidth;
}