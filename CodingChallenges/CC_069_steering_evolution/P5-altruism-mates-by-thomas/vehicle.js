// Daniel Shiffman
// The Coding Train
// Coding Challenge 69: Steering Evolution
// Part 1: https://youtu.be/flxOkx0yLrY
// Part 2: https://youtu.be/XaOVH8ZSRNA
// Part 3: https://youtu.be/vZUWTlK7D2Q
// Part 4: https://youtu.be/ykOcaInciBI
// Part 5: https://youtu.be/VnFF5V5DS8s

// https://editor.p5js.org/codingtrain/sketches/xgQNXkxx1

const mr = 0.01;

function Vehicle(x, y, dna) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(0, -2);
  this.position = createVector(x, y);
  this.r = 4;
  this.maxspeed = 5;
  this.maxforce = 0.5;

  this.health = 1;

  this.firstFrame = frameCount;
  this.lastFrame = frameCount + 14000; // max age is 14000 frames (233 seconds)
  this.lastReproduced = null;

  this.dna = [];
  if (dna === undefined) {
    // Food weight
    this.dna[0] = random(-2, 2);
    // Poison weight
    this.dna[1] = random(-2, 2);
    // Food perception
    this.dna[2] = random(0, 100);
    // Poision Percepton
    this.dna[3] = random(0, 100);
    // Altruism DNA:
    // determines perception radius of seeing another Vehicle
    // ALSO USED FOR REPRODUCTION!!!!
    // HAVE TO SEE ANOTHER VEHICLE TO REPRODUCE
    this.dna[4] = random(10, 110);
    // determines the probability of giving away food if coming into contact with another vehicles
    // this is the chance that a vehicle will give away food in a social way, just for merit of
    // being a vehicle. It depends on nothing
    this.dna[5] = random(0, 1);
    // desire for help. This part of the DNA is how willing the vehicle is to
    // go to another vehicle in the hopes of receiving altruism
    this.dna[6] = random(-2, 2);
    // probabilty of pity. Any vehicles encountered by this vehicle with less
    // health than this value will always be given food, regardless of this.dna[5]
    this.dna[7] = random(0, 1);
    // fecundity: desire to seek a mate. Competes with desire to
    // avoid poison and seek food and seek altruism
    this.dna[8] = random(-2, 2);
    // age of maturity: the age (in frames) at which the vehicle becomes capable of
    // reproduction. This is needed because reproduction chance needs to be high
    // since proximity is required, but early on there are too many vehicles and the
    // growth spirals
    // maturity reached in ~2 to 6 seconds of birth;
    this.dna[9] = random(2 * 60, 6 * 60);
  } else {
    // Mutation
    this.dna[0] = dna[0];
    if (random(1) < mr) {
      this.dna[0] += random(-0.1, 0.1);
    }
    this.dna[1] = dna[1];
    if (random(1) < mr) {
      this.dna[1] += random(-0.1, 0.1);
    }
    this.dna[2] = dna[2];
    if (random(1) < mr) {
      this.dna[2] += random(-10, 10);
    }
    this.dna[3] = dna[3];
    if (random(1) < mr) {
      this.dna[3] += random(-10, 10);
    }
    this.dna[4] = dna[4];
    if (random(1) < mr) {
      this.dna[4] += random(-8, 8);
    }
    this.dna[5] = dna[5];
    if (random(1) < mr) {
      this.dna[5] += random(-0.05, 0.05);
    }
    this.dna[6] = dna[6];
    if (random(1) < mr) {
      this.dna[6] += random(-0.1, 0.1);
    }
    this.dna[7] = dna[7];
    if (random(1) < mr) {
      this.dna[7] += random(-0.05, 0.05);
    }
    this.dna[8] = dna[8];
    if (random(1) < mr) {
      this.dna[8] += random(-0.1, 0.1);
    }
    this.dna[9] = dna[9];
    if (random(1) < mr) {
      this.dna[9] += random(-60, 60);
    }
  }

  // Method to update location
  this.update = function () {
    this.health -= 0.01;

    // die after 50000 frames -> reproduction is necessary
    if (frameCount > this.lastFrame) {
      this.health = -Infinity;
    }

    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset accelerationelertion to 0 each cycle
    this.acceleration.mult(0);
  };

  this.altruism = function (others) {
    /*
      alternative idea. if you are sharing food, you cannot eat it.
      in a more complicated scenario eating food counts some of the timeout
      (according to this.dna[5]) and you can keep the other half in reserve
      eating only if necessary but sharing if excess. You can also be hurt
      if you come upon someone (this.dna[4]) and cannot share any food if you
      hit the chance
    */
    for (let vehicle of others) {
      if (vehicle !== this) {
        let d = this.position.dist(vehicle.position);
        if (d < this.dna[4]) {
          if (random(1) < (this.dna[5] + this.dna[7])) {
            vehicle.health += 0.1; // half the food score
            this.health -= 0.1; // simulates sharing a piece of food by 1/2
          }
        }
      }
    }
  }

  this.applyForce = function (force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
  };

  this.behaviors = function (good, bad, potentialMates) {
    var steerG = this.eat(good, 0.2, this.dna[2]);
    var steerB = this.eat(bad, -1, this.dna[3]);
    let mateSteer = this.seekNearestVehicle(this.dna[4], 1 / (vehicles.length * reproduceSlider.value()));
    let helpSteer = this.seekNearestVehicle(this.dna[4], this.dna[5]);

    steerG.mult(this.dna[0]);
    steerB.mult(this.dna[1]);
    helpSteer.mult(this.dna[6]);
    mateSteer.mult(this.dna[8]);

    // seek help only when health is low (calculated in seekNearestVehicle)
    // and when food is far away.
    this.applyForce(steerG);
    this.applyForce(helpSteer);
    this.applyForce(steerB);
  };

  this.seekNearestVehicle = function (perceptionDistance, willingness) {
    let record = Infinity;
    let nearest = null;

    for (let other of vehicles) {
      if (other !== this) {
        let d = this.position.dist(other.position)
        if (d < record) {
          nearest = other;
          record = d;
        }
      }
    }

    // if the vehicle's health is low there is a chance they will seek
    // another vehicle as well as food or avoiding poison. This
    // is dependent on how altruistc they are themselves. More
    // altruistic vehicles seek vehicles more often, but could be burned
    // if they seek someone that is not altruistic themselves.
    if (this.health < 0.5 && record < perceptionDistance && random(1) < willingness) {
      return this.seek(nearest.position)
    } else {
      return createVector(0, 0)
    }
  }

  this.reproduce = function (population) {
    let nearest = null;
    let record = Infinity;
    for (let i = 0; i < population.length; i++) {
      if (this !== population[i]) {
        let d = this.position.dist(population[i].position);
        if (d < record) {
          record = d;
          nearest = population[i];
        }
      }
    }

    // check for perceptionRadius, then old enough to reproduce (contained in DNA) then have not recently reproduced (variable 1-3 seconds but not in DNA)
    if (record < this.dna[4] && frameCount - this.firstFrame > this.dna[9] && (frameCount - this.lastReproduced) > (60 * random(0, 2))) {
      let other = nearest.dna;
      let mine = this.dna;
      let dna = [];
      if (random(1) < 0.5) {
        for (let i = 0; i < floor(this.dna.length / 2); i++) {
          dna[i] = other[i];
        }
        for (let i = floor(this.dna.length / 2); i < this.dna.length; i++) {
          dna[i] = mine[i];
        }
      } else {
        for (let i = 0; i < floor(this.dna.length / 2); i++) {
          dna[i] = mine[i];
        }
        for (let i = floor(this.dna.length / 2); i < this.dna.length; i++) {
          dna[i] = other[i];
        }
      }

      this.lastReproduced = frameCount;
      return new Vehicle(this.position.x, this.position.y, dna);
    } else {
      return null;
    }
  };

  this.eat = function (list, nutrition, perception) {
    var record = Infinity;
    var closest = null;
    for (var i = list.length - 1; i >= 0; i--) {
      var d = this.position.dist(list[i]);

      if (d < this.maxspeed) {
        list.splice(i, 1);
        this.health += nutrition;
      } else {
        if (d < record && d < perception) {
          record = d;
          closest = list[i];
        }
      }
    }

    // This is the moment of eating!

    if (closest != null) {
      return this.seek(closest);
    }

    return createVector(0, 0);
  };

  // A method that calculates a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  this.seek = function (target) {
    var desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target

    // Scale to maximum speed
    desired.setMag(this.maxspeed);

    // Steering = Desired minus velocity
    var steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force

    return steer;
    //this.applyForce(steer);
  };

  this.dead = function () {
    return this.health < 0;
  };

  this.display = function () {
    // Draw a triangle rotated in the direction of velocity
    var angle = this.velocity.heading() + PI / 2;

    push();
    translate(this.position.x, this.position.y);
    rotate(angle);


    var gr = color(0, 255, 0);
    var rd = color(255, 0, 0);
    var col = lerpColor(rd, gr, this.health);

    fill(col);
    stroke(col);
    strokeWeight(1);
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);


    if (debug.checked()) {
      noFill();
      strokeWeight(6);
      stroke(0, 0, 255);
      line(0, 0, 0, this.dna[6] * 25);
      ellipse(0, 0, this.dna[4] * 2);
      strokeWeight(4);
      stroke(0, 255, 0);
      line(0, 0, 0, -this.dna[0] * 25);
      strokeWeight(2);
      ellipse(0, 0, this.dna[2] * 2);
      stroke(255, 0, 0);
      line(0, 0, 0, -this.dna[1] * 25);
      ellipse(0, 0, this.dna[3] * 2);
      fill(255);
      stroke(0);
      textSize(13);
      textAlign(CENTER, CENTER);
      text(`${nf(this.dna[5], 1, 2)}`, 0, 0);
    }

    pop();
  };

  this.boundaries = function () {
    var d = 25;

    var desired = null;

    if (this.position.x < d) {
      desired = createVector(this.maxspeed, this.velocity.y);
    } else if (this.position.x > width - d) {
      desired = createVector(-this.maxspeed, this.velocity.y);
    }

    if (this.position.y < d) {
      desired = createVector(this.velocity.x, this.maxspeed);
    } else if (this.position.y > height - d) {
      desired = createVector(this.velocity.x, -this.maxspeed);
    }

    if (desired !== null) {
      desired.normalize();
      desired.mult(this.maxspeed);
      var steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(this.maxforce);
      this.applyForce(steer);
    }
  };
}