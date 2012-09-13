// ----------------------------------------------------------------------------
//     Entities
// ----------------------------------------------------------------------------

var Entity = function(name, pos) {
    this.name = name;
    this.pos  = pos;
};
Entity.prototype.distance = function(other) {
    if (typeof other !== Entity)
        return 0;
    return Math.sqrt(Math.exp(this.pos.x - other.pos.x, 2)
                    ,Math.exp(this.pos.y - other.pos.y, 2));
};
Entity.prototype.toString = function() {
    return 'Ent:["'+this.name+'" @ ('+pos.x+','+pos.y+')]';
};


// ----------------------------------------------------------------------------
var Tree = function(type, pos) {
    this.pos  = pos;
    this.type = type;
};
Tree.prototype = new Entity("tree", {x: 0, y: 0});
Tree.prototype.constructor = Tree;
Tree.prototype.toString = function() {
    return Entity.prototype.toString().call() + ' - Tree:["'+this.type+'"]';
};


// ----------------------------------------------------------------------------

