/*global context*/
/*global images*/
/*global treeImages*/
/*global treeTypes*/
// ----------------------------------------------------------------------------
//    Level object
// ----------------------------------------------------------------------------
var Level = function (numTrees, region) {
    this.trees  = growTrees(numTrees, region);
    this.shop   = { pos : { x: 0, y: 0 } };
    this.farmer = new Farmer({ x: 0, y: 0 });
    this.flocks = new Array();
};

// ----- Level prototype methods ----------------------------------------------
Level.prototype.draw = function (context) {
    for (var i = 0; i < this.trees.length; ++i) {
        this.trees[i].draw(context);
    }    
    context.drawImage(images.shop, this.shop.pos.x, this.shop.pos.y);
    this.farmer.draw(context);
    
    for (var i = 0; i < this.flocks.length; ++i) {
        this.flocks[i].draw(context);
    }
};

Level.prototype.update = function (canvas) {
    // Update trees/fruit
    for (var i = this.trees.length - 1; i >= 0; --i) {
        this.trees[i].update();
        
        for (var j = this.trees[i].fruits.length - 1; j >= 0; --j){
            // Add a new swarm if appropriate
            if (this.trees[i].fruits[j].rotten) {
                var parentTree = this.trees[i].fruits[j].parentTree,
                    parentTreeIsSwarmed = false;
                for (var f = 0; f < this.flocks.length; ++f) {
                    if (this.flocks[f].target === parentTree) {
                        parentTreeIsSwarmed = true;
                        break;
                    }
                }
                if (!parentTreeIsSwarmed) {
                    var flock = new Flock(parentTree, 
                                          Object.create(parentTree.pos), 
                                          10);
                    flock.init();
                    this.flocks.push(flock);
                }
            }
            
            // Check each dropped fruit for collision with the player        
            if (collides(this.farmer, this.trees[i].fruits[j]) &&
                this.trees[i].fruits[j].dropped) {
                this.trees[i].fruits[j].remove();
            }
        }
    }
    
    // Update flocks
    for (var i = 0; i < this.flocks.length; ++i) {
        this.flocks[i].update(canvas);
    }
    
    // Update the player
    this.farmer.update();
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


//This is for pixel perfect collision, based on having an alpha value of Zero
//Adapted from Per-Pixel Image Collision Detection on playmycode.com
function collides (ent0, ent1) {
    var x0 = Math.round(ent0.pos.x),
        x1 = Math.round(ent1.pos.x),
        y0 = Math.round(ent0.pos.y),
        y1 = Math.round(ent1.pos.y),
        w0 = ent0.image.width,
        w1 = ent1.image.width,
        h0 = ent0.image.height,
        h1 = ent1.image.height;

    var xMin = Math.max( x0, x1 ),
        yMin = Math.max( y0, y1 ),
        xMax = Math.min( x0 + w0, x1 + w1 ),
        yMax = Math.min( y0 + h0, y1 + h1 );

    if ( xMin >= xMax || yMin >= yMax ) {
        return false;
    }

    //HACK: This seems like a really hacky way to access pixel data, but seems
    //to be the best one I could figure out
    var context = document.getElementById('canvas').getContext('2d');
    context.drawImage(ent0.image, ent0.pos.x, ent0.pos.y);
    var pixels0 = context.getImageData(0, 0, w0, h0);
    context.drawImage(ent1.image, ent1.pos.x, ent1.pos.y);
    var pixels1 = context.getImageData(0, 0, w1, h1);

    for( var pixX = xMin; pixX < xMax; pixX++) {
        for (var pixY = yMin; pixY < yMax; pixY++) {
            if ( (pixels0[((pixX - x0) + (pixY - y0)*w0 )*4 + 3] !== 0 ) &&
                 (pixels1[((pixX - x1) + (pixY - y1)*w1 )*4 + 3] !== 0 ) ) {
                     return true;
            }
        }
    }
    return false;
}