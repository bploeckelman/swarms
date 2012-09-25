/*global images*/
// ----------------------------------------------------------------------------
//     Boid
// ----------------------------------------------------------------------------
var boidImages = {
    "normal" : images.boid_yellow,
    "biting" : images.boid_orange,
    "poison" : images.boid_red
};
var boidTypes = Object.keys(boidImages);

var Boid = function (type, initialPos, initialVel, maxSpeed) {
    this.type  = type;
    this.image = boidImages[type];
    this.pos   = initialPos;
    this.vel   = initialVel;
    this.speed = maxSpeed;
};

Boid.prototype.draw = function (context) {
    context.drawImage(this.image, this.pos.x, this.pos.y);

    context.strokeStyle = "rgb(0,0,0)";
    context.beginPath();
    context.moveTo(this.pos.x + 8, this.pos.y + 8);
    context.lineTo(this.pos.x + 8 + 8 * this.vel.x, this.pos.y + 8 + 8 * this.vel.y);
    context.closePath();
    context.stroke();
}

Boid.prototype.move = function (canvas) {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    if (this.pos.x > canvas.width) {
        if (this.vel.x > 0) {
            this.vel.x *= -1;
        }
    }
    if (this.pos.y > canvas.height) {
        if (this.vel.y > 0) {
            this.vel.y *= -1;
        }
    }
    
    if (this.pos.x < 0) {
        if (this.vel.x < 0) {
            this.vel.x *= -1;
        }
    }
    if (this.pos.y < 0) {
        if (this.vel.y < 0) {
            this.vel.y *= -1;
        }
    }
}

Boid.prototype.norm = function () {
    var z = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
    if (z < 0.001) {
        this.vel.x = (Math.random() - 0.5) * this.speed;
        this.vel.y = (Math.random() - 0.5) * this.speed;
        this.norm();
    } else {
        z = this.speed / z;
        this.vel.x *= z;
        this.vel.y *= z;
    }
}

// ----------------------------------------------------------------------------
//     Flock
// ----------------------------------------------------------------------------
var Flock = function (target, initialPos, numBoids) {
    this.target = target;
    this.pos    = initialPos;
    this.origin = initialPos;
    this.health = numBoids;
    this.accum = 0.0;
    this.rad    = 1.0;
    this.boids  = new Array(numBoids);
    // TODO: bug in debug drawing context.arc gives index size error?
    this.debug  = false;

    // These are functions so as to interact with Entity.overlaps()
    this.center = function () { return this.origin; };
    this.radius = function () { return this.rad; };
};

Flock.prototype.init = function () {
    var type, pos, vel, speed;
    type  = boidTypes[Math.floor(Math.random() * boidTypes.length)];
    for (var i = 0; i < this.boids.length; ++i) {
        speed = 1.75;
        pos  = {
            x: (Math.random() * 30 - 15) + this.target.pos.x + 20,
            y: (Math.random() * 30 - 15) + this.target.pos.y + 20
        };
        vel  = { x: 0, y: 0 };
        this.boids[i] = new Boid(type, pos, vel, speed);
        this.boids[i].norm();
    }
};

Flock.prototype.damage = function (amount) {
    this.health -= amount;
    this.accum += amount;
    if (this.accum > 1) {
        this.boids.splice(0, Math.floor(this.accum));
        this.accum = 0.0;
    }
}

