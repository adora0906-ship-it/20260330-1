let gridSize = 20;
let targetI, targetJ;
let targetColor;
let score = 0;
let gameDuration = 30; // 遊戲時長設定為 30 秒
let startTime;
let particles = [];
let comboCount = 0;
let lastClickTime = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  startTime = millis(); // 紀錄開始時間
  resetGame();
}

function resetGame() {
  // 隨機決定目標方框的索引座標
  targetI = floor(random(width / gridSize));
  targetJ = floor(random(height / gridSize));
  // 設定目標方框的底色
  targetColor = color(0, 255, 150); 
}

function draw() {
  let elapsed = (millis() - startTime) / 1000;
  let timeLeft = max(0, ceil(gameDuration - elapsed));

  background(15); // 深黑色背景

  if (timeLeft > 0) {
    let cols = ceil(width / gridSize);
    let rows = ceil(height / gridSize);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = i * gridSize;
        let y = j * gridSize;
        let centerX = x + gridSize / 2;
        let centerY = y + gridSize / 2;

        // 繪製格線
        stroke(30);
        noFill();
        rect(x, y, gridSize, gridSize);

        // 雷達邏輯：計算滑鼠與當前格子的距離
        let dMouse = dist(mouseX, mouseY, centerX, centerY);
        
        // 當滑鼠靠近格子（感應半徑約 100 像素）
        if (dMouse < 100) {
          // 計算格子與目標的距離（格數差）
          let dTarget = dist(i, j, targetI, targetJ);
          
          // 越接近目標：圓越大、顏色越紅
          let circleSize = map(dTarget, 0, 15, gridSize * 0.9, 2);
          circleSize = constrain(circleSize, 2, gridSize * 0.9);
          
          let r = map(dTarget, 0, 15, 255, 50);
          let g = map(dTarget, 0, 15, 0, 150);
          let b = map(dTarget, 0, 15, 0, 255);
          let alpha = map(dMouse, 0, 100, 255, 0); // 滑鼠越近越亮

          fill(r, g, b, alpha);
          noStroke();
          circle(centerX, centerY, circleSize);
        }
      }
    }
  } else {
    // 遊戲結束顯示
    textAlign(CENTER, CENTER);
    fill(255, 50, 50);
    textSize(64);
    text("TIME'S UP!", width / 2, height / 2 - 20);
    fill(255);
    textSize(32);
    text("Final Score: " + score, width / 2, height / 2 + 50);
    textSize(20);
    text("Click to play again", width / 2, height / 2 + 100);
  }

  // 更新與繪製粒子特效
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isFinished()) {
      particles.splice(i, 1);
    }
  }

  // 繪製 UI 資訊
  fill(255);
  noStroke();
  textSize(24);
  textAlign(LEFT, TOP);
  text("Score: " + score, 20, 20);
  text("Time: " + timeLeft + "s", 20, 50);

  // 顯示連擊資訊
  if (millis() - lastClickTime < 1000 && comboCount > 1) {
    fill(255, 255, 0);
    textSize(32);
    text("Combo x" + comboCount, 20, 85);
  } else if (millis() - lastClickTime > 1000) {
    comboCount = 0; // 超過一秒沒點擊正確，連擊重置
  }
}

function mousePressed() {
  // 如果時間結束，點擊則重啟遊戲
  if (millis() - startTime > gameDuration * 1000) {
    score = 0;
    comboCount = 0;
    lastClickTime = 0;
    startTime = millis();
    resetGame();
    return;
  }

  // 將滑鼠座標轉換為網格索引
  let i = floor(mouseX / gridSize);
  let j = floor(mouseY / gridSize);

  // 檢查是否點擊到目標方框
  if (i === targetI && j === targetJ) {
    let currentTime = millis();
    
    // 連擊判斷：如果在 1 秒內連續點擊正確
    if (currentTime - lastClickTime < 1000) {
      comboCount++;
    } else {
      comboCount = 1;
    }
    lastClickTime = currentTime;

    // 根據連擊狀態決定粒子數量與速度
    let pCount = comboCount > 1 ? 40 : 20; // 連擊時數量加倍
    let pMaxSpeed = comboCount > 1 ? 8 : 4; // 連擊時速度加倍

    // 產生粒子特效
    let centerX = targetI * gridSize + gridSize / 2;
    let centerY = targetJ * gridSize + gridSize / 2;
    for (let k = 0; k < pCount; k++) {
      particles.push(new Particle(centerX, centerY, pMaxSpeed));
    }
    
    score++;
    resetGame(); // 成功後更換目標位置
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Particle {
  constructor(x, y, maxSpeed) {
    this.x = x;
    this.y = y;
    this.vx = random(-maxSpeed, maxSpeed); // 隨機水平速度
    this.vy = random(-maxSpeed, maxSpeed); // 隨機垂直速度
    this.alpha = 255;
    this.size = random(4, 8);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 8; // 粒子逐漸變透明
  }
  display() {
    noStroke();
    fill(255, 255, 0, this.alpha); // 黃色粒子
    ellipse(this.x, this.y, this.size);
  }
  isFinished() { return this.alpha <= 0; }
}
