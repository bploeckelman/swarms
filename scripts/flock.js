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
    if (z < 0.0001) {
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
var Flock = function (target, initialPos, initialHealth) {
    this.target = target;
    this.pos    = initialPos;
    this.health = initialHealth;
    this.boids  = new Array(initialHealth);
};

Flock.prototype.init = function () {
    var type, pos, vel, speed;
    type  = boidTypes[Math.floor(Math.random() * boidTypes.length)];
    for (var i = 0; i < this.boids.length; ++i) {
        speed = Math.random() < 0.5 ? -1 : 1;
        pos  = {
            x: (Math.random() * 30 - 15) + this.target.pos.x + 10,
            y: (Math.random() * 30 - 15) + this.target.pos.y + 10
        };
        vel  = { x: 0, y: 0 };
        this.boids[i] = new Boid(type, pos, vel, speed);
        this.boids[i].norm();
    }
};

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
        } 
    };

    // Apply rules to each flock
    for (var i = 0; i < this.boids.length; ++i) {
        var func, vec;
        this.boids[i].norm();
        for (rule in rules) {
            func = rules[rule];
            vec  = func(this.boids[i], this.boids);
            this.boids[i].vel.x += vec.x;
            this.boids[i].vel.y += vec.y;
        }
        this.boids[i].move(canvas);
    }
};

Flock.prototype.draw = function (context) {
    for (var i = 0; i < this.boids.length; ++i) {
        this.boids[i].draw(context);
    }
    // TODO: add some debug drawing stuff like a circle around the flock, 
    //       average velocity vector, "health" (ie. num boids), etc...
};
