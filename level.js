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
        context.drawImage(
                  images.trees_large                // source image
                , treeImages[this.trees[i].type].x  // source x
                , treeImages[this.trees[i].type].y  // source y
                , treeImages[this.trees[i].type].w  // source w
                , treeImages[this.trees[i].type].h  // source h
                , this.trees[i].pos.x               // dest x
                , this.trees[i].pos.y               // dest y
                , treeImages[this.trees[i].type].w  // dest w
                , treeImages[this.trees[i].type].h  // dest h
        );
    }
    
    context.drawImage(images.shop, this.shop.pos.x, this.shop.pos.y);
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