Flock.prototype.update = function (canvas) {
    // Calculate center of mass of flock
    var sumOfPositions = { x: 0, y: 0 };
    for(var i = 0; i < this.boids.length; ++i) {
        sumOfPositions.x += this.boids[i].pos.x;
        sumOfPositions.y += this.boids[i].pos.y;
    }
    var centerOfMass = {
        x: sumOfPositions.x / this.boids.length,
        y: sumOfPositions.y / this.boids.length
    }; 

    // Define a series of rule functions that generate steering vectors
    var rules = {
        // Keep some distance from the other members of the flock
        "separate" : function (boid, boids) {
            var orientation = { x: 0, y: 0 };
            for(var i = 0; i < boids.length; ++i) {
                var b = boids[i];
                if (b === boid) continue;
                var dx = b.pos.x - boid.pos.x;
                var dy = b.pos.y - boid.pos.y;
                var d = Math.sqrt(dx*dx + dy*dy);
                if (d < 20) {
                    orientation.x -= (b.pos.x - boid.pos.x);
                    orientation.y -= (b.pos.y - boid.pos.y);
                }
            }
            orientation.x /= 50;
            orientation.y /= 50;
            return orientation;
        },
        // Align with perceived velocity of flock
        // ie. average velocity of flock excluding this boid
        "align" : function (boid, boids) {
            var orientation  = { x: 0, y: 0 };
            var percievedVel = { x: 0, y: 0 };
            for(var i = 0; i < boids.length; ++i) {
                var b = boids[i];
                if (b === boid) continue;
                percievedVel.x += b.vel.x;
                percievedVel.y += b.vel.y;
            }
            percievedVel.x /= (boids.length - 1);
            percievedVel.y /= (boids.length - 1);
            orientation.x = (percievedVel.x - boid.vel.x) / 50;
            orientation.y = (percievedVel.y - boid.vel.y) / 50;
            return orientation;
        },
        // Steer towards average position of flockmates
        "cohere" : function (boid, boids) {
            var sumOfOtherPositions = {
                x: sumOfPositions.x - boid.pos.x,
                y: sumOfPositions.y - boid.pos.y
            };
            var perceivedCenterOfMass = {
                x: sumOfOtherPositions.x / (boids.length - 1),
                y: sumOfOtherPositions.y / (boids.length - 1)
            };
            var orientation = {
                x: (perceivedCenterOfMass.x - boid.pos.x) / 1000.0,
                y: (perceivedCenterOfMass.y - boid.pos.y) / 1000.0
            };
            return orientation;
        },
        // Steer towards the flock's target
        "target" : function (boid, boids, flock) {
            var orientation = {
                // FIXME: this +30 business is to target nearer the center of a tree
                //        all the images should have a nicer way to get center pos + size
                x: (flock.target.pos.x + 30 - boid.pos.x) / 100,
                y: (flock.target.pos.y + 30 - boid.pos.y) / 100
            };
            return orientation;
        }
    };

    // Apply rules to each flock
    for (var i = 0; i < this.boids.length; ++i) {
        var func, vec;
        for (rule in rules) {
            func = rules[rule];
            vec  = func(this.boids[i], this.boids, this);
            this.boids[i].vel.x += vec.x;
            this.boids[i].vel.y += vec.y;
        }
        this.boids[i].norm();
        this.boids[i].move(canvas);
    }

    // Damage the flock's target
    if (this.boids[0].type === "normal") {
        this.target.damage(0.025);
    } else if (this.boids[0].type === "biting") {
        this.target.damage(0.05);
    } else if (this.boids[0].type === "poison") {
        this.target.damage(0.075);
    }
};

Flock.prototype.draw = function (context) {
    var min = { x: Number.MAX_VALUE, y: Number.MAX_VALUE },
        max = { x: Number.MIN_VALUE, y: Number.MIN_VALUE },
        avgVel = { x: 0, y: 0 },
        dist = 0,
        fullCircle = 2 * Math.PI;

    for (var i = 0; i < this.boids.length; ++i) {
        this.boids[i].draw(context);

        // Calculate min and max boid position
        min.x = Math.min(min.x, this.boids[i].pos.x + 16);
        min.y = Math.min(min.y, this.boids[i].pos.y + 16);
        max.x = Math.max(max.x, this.boids[i].pos.x);
        max.y = Math.max(max.y, this.boids[i].pos.y);

        if (this.debug === true) {
            // Sum velocities for each boid for average velocity calculation
            avgVel.x += this.boids[i].vel.x;
            avgVel.y += this.boids[i].vel.y;
        }
    }

    // TODO: add some debug drawing stuff like "health" (ie. num boids), etc...

    // Calculate center position and radius of bounding circle for flock
    this.origin.x = ((max.x - min.x) / 2) + min.x;
    this.origin.y = ((max.y - min.y) / 2) + min.y;
    this.rad = Math.max(max.x - min.x, max.y - min.y);

    if (this.debug === true) {
        // Flock bounding circle
        context.strokeStyle = "#999900";
        context.beginPath();
        context.arc(this.origin.x, this.origin.y, this.rad, 0, fullCircle);
        context.closePath();
        context.stroke();

        // Flock center pos
        context.fillStyle = "#000099";
        context.beginPath();
        context.arc(this.origin.x, this.origin.y, 3, 0, fullCircle);
        context.closePath();
        context.stroke();
        context.fill();

        // Calculate average velocity of flock and draw a vector for it
        dist = Math.sqrt(avgVel.x * avgVel.x + avgVel.y * avgVel.y);
        avgVel.x /= dist;
        avgVel.y /= dist;
        context.strokeStyle = "#009999";
        context.beginPath();
        context.moveTo(this.origin.x, this.origin.y);
        context.lineTo(this.origin.x + this.rad * avgVel.x,
                       this.origin.y + this.rad * avgVel.y);
        context.closePath();
        context.stroke();
    }
};

Flock.prototype.toString = function () {
    return "Flock: health=" + this.health
          + " center=" + this.origin.x + "," + this.origin.y
          + " radius=" + this.rad;
};
