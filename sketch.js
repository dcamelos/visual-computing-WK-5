let pg;
let grid, next;
var dA = 1;
var dB = 0.5;
var feed = 0.025;
var k = 0.06;
let obj;
let dASlider, dBSlider, feedSlider, kSlider;
let dALabel, dBLabel, feedLabel, kLabel;
let resetButton, clearButton;

function preload() {

  obj = loadModel('tiger.obj', true);
}

function setup() {
  createCanvas(640, 480, WEBGL);
  noStroke();
  pg = createGraphics(200, 200);
  pg.pixelDensity(1);
  dASlider = createSlider(0, 1.16, dA, 0.01);
  dASlider.position(660, 30);
  dALabel = createP('dA: ' + dASlider.value());
  dALabel.position(660, 0);

  dBSlider = createSlider(0, 1, dB, 0.01);
  dBSlider.position(660, 80);
  dBLabel = createP('dB: ' + dBSlider.value());
  dBLabel.position(660, 50);

  feedSlider = createSlider(0, 0.1, feed, 0.001);
  feedSlider.position(660, 140);
  feedLabel = createP('Feed: ' + feedSlider.value());
  feedLabel.position(660, 110);

  kSlider = createSlider(0, 0.08, k, 0.001);
  kSlider.position(660, 200);
  kLabel = createP('Kill: ' + kSlider.value());
  kLabel.position(660, 170);

  resetButton = createButton("Reiniciar");
  resetButton.position(660, 240);
  resetButton.mousePressed(resetSimulation);

  clearButton = createButton("Limpiar");
  clearButton.position(660, 280);
  clearButton.mousePressed(clearSimulation);
  initSimulation();
}

function initSimulation() {
  grid = [];
  next = [];
  for (let x = 0; x < pg.width; x++) {
    grid[x] = [];
    next[x] = [];
    for (let y = 0; y < pg.height; y++) {
      grid[x][y] = { a: 1, b: 0 };
      next[x][y] = { a: 1, b: 0 };
    }
  }
  for (let x = 30; x < 170; x++) {
    grid[x][15].b = 1;
    grid[x][16].b = 1;
  }
}

function resetSimulation() {
  initSimulation();
}

function clearSimulation() {
  grid = [];
  next = [];
  for (let x = 0; x < pg.width; x++) {
    grid[x] = [];
    next[x] = [];
    for (let y = 0; y < pg.height; y++) {
      grid[x][y] = { a: 1, b: 0 };
      next[x][y] = { a: 1, b: 0 };
    }
  }
}

function draw() {
  background(51);
  orbitControl();
  dA = dASlider.value();
  dB = dBSlider.value();
  feed = feedSlider.value();
  k = kSlider.value();
  dALabel.html('dA: ' + dA);
  dBLabel.html('dB: ' + dB);
  feedLabel.html('Feed: ' + feed);
  kLabel.html('Kill: ' + k);
  ambientLight(51, 51, 51);
  directionalLight(128, 128, 128, 0, 1, 0);
  pointLight(255, 255, 255,
      mouseX - width / 2,
      mouseY - height / 2,
      150);
  spotLight(255, 0, 0,
    mouseX - width / 2 + 50,
    mouseY - height / 2,
    150,
    0, 0, -1,
    PI / 32);
  for (let iter = 0; iter < 40; iter++) {
    for (let x = 1; x < pg.width - 1; x++) {
      for (let y = 1; y < pg.height - 1; y++) {
        let a = grid[x][y].a;
        let b = grid[x][y].b;
        next[x][y].a = a + (dA * laplaceA(x, y)) - (a * b * b) + (feed * (1 - a));
        next[x][y].b = b + (dB * laplaceB(x, y)) + (a * b * b) - ((k + feed) * b);
        next[x][y].a = constrain(next[x][y].a, 0, 1);
        next[x][y].b = constrain(next[x][y].b, 0, 1);
      }
    }
    swap();
  }

  pg.loadPixels();
  for (let x = 0; x < pg.width; x++) {
    for (let y = 0; y < pg.height; y++) {
      let index = (x + y * pg.width) * 4;
      let a = grid[x][y].a;
      let b = grid[x][y].b;
      let c = floor((a - b) * 255);
      c = constrain(c, 0, 255);
      if (c < 128) {
        pg.pixels[index + 0] = 0;
        pg.pixels[index + 1] = 0;
        pg.pixels[index + 2] = 0;
        pg.pixels[index + 3] = 255;
      } else {
        pg.pixels[index + 0] = 255;
        pg.pixels[index + 1] = 255;
        pg.pixels[index + 2] = 255;
        pg.pixels[index + 3] = 255;
      }
    }
  }
  pg.updatePixels();

  push();
    rotateZ(PI);
    tint(255, 165, 0);
    texture(pg);
    model(obj);
  pop();
}

function laplaceA(x, y) {
  let sumA = 0;
  sumA += grid[x][y].a * -1;
  sumA += grid[x - 1][y].a * 0.2;
  sumA += grid[x + 1][y].a * 0.2;
  sumA += grid[x][y + 1].a * 0.2;
  sumA += grid[x][y - 1].a * 0.2;
  sumA += grid[x - 1][y - 1].a * 0.05;
  sumA += grid[x + 1][y - 1].a * 0.05;
  sumA += grid[x + 1][y + 1].a * 0.05;
  sumA += grid[x - 1][y + 1].a * 0.05;
  return sumA;
}

function laplaceB(x, y) {
  let sumB = 0;
  sumB += grid[x][y].b * -1;
  sumB += grid[x - 1][y].b * 0.2;
  sumB += grid[x + 1][y].b * 0.2;
  sumB += grid[x][y + 1].b * 0.2;
  sumB += grid[x][y - 1].b * 0.2;
  sumB += grid[x - 1][y - 1].b * 0.05;
  sumB += grid[x + 1][y - 1].b * 0.05;
  sumB += grid[x + 1][y + 1].b * 0.05;
  sumB += grid[x - 1][y + 1].b * 0.05;
  return sumB;
}

function swap() {
  let temp = grid;
  grid = next;
  next = temp;
}
