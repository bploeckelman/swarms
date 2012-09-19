// ----------------------------------------------------------------------------
//     Entity
// ----------------------------------------------------------------------------
var Entity = function (name, pos, image) {
    this.name = name;
    this.pos  = pos;
    this.image= image;
}

// TODO:
//Entity.prototype.draw = function (context, srcpos, srcsize, dstpos, dstsize) { }

Entity.prototype.distance = function (other) {
    return Math.sqrt(Math.exp(this.pos.x - other.pos.x, 2)
                   + Math.exp(this.pos.y - other.pos.y, 2));
}

Entity.prototype.toString = function () {
    return 'Entity : [ "'+this.name+'" @ ('+this.pos.x+','+this.pos.y+') ]';
}

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
}

Tree.prototype.update = function () {
    this.timer += 1;
    if (this.timer > this.fruitTime) {
        this.timer = 0;
        this.fruit();
    }
    for (var i = 0; i < this.fruits.length; ++i) {
        this.fruits[i].update();
    }
}

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
    for (var i = 0; i < this.fruits.length; ++i) {
        this.fruits[i].draw(context);
    }
}

Tree.prototype.fruit = function () {
    var fruit, numNonRotten = 0;
    for (var i = 0; i < this.fruits.length; ++i) {
        if (!this.fruits[i].rotten) {
            ++numNonRotten;
        }
    }
    if (numNonRotten < 3) {
        fruit = new Fruit("apple", this);
        fruit.pos.x += Math.random() * 30;
        fruit.pos.y += Math.random() * 45;
        this.fruits.push(fruit);        
    }
}

Tree.prototype.toString = function () {
    return Entity.prototype.toString.call(this)+' type: '+this.type;
}


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
}

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
}

Fruit.prototype.draw = function (context) {
    context.drawImage(this.image, this.pos.x, this.pos.y);
}

Fruit.prototype.toString = function () {
    return Entity.prototype.toString.call(this)+' type: '+this.type;
}


// ----------------------------------------------------------------------------
//     Farmer
// ----------------------------------------------------------------------------
var Farmer = function (pos) {
    Entity.call(this, "farmer", pos, images.farmer);
    this.health     = 100;
    this.spray      = 100;
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
    if (keyState[32]) {
        // TODO: spray (in what direction?)
        // TODO: how to get spray to affect flocks?
    }
}

Farmer.prototype.draw = function (context) {
    context.drawImage(this.image, this.pos.x, this.pos.y);
}

Farmer.prototype.toString = function () {
    return Entity.prototype.toString.call(this);
}
