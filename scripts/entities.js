// ----------------------------------------------------------------------------
//     Entity
// ----------------------------------------------------------------------------
var Entity = function (name, pos, image) {
    this.name   = name;
    this.pos    = pos;
    this.image  = image;
    this.width  = image.width;
    this.height = image.height;
    this.debug  = false;
    
    this.center = function () {
        return {
            x: this.pos.x + (this.width  / 2),
            y: this.pos.y + (this.height / 2)
        };
    };
    
    this.radius = function () {
        // TODO: might not be the best way to handle this 
        return Math.min(this.width / 2, this.height / 2);
    };
    
    this.overlaps = function (other) {
        return (this.distance(other) < (this.radius() + other.radius()));
    };
    
    this.distance = function (other) {
        return Math.sqrt(this.distSquared(other));
    };
    
    this.distSquared = function (other) {
        var thisCenter  = this.center(),
            otherCenter = other.center();
        return Math.pow(thisCenter.x - otherCenter.x, 2)
             + Math.pow(thisCenter.y - otherCenter.y, 2);
    };

// TODO:
//Entity.prototype.draw = function (context, srcpos, srcsize, dstpos, dstsize) { }
};

Entity.prototype.toString = function () {
    return 'Entity : [ "'+this.name+'" @ ('+this.pos.x+','+this.pos.y+') ]';
};

// ----------------------------------------------------------------------------
//     Tree
// ----------------------------------------------------------------------------
var treeImages = {
      "small"  : { x: 168, y: 24, w: 62, h: 72 }
    , "medium" : { x:   0, y: 13, w: 70, h: 83 }
    , "large"  : { x:  83, y:  0, w: 71, h: 96 }
    , "pine"   : { x: 244, y: 27, w: 39, h: 69 }
};
var treeTypes = Object.keys(treeImages);

var Tree = function (type, pos) {
    Entity.call(this, "tree", pos, images.trees_large);
    this.type = type;
    this.timer = 0;
    this.fruitTime = Math.random() * 500 + 100;
    this.fruits = [];
    this.canSwarm = true;
};

Tree.prototype.update = function () {
    this.timer += 1;
    if (this.timer > this.fruitTime) {
        this.timer = 0;
        this.fruit();
    }
    for (var i = 0; i < this.fruits.length; ++i) {
        this.fruits[i].update();
    }
};

Tree.prototype.draw = function (context) {
    context.drawImage(
              this.image       // source image
            , treeImages[this.type].x  // source x
            , treeImages[this.type].y  // source y
            , treeImages[this.type].w  // source w
            , treeImages[this.type].h  // source h
            , this.pos.x               // dest x
            , this.pos.y               // dest y
            , treeImages[this.type].w  // dest w
            , treeImages[this.type].h  // dest h
    );
};

Tree.prototype.fruit = function () {
    var fruit, numNonRotten = 0;
    for (var i = 0; i < this.fruits.length; ++i) {
        if (!this.fruits[i].rotten) {
            ++numNonRotten;
        }
    }
    if (numNonRotten < 3) {
        fruit = new Fruit("apple", this);
        fruit.pos.x += Math.random() * 40 + 10;
        fruit.pos.y += 20;
        this.fruits.push(fruit);        
    }
};

Tree.prototype.toString = function () {
    return Entity.prototype.toString.call(this)
         + " type: " + this.type + " canSwarm: " + this.canSwarm;
};


// ----------------------------------------------------------------------------
//     Fruit
// ----------------------------------------------------------------------------
/* Unused...
var fruitImages = {
      "cherry"     : { x:   0, y: 0, w: 22, h: 22 }
    , "strawberry" : { x:  24, y: 0, w: 20, h: 22 }
    , "orange"     : { x:  48, y: 0, w: 20, h: 22 }
    , "lemon"      : { x:  72, y: 0, w: 20, h: 22 }
    , "apple"      : { x:  96, y: 0, w: 20, h: 22 }
    , "grapes"     : { x: 120, y: 0, w: 18, h: 22 }
};
var fruitTypes = Object.keys(fruitImages);
*/

var Fruit = function (type, tree) {
    Entity.call(this, "fruit", Object.create(tree.pos), images.apple_good);
    this.type = type;
    this.parentTree = tree;
    this.lifetime = Math.random() * 200 + 100;
    this.age = 0;
    this.dropped = false;
    this.rotten = false;
};

Fruit.prototype.remove = function () {
     var thisIndex = this.parentTree.fruits.indexOf(this);
     this.parentTree.fruits.splice(thisIndex, 1);
};

Fruit.prototype.update = function () {
    this.age += 1;
    
    if (this.rotten) {
        if (this.age > 5*this.lifetime) {
            this.remove();
        }
    } else if (this.dropped) {
        if (this.age > 2*this.lifetime) {
            this.rotten = true;
            this.dropped = false;
            this.image = images.apple_bad;
        }
    } else if (this.age > this.lifetime) {
        this.dropped = true;
        this.pos.y += 60;
        this.image = images.apple_ok;
    }
};

