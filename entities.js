/*global treeTypes*/
// ----------------------------------------------------------------------------
//     Entity
// ----------------------------------------------------------------------------
var Entity = function (name, pos) {
    this.name = name;
    this.pos  = pos;
}

Entity.prototype.distance = function (other) {
    return Math.sqrt(Math.exp(this.pos.x - other.pos.x, 2),
                     Math.exp(this.pos.y - other.pos.y, 2));
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
    Entity.call(this, "tree", pos);
    this.type = type;
}

Tree.prototype.toString = function () {
    return Entity.prototype.toString.call(this)+' type: '+this.type;
}

// ----------------------------------------------------------------------------
