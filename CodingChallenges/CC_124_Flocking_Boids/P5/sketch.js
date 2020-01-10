// Flocking
// Daniel Shiffman
// https://thecodingtrain.com

// https://thecodingtrain.com/CodingChallenges/124-flocking-boids.html
// https://youtu.be/mhjuuHl6qHM
// https://editor.p5js.org/codingtrain/sketches/ry4XZ8OkN

const flock = [];

let alignSlider, cohesionSlider, separationSlider, perceptionSlider;
let alignDiv, cohesionDiv, separationDiv, perceptionDiv;

function setup() {
  createCanvas(640, 360);
  createP("Alignment");
  alignSlider = createSlider(0, 2, 1, 0.1);
  alignDiv = createDiv(alignSlider.value());
  createP("Cohesion");
  cohesionSlider = createSlider(0, 2, 1, 0.1);
  cohesionDiv = createDiv(cohesionSlider.value());
  createP("Separation");
  separationSlider = createSlider(0, 2, 1, 0.1);
  separationDiv = createDiv(separationSlider.value());
  createP('Perception Distance');
  perceptionSlider = createSlider(5, 200, 50, 5);
  perceptionDiv = createDiv(perceptionSlider.value());
  for (let i = 0; i < 200; i++) {
    flock.push(new Boid(perceptionSlider.value()));
  }
}

function draw() {
  background(51);
  for (let boid of flock) {
    boid.perceptionRadius = perceptionSlider.value();
    boid.edges();
    boid.flock(flock);
    boid.update();
    boid.show();
  }

  alignDiv.html(alignSlider.value());
  cohesionDiv.html(cohesionSlider.value());
  separationDiv.html(separationSlider.value());
  perceptionDiv.html(perceptionSlider.value());
}
