

const population = 200;

var vehicles = [];
var dead = 0;
var food = [];
var poison = [];

// keep track of the largest population and the last surviving vehicle of that population
let highScore = -Infinity;
let bestVehicle;

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
let saveBestVehicleButton;
let saveConfigurationButton;
let loadButton;

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
    dead = 0;
    for (var i = 0; i < population; i++) {
      var x = random(width);
      var y = random(height);
      vehicles[i] = new Vehicle(x, y);
    }

  });

  foodDiv = createDiv('');
  foodSpawnSlider = createSlider(0, 1, 0.25, 0.005);

  poisonDiv = createDiv('');
  poisonSpawnSlider = createSlider(0, 1, 0.155, 0.005);

  reproduceDiv = createDiv('');
  reproduceSlider = createSlider(0, 2, 0.5, 0.0025);

  createP('');

  saveBestVehicleButton = createButton('Save Best Vehicle');
  saveBestVehicleButton.mousePressed(() => {
    saveBestVehicle();
  });
  saveConfigurationButton = createButton('Save Entire Configuration');
  saveConfigurationButton.mousePressed(() => {
    saveConfiguration();
  });

  createP('');
  createDiv('Load Configuration from File');

  createFileInput(loadConfigurationFromFile);
  saveBestVehicleButton.attribute('disabled', true);

  createP('');
  let loadOptimalButton = createButton('Load an Example Optimal Configuration');
  loadOptimalButton.mousePressed(loadOptimal);
}

function loadOptimal() {
  fetch('./optimal-population-configurations/configuration1.json').then(r => r.json()).then(json => {
    loadConfigurationFromJSON(json);
  });
}

function saveConfiguration() {
  saveJSON({
    foodSpawnChance: foodSpawnSlider.value(),
    poisonSpawnChance: poisonSpawnSlider.value(),
    reproduceChance: reproduceSlider.value(),
    dnas: vehicles.map(i => i.dna)
  }, 'configuration.json')
}

function p5FileDataToJson(data) {
  let contents = data.substring(data.indexOf(',') + 1);
  let string = atob(contents);
  return JSON.parse(string);
}

function loadConfigurationFromFile(file) {
  let savedState = p5FileDataToJson(file.data);
  loadConfigurationFromJSON(savedState);
}

function loadConfigurationFromJSON(json) {
  foodSpawnSlider.value(json.foodSpawnChance);
  poisonSpawnSlider.value(json.poisonSpawnChance);
  reproduceSlider.value(json.reproduceChance);
  let dnas = json.dnas;
  vehicles = [];
  for (let i = 0; i < 100; i++) {
    vehicles.push(new Vehicle(random(width), random(height), dnas[i], 0.0));
  }
}

function saveBestVehicle() {
  saveJSON({
    vehicle: {
      acceleration: [bestVehicle.acceleration.x, bestVehicle.acceleration.y, bestVehicle.acceleration.z],
      velocity: [bestVehicle.velocity.x, bestVehicle.velocity.y, bestVehicle.velocity.z],
      position: [bestVehicle.position.x, bestVehicle.position.y, bestVehicle.position.z],
      r: bestVehicle.r,
      maxspeed: bestVehicle.maxspeed,
      maxforce: bestVehicle.maxforce,

      health: bestVehicle.health,

      firstFrame: bestVehicle.firstFrame,
      lastFrame: bestVehicle.lastFrame,
      lastReproduced: bestVehicle.lastReproduced,

      dna: bestVehicle.dna
    },
    environment: {
      foodSpawnChance: foodSpawnSlider.value(),
      poisonSpawnChance: poisonSpawnSlider.value(),
      reproduceChance: reproduceSlider.value()
    }
  }, 'best-vehicle.json')
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

  if (frameCount % 60 == 0) {
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
      dead++;
      var x = vehicles[i].position.x;
      var y = vehicles[i].position.y;
      food.push(createVector(x, y));
      // if this is the largest population so far, keep track of it
      // and the last vehicle to survive in it
      highScore = dead + vehicles.length;
      if (vehicles.length == 1) {
        bestVehicle = vehicles.splice(i, 1)[0];
        saveBestVehicleButton.removeAttribute('disabled');
      } else {
        vehicles.splice(i, 1);
      }
    }
  }


  textAlign(CENTER, CENTER);
  textSize(18);
  fill(240);
  text(`${currentFPS || 0} fps`, width - 40, 15);
  if (frameCount % 10 == 0) {
    currentFPS = floor(frameRate());
  }

  text(`High Score: ${highScore || 0}`, width - 80, 40);

  textAlign(CENTER, CENTER);
  textSize(18);
  fill(240);
  text(`Pop: ${vehicles.length}`, 40, 15);

  textAlign(CENTER, CENTER);
  textSize(18);
  fill(240);
  text(`Dead: ${dead}`, 48, 40);

}
