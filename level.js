// ----------------------------------------------------------------------------
//    Level object
// ----------------------------------------------------------------------------
var Level = function(numTrees, region) {

    this.trees = growTrees(numTrees, region);
    // TODO: add dropoff point

};

Level.prototype.draw = function(context) {

    for(var i = 0; i < this.trees.length; ++i)
    {
        context.drawImage(
                  images.trees_large    // source image
                // TODO: pick image region by tree type
                // treeImages[this.trees.type].x/y/w/h
                , 0 , 13                // source x,y
                , 70, 96                // source w,h
                , this.trees[i].pos.x   // dest x
                , this.trees[i].pos.y   // dest y
                , 70, 83                // dest w,h
        );

    }
};

var treeImages = {
    // TODO: set image region according to spritesheet
      "small"  : { x: 0, y: 0, w: 0, h: 0 }
    , "medium" : { x: 0, y: 0, w: 0, h: 0 }
    , "large"  : { x: 0, y: 0, w: 0, h: 0 }
};
var treeTypes = Object.keys(treeImages);

// TODO: make sure these are sufficiently spread out
//       and sufficiently far away from the dropoff point
function growTrees(num_trees, region) {
    var trees = [];
    for(var i = 0; i < num_trees; ++i) {
        trees.push({
              type : treeTypes[Math.floor(Math.random() * treeTypes.length)]
            , pos  : { x: Math.random() * (region.w - 64) + region.x
                     , y: Math.random() * (region.h - 64) + region.y }
        });
    }
    return trees;
};

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
