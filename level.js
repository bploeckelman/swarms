/*global context*/
/*global images*/
/*global treeImages*/
/*global treeTypes*/
// ----------------------------------------------------------------------------
//    Level object
// ----------------------------------------------------------------------------
var Level = function (numTrees, region) {

    this.trees = growTrees(numTrees, region);
    this.shop  = { pos : { x: 0, y: 0 } };

};

// ----- Level prototype methods ----------------------------------------------
Level.prototype.draw = function (context) {
    for (var i = 0; i < this.trees.length; ++i) {
        this.trees[i].draw(context);
    }    
    context.drawImage(images.shop, this.shop.pos.x, this.shop.pos.y);
};

Level.prototype.update = function () {
    for (var i = 0; i < this.trees.length; ++i) {
        this.trees[i].update();
    }
};


// ----- Helper functions -----------------------------------------------------
// TODO: make sure these are sufficiently spread out
//       and sufficiently far away from the dropoff point
function growTrees (numTrees, region) {
    var trees = [], pos, type;
    for (var i = 0; i < numTrees; ++i) {
        pos = {
            x: Math.random() * (region.w - 70) + region.x,
            y: Math.random() * (region.h - 96) + region.y
        };
        type = treeTypes[ Math.floor(Math.random() * treeTypes.length) ];
        trees.push(new Tree(type, pos));
    }
    return trees;
};
