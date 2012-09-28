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
    this.shopOpen  = false;
    this.onShop    = false;
    this.farmer    = new Farmer({ x: 75, y: 75 }, this.trees);
    this.shop      = new Shop({ x: 0, y: 0 });
    this.gameOver  = false;
    this.shopDialog= new Menubox({"Potion":{"func":function(x) {x.health += 30;
                                                                    if(x.health > x.maxHealth){
                                                                        x.health = x.maxHealth;
                                                                    }
                                                                }   
                                            ,"cost":"3"}
                                 ,"Health Increase" :{"func":function(x) {x.maxHealth += 25;
                                                                          x.healthBar.maxHealth += 25;
                                                                          x.healthBar.size.w += 25;
                                                                          x.healthBar.offset.x -= 12.5;
                                                                         }
                                            ,"cost":"7"}
                                 ,"Spray" :{"func":function(x) {x.sprayAmt += 50;
                                                                    if(x.sprayAmt > x.maxSpray){
                                                                        x.sprayAmt = x.maxSpray;
                                                                    }
                                                               }
                                            ,"cost":"4"}
                                 ,"Spray Recharge Increase" :{"func":function(x) {x.sprayRegen *= 2;
                                                                    }
                                            ,"cost":"8"}
                                 ,"Spray Increase" :{"func":function(x) {x.maxSpray += 25;}
                                            ,"cost":"8"}
                                 ,"Antidote" :{"func":function(x) {x.isPoisoned = false;
                                                                   x.healthBar.colors.fill = "#d00"; 
                                                                  }
                                            ,"cost":"6"}
                                 ,"Speed Boost" :{"func":function(x) {x.topSpeed *= 2;
                                                                      x.minSpeed *= 2;
                                                                      x.speedup = true;
                                                                      setTimeout(function () {
                                                                        x.topSpeed /= 2;
                                                                        x.minSpeed /= 2;
                                                                        x.speedup = false;
                                                                      }, 6000);}
                                            ,"cost":"10"}
                                 ,"Heal Most Damaged Tree" :{"func":function(x) {
                                    var tree = x.trees[0], i;
                                    // Find most damaged tree
                                    for (i = 0; i < x.trees.length; ++i) {
                                        if (x.trees[i].health < tree.health) {
                                            tree = x.trees[i];
                                        }
                                    }
                                    tree.health = 100;}, "cost":"20"}
                                 ,"Exit"  :{"func":function(x){
                                                     return false;
                                                  }
                                           }
                                 },
                                 { x: 75, y: 75});

    this.iconbox   = new Iconbox(
        [images.apple_ok, images.gold, images.bubble], // icon images
        [0, 0, this.farmer.sprayAmt] // initial item amounts
    );
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
    // HACK HACK HACK - keep amounts up to date
    this.iconbox.amounts[0] = this.farmer.numFruits;
    this.iconbox.amounts[1] = this.farmer.cash;
    this.iconbox.amounts[2] = Math.floor(this.farmer.sprayAmt);

    this.iconbox.draw(context);

    // Draw Shop dialog
    if (this.shopOpen && this.onShop) {
        this.shopDialog.draw(context);
    }

    // Draw game over overlay
    if (this.gameOver) {
        // TODO: move all this sort of thing into updated textbox object
        context.font = "50px Verdana";
        var overlay = {
                x: (this.canvas.width  / 2) - (this.canvas.width  / 3.5),
                y: (this.canvas.height / 2) - (this.canvas.height / 6),
                w: this.canvas.width  / 1.75,
                h: this.canvas.height / 3
            },
            text = "Game Over!",
            textSize = context.measureText(text),
            textPos = {
                x: overlay.x + (overlay.w / 2) - (textSize.width / 2),
                y: overlay.y + 80
            },
            gradient = context.createLinearGradient(0, 0, this.canvas.width, 0);

        // Draw text box
        context.drawImage(images.textbox, overlay.x, overlay.y, overlay.w, overlay.h);

        // Draw "game over" text
        gradient.addColorStop("0.1", "black");
        gradient.addColorStop("1.0", "red");
        context.fillStyle = gradient;
        context.fillText(text, textPos.x, textPos.y);

        // Draw other text
        context.font = "23px Verdana";
        context.fillStyle = "black";
        context.fillText("You were defeated by the swarm...", overlay.x + 30, overlay.y + 140);
        context.fillText("You stockpiled " + String(this.shop.stockpile) + " fruits.", overlay.x + 30, overlay.y + 170);
    }
};


Level.prototype.update = function (canvas) {
    var i, j, parentTree, parentTreeIsSwarmed, flock, cloud, tree;

    // Hacky, but used by game over overlay in draw()
    this.canvas = canvas;

    if (this.gameOver) {
        return;
    }
    
    if (this.shopOpen) {
        this.shopOpen = this.shopDialog.update(this.farmer);
        return;
    }

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
                (this.trees[i].fruits[j].dropped || this.trees[i].fruits[j].rotten)) {
                // Only add non-rotten fruits to player inventory
                if (this.trees[i].fruits[j].dropped) {
                    ++this.farmer.numFruits;
                }
                this.trees[i].fruits[j].remove();
            }
        }
    }
    
    // Update flocks
    for (i = 0; i < this.flocks.length; ++i) {
        this.flocks[i].update(canvas);
        if (this.flocks[i].target.health === 0.0) {
            if (this.flocks[i].boids[0].type === "biting" || this.flocks[i].boids[0].type === "poison"){
                this.flocks[i].target = this.farmer;
            } else {
                if (this.trees.length > 0) {
                    this.flocks[i].target = this.trees[Math.floor(Math.random()*this.trees.length - 0.1)];
                }else {
                    this.flocks[i].target = this.farmer;
                }
            }
        }   
    }
    
    // Update the player
    // TODO: dirty way to not change too much code for keyboard clouds
    var cloud = this.farmer.update();
    if (cloud != null) { this.gasclouds.push(cloud); }
    
    // Is poisioned?
    if (this.farmer.isPoisoned) { 
        this.farmer.damage(.05);
        this.farmer.healthBar.colors.fill = "#00ff00";
    }

    // Check for player-shop collision
    if (this.farmer.overlaps(this.shop)) {
        if (!this.onShop) {
            this.shopOpen = true;
            this.onShop = true;

            if (this.farmer.numFruits > 0) {
                this.shop.stockpile += this.farmer.numFruits;
                this.farmer.cash += this.farmer.numFruits;
                this.farmer.numFruits = 0;
            }
        }
    } else {
        this.onShop = false;
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
         }
    }i
   
    // Regain spray very slowly
    this.farmer.sprayAmt += this.farmer.sprayCost * this.farmer.sprayRegen;
    if (this.farmer.sprayAmt > this.farmer.maxSpray) {
        this.farmer.sprayAmt = this.farmer.maxSpray;
    }
    //GameOver
    if (this.farmer.health <= 0 || this.trees.length == 0) {
        this.gameOver = true;
    }
};


// ----- Helper functions ------------------------------s----------------------
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
