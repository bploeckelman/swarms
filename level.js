// ----------------------------------------------------------------------------
//    Level object
// ----------------------------------------------------------------------------
var Level = function(numTrees, region) {

    this.trees = growTrees(numTrees, region);
    // TODO: add dropoff point

};


// TODO: probably move to entities.js?
// Note: image regions from trees-large.png
var treeImages = {
      "small"  : { x: 168, y: 24, w: 62, h: 72 }
    , "medium" : { x:   0, y: 13, w: 70, h: 83 }
    , "large"  : { x:  83, y:  0, w: 71, h: 96 }
    , "pine"   : { x: 244, y: 27, w: 39, h: 69 }
};
var treeTypes = Object.keys(treeImages);


// ----- Level prototype methods ----------------------------------------------
Level.prototype.draw = function(context) {

    for(var i = 0; i < this.trees.length; ++i)
    {
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
};


// ----- Helper functions -----------------------------------------------------
// TODO: make sure these are sufficiently spread out
//       and sufficiently far away from the dropoff point
function growTrees(num_trees, region) {
    var trees = [];
    for(var i = 0; i < num_trees; ++i) {
        trees.push(
            new Tree( treeTypes[Math.floor(Math.random() * treeTypes.length)]
                    , { x: Math.random() * (region.w - 70) + region.x
                      , y: Math.random() * (region.h - 96) + region.y } )
        );
    }
    return trees;
};

