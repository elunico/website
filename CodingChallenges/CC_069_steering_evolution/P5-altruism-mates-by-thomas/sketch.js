// Daniel Shiffman
// The Coding Train
// Coding Challenge 69: Steering Evolution
// Part 1: https://youtu.be/flxOkx0yLrY
// Part 2: https://youtu.be/XaOVH8ZSRNA
// Part 3: https://youtu.be/vZUWTlK7D2Q
// Part 4: https://youtu.be/ykOcaInciBI
// Part 5: https://youtu.be/VnFF5V5DS8s

// https://editor.p5js.org/codingtrain/sketches/xgQNXkxx1

const population = 100;

var vehicles = [];
var food = [];
var poison = [];

var debug;

let currentFPS;
let pauseButton;
let resetButton;

let paused = false;

let foodDiv;
let poisonDiv;
let reproduceDiv;

let foodSpawnSlider;
let poisonSpawnSlider;
let reproduceSlider;

function setup() {
  createCanvas(640, 360);
  for (var i = 0; i < population; i++) {
    var x = random(width);
    var y = random(height);
    vehicles[i] = new Vehicle(x, y);
  }

  for (var i = 0; i < 40; i++) {
    var x = random(width);
    var y = random(height);
    food.push(createVector(x, y));
  }

  for (var i = 0; i < 20; i++) {
    var x = random(width);
    var y = random(height);
    poison.push(createVector(x, y));
  }

  debug = createCheckbox('Debug Visualization');
  // debug.checked(true);

  pauseButton = createButton('Pause');
  pauseButton.mousePressed(() => {
    if (paused) {
      loop();
      pauseButton.html('Pause');
    } else {
      noLoop();
      pauseButton.html("Resume");
    }
    paused = !paused;
  });

  resetButton = createButton('Reset population');
  resetButton.mousePressed(() => {
    vehicles = [];
    for (var i = 0; i < population; i++) {
      var x = random(width);
      var y = random(height);
      vehicles[i] = new Vehicle(x, y);
    }

  });

  foodDiv = createDiv('');
  foodSpawnSlider = createSlider(0, 1, 0.15, 0.005);

  poisonDiv = createDiv('');
  poisonSpawnSlider = createSlider(0, 1, 0.05, 0.005);

  reproduceDiv = createDiv('');
  reproduceSlider = createSlider(0, 25, 1, 0.1);

}

function mouseDragged() {
  vehicles.push(new Vehicle(mouseX, mouseY));
}

function draw() {
  background(51);


  foodDiv.html(`Chance of food spawn: ${foodSpawnSlider.value()}`)
  poisonDiv.html(`Chance of poison spawn: ${poisonSpawnSlider.value()}`)
  reproduceDiv.html(`When near another vehicle, chance of reproduction is 1 / (population size * ${reproduceSlider.value()})`)

  if (random(1) < foodSpawnSlider.value()) {
    var x = random(width);
    var y = random(height);
    food.push(createVector(x, y));
  }

  if (random(1) < poisonSpawnSlider.value()) {
    var x = random(width);
    var y = random(height);
    poison.push(createVector(x, y));
  }

  if (frameCount % 120 == 0) {
    poison.splice(0, 1);
  }

  for (var i = 0; i < food.length; i++) {
    fill(0, 255, 0);
    noStroke();
    ellipse(food[i].x, food[i].y, 4, 4);
  }

  for (var i = 0; i < poison.length; i++) {
    fill(255, 0, 0);
    noStroke();
    ellipse(poison[i].x, poison[i].y, 4, 4);
  }

  for (var i = vehicles.length - 1; i >= 0; i--) {
    vehicles[i].boundaries();
    vehicles[i].behaviors(food, poison);
    vehicles[i].update();
    vehicles[i].altruism(vehicles);
    vehicles[i].display();

    var newVehicle = vehicles[i].reproduce(vehicles);
    if (newVehicle != null) {
      vehicles.push(newVehicle);
    }

    if (vehicles[i].dead()) {
      var x = vehicles[i].position.x;
      var y = vehicles[i].position.y;
      food.push(createVector(x, y));
      vehicles.splice(i, 1);
    }
  }

  textAlign(CENTER, CENTER);
  textSize(18);
  fill(240);
  text(`${currentFPS || 0} fps`, width - 35, 15);
  if (frameCount % 10 == 0) {
    currentFPS = floor(frameRate());
  }

  textAlign(CENTER, CENTER);
  textSize(18);
  fill(240);
  text(`Pop: ${vehicles.length}`, 35, 15);

}