Fruit.prototype.draw = function (context) {
    context.drawImage(this.image, this.pos.x, this.pos.y);
    
    if (this.debug) {
        var center = this.center(),
            radius = this.radius(),
            fullCircle = 2 * Math.PI;
            
        // Bounding circle
        context.strokeStyle = "#aaaa00";
        context.beginPath();
        context.arc(center.x, center.y, radius, 0, fullCircle);
        context.closePath();
        context.stroke();

        // Center pos
        context.fillStyle = "#0000aa";
        context.beginPath();
        context.arc(center.x, center.y, 3, 0, fullCircle);
        context.closePath();
        context.stroke();
        context.fill();
    }
};

Fruit.prototype.toString = function () {
    return Entity.prototype.toString.call(this)+' type: '+this.type;
};


// ----------------------------------------------------------------------------
//     GasCloud
// ----------------------------------------------------------------------------
var GasCloud = function (pos, dir) {
    Entity.call(this, "gascloud", pos, images.bubble);
    this.pos    = pos;
    this.dir    = dir;
    this.width  = 8;
    this.height = 8;
    this.maxSize = { w: 128, h: 128 };
    this.speed  = 4.5;
    this.age    = 0;
    this.maxAge = 200;
    this.expand = 0.75;
};

GasCloud.prototype.update = function () {
    // Expand and dissapate over time
    // TODO: should probably age as function of elapsed time, 
    //       not elapsed num frames
    if (++this.age < this.maxAge) {
        // Update position
        this.pos.x += this.dir.x * this.speed;
        this.pos.y += this.dir.y * this.speed;
        
        // Update size
        this.width  += this.expand;
        this.height += this.expand;
        if (this.width  > this.maxSize.w) { this.width  = this.maxSize.w; }
        if (this.height > this.maxSize.h) { this.height = this.maxSize.h; }

        // Slow down
        this.speed *= 0.98;
        
        // This cloud is not too old yet
        return true;
    } else {
        // This cloud is too old and should be removed
        return false;
    }
};

GasCloud.prototype.draw = function (context) {
    context.globalAlpha = (this.maxAge - this.age) / this.maxAge;
    context.drawImage(this.image, 
        this.pos.x, this.pos.y,
        this.width, this.height
    );
    context.globalAlpha = 1.0;
    
    if (this.debug) {
        var center = this.center(),
            radius = this.radius(),
            fullCircle = 2 * Math.PI;
            
        // Bounding circle
        context.strokeStyle = "#aaaa00";
        context.beginPath();
        context.arc(center.x, center.y, radius, 0, fullCircle);
        context.closePath();
        context.stroke();

        // Center pos
        context.fillStyle = "#0000aa";
        context.beginPath();
        context.arc(center.x, center.y, 3, 0, fullCircle);
        context.closePath();
        context.stroke();
        context.fill();
    }
};

GasCloud.prototype.toString = function () {
    return Entity.prototype.toString.call(this)+' type: '+this.type;
};

// ----------------------------------------------------------------------------
//     Farmer
// ----------------------------------------------------------------------------
var Farmer = function (pos) {
    Entity.call(this, "farmer", pos, images.farmer);
    this.health     = 100;
    this.sprayAmt   = 100;
    this.sprayCost  = 10;
    this.topSpeed   = 4;
    this.speed      = 4;
    this.numFruits  = 0;
    this.carryLimit = 20;
};

Farmer.prototype.update = function (dir) {
    var carryingCapacityUsed = this.numFruits / this.carryLimit;
    this.speed = this.topSpeed - this.topSpeed * carryingCapacityUsed;

    if (keyState[68]) {
        this.pos.x += this.speed;
    }
    if (keyState[65]) {
        this.pos.x -= this.speed;
    }
    if (keyState[87]) {
        this.pos.y -= this.speed;
    }
    if (keyState[83]) {
        this.pos.y += this.speed;
    }
};

Farmer.prototype.draw = function (context) {
    context.drawImage(this.image, this.pos.x, this.pos.y);
    
    if (this.debug) {
        var center = this.center(),
            radius = this.radius(),
            fullCircle = 2 * Math.PI;
            
        // Bounding circle
        context.strokeStyle = "#aaaa00";
        context.beginPath();
        context.arc(center.x, center.y, radius, 0, fullCircle);
        context.closePath();
        context.stroke();

        // Center pos
        context.fillStyle = "#0000aa";
        context.beginPath();
        context.arc(center.x, center.y, 3, 0, fullCircle);
        context.closePath();
        context.stroke();
        context.fill();
    }
};

Farmer.prototype.spray = function (dir) {
    this.sprayAmt -= this.sprayCost;
    return new GasCloud(this.center(), dir);
};

Farmer.prototype.handleClick = function (clickPos) {
    if (this.sprayAmt <= 0) {
        return null;
    }
    
    var center = this.center(),
        dir = {
            x: clickPos.x - center.x,
            y: clickPos.y - center.y
        },
        dist = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
    dir.x /= dist;
    dir.y /= dist;
    
    return this.spray(dir);
};

Farmer.prototype.toString = function () {
    return Entity.prototype.toString.call(this);
};


// ----------------------------------------------------------------------------
//     Shop
// ----------------------------------------------------------------------------
var Shop = function (pos) {
    Entity.call(this, "shop", pos, images.shop);
    stockpile: 0;
};

Shop.prototype.draw = function (context) {
    context.drawImage(this.image, this.pos.x, this.pos.y);
};

Shop.prototype.toString = function () {
    return Entity.prototype.toString.call(this);
};
