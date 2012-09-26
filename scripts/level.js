/*global context*/
/*global images*/
/*global treeImages*/
/*global treeTypes*/
// ----------------------------------------------------------------------------
//    Level object
// ----------------------------------------------------------------------------
var Level = function (numTrees, region) {
    this.trees     = growTrees(numTrees, region);
    this.flocks    = [];
    this.gasclouds = [];
    this.farmer    = new Farmer({ x: 0, y: 0 });
    this.shop      = new Shop({ x: 0, y: 0 });
    this.hud       = new Textbox("Health: 100   Fruits: 0",
                                { x: region.w / 2, y: 4},
                                 300,
                                 50);
};

// ----- Level prototype methods ----------------------------------------------
Level.prototype.draw = function (context) {
    var fruits = [], i;

    // Draw all trees
    for (i = 0; i < this.trees.length; ++i) {
        this.trees[i].draw(context);
        fruits = fruits.concat(this.trees[i].fruits);
    }

    // Draw all fruits
    for (i = 0; i < fruits.length; ++i) {
        fruits[i].draw(context);
    }

    // Draw shop and player
    this.shop.draw(context);
    this.farmer.draw(context);

    // Draw all flocks
    for (i = 0; i < this.flocks.length; ++i) {
        this.flocks[i].draw(context);
    }
    
    // Draw all gas clouds
    for (i = 0; i < this.gasclouds.length; ++i) {
        this.gasclouds[i].draw(context);
    }

    // Draw HUD
    this.hud.text = "Health: " + this.farmer.health + " Fruits: " + this.farmer.numFruits;
    this.hud.draw(context);

};

Level.prototype.update = function (canvas) {
    var i, j, parentTree, parentTreeIsSwarmed, flock, cloud, tree;

    // Update trees/fruit
    for (i = this.trees.length - 1; i >= 0; --i) {
        // If tree died during update, remove it
        if (this.trees[i].update()) {
            this.trees.splice(i,1);
            continue;
        }
        
        for (j = this.trees[i].fruits.length - 1; j >= 0; --j){
            // Add a new swarm if appropriate
            if (this.trees[i].fruits[j].rotten) {
                parentTree = this.trees[i].fruits[j].parentTree,
                parentTreeIsSwarmed = false;
                
                for (var f = 0; f < this.flocks.length; ++f) {
                    // TODO: bug here somewhere, Flock.damage sometimes leaves 1 boid
                    //       lingering around with NaN position
                    if (this.flocks[f].target === parentTree
                     && this.flocks[f].health > 1) {
                        parentTreeIsSwarmed = true;
                        break;
                    }
                }
                
                if (!parentTreeIsSwarmed && parentTree.canSwarm) {
                    flock = new Flock(parentTree, Object.create(parentTree.pos), 20);
                    flock.init();
                    this.flocks.push(flock);
                }
            }
            
            // Check each dropped fruit for collision with the player        
            if (this.farmer.overlaps(this.trees[i].fruits[j]) &&
                this.trees[i].fruits[j].dropped) {
                this.trees[i].fruits[j].remove();
                ++this.farmer.numFruits;
                // TODO: make a hud and display this onscreen
                console.log("carrying " + this.farmer.numFruits + " fruits");
            }
        }
    }
    
    // Update flocks
    for (i = 0; i < this.flocks.length; ++i) {
        this.flocks[i].update(canvas);
    }
    
    // Update the player
    this.farmer.update();

    // Check for player-shop collision
    if (this.farmer.overlaps(this.shop)) {
        // TODO: track cash for dropoffs?
        if (this.farmer.numFruits > 0) {
            console.log("cashing in " + this.farmer.numFruits + " fruits");
            this.shop.stockpile += this.farmer.numFruits;
            this.farmer.numFruits = 0;
        }
    }
    
    // Update the gas clouds
    for (i = 0; i < this.gasclouds.length; ++i) {
        cloud = this.gasclouds[i];
        if (cloud.update()) {
            // Handle collision with flocks
            for (j = 0; j < this.flocks.length; ++j) {
                flock = this.flocks[j];
                if (cloud.overlaps(flock)) {
                    flock.damage(.025);
                    // TODO: bug here somewhere, Flock.damage sometimes leaves 1 boid
                    //       lingering around with NaN position, also flocks don't
                    //       respawn consistently and I'm not sure why yet.
                    if (flock.health <= 1) {
                        // Make it so that the dead flock's target (should be tree)
                        // can't spawn new swarms for a few seconds
                        tree = flock.target;
                        tree.canSwarm = false;
                        setTimeout(function () {
                            tree.canSwarm = true;
                        }, 5000);

                        // Remove the dead flock from the level's list of flocks
                        this.flocks.splice(j,1);
                    }
                }
            }
        } else {
            // Remove this cloud, it is too old
            this.gasclouds.splice(i, 1);
            
            // Add more spray
            // TODO: only add spray at the store?  have to pay for it?
            this.farmer.sprayAmt += this.farmer.sprayCost;
            if (this.farmer.sprayAmt > 100) {
                this.farmer.sprayAmt = 100;
            }
        }
    }
};


// ----- Helper functions -----------------------------------------------------
// growTrees() - split the region into a grid with 100x100 pixel cells,
//               then randomly pick unoccupied cells to put new trees in
function growTrees (numTrees, region) {
    var grid = [], cellsize = { w: 100, h: 100 },
        trees = [],
        pos, type,
        i, j;

    // Validate the region size
    if (region.w < cellsize.w || region.h < cellsize.h) {
        console.log("Warning: tree region too small for grid");
        return trees;
    }

    // Setup the grid array
    for (i = 0; i < (region.w / cellsize.w); ++i) {
        grid[i] = [];
        for (j = 0; j < (region.h / cellsize.h); ++j) {
            grid[i][j] = { occupied: false };
        }
    }

    // Set aside grid[0][0] for store
    grid[0][0].occupied = true;

    // Randomly place trees into unoccupied cells
    while (numTrees > 0) {
        i = Math.floor(Math.random() * (grid.length - 1));
        j = Math.floor(Math.random() * (grid[0].length - 1));

        if (grid[i][j].occupied === false) {
            pos = {
                x: i * cellsize.w + region.x,
                y: j * cellsize.h + region.y
            };
            type = treeTypes[ Math.floor(Math.random() * treeTypes.length) ];
            trees.push(new Tree(type, pos));

            grid[i][j].occupied = true;
            --numTrees;
        }
    }

    return trees;
};
