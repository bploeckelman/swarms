var images = {
        "grass"      : new Image(),
        "bubble"     : new Image(),
        "heart"      : new Image(),
        "textbox"    : new Image(),
        "gold"       : new Image(),
        "shop"       : new Image(),
        "trees_large": new Image(),
        "boid_red"   : new Image(),
        "boid_yellow": new Image(),
        "boid_orange": new Image(),
        "farmer"     : new Image(),
        "fruits"     : new Image(),
        "apple_good" : new Image(),
        "apple_ok"   : new Image(),
        "apple_bad"  : new Image(),
        "farmer12"   : new Image(),
        "pointer"    : new Image()
};
images.grass.src       = "images/grass.png";
images.bubble.src      = "images/bubble.png";
images.heart.src       = "images/heart.png";
images.textbox.src     = "images/textbox.png";
images.gold.src        = "images/gold.png";
images.shop.src        = "images/shop.png";
images.trees_large.src = "images/trees-large.png";
images.boid_red.src    = "images/boid-red.png";
images.boid_yellow.src = "images/boid-yellow.png";
images.boid_orange.src = "images/boid-orange.png";
images.farmer.src      = "images/farmer.png";
images.fruits.src      = "images/pacman-fruit.png";
images.apple_good.src  = "images/apple-good.png";
images.apple_ok.src    = "images/apple-dropped.png";
images.apple_bad.src   = "images/apple-rotten.png";
images.farmer12.src    = "images/farmer12.png";
images.pointer.src     = "images/pointer.png";

// ----------------------------------------------------------------------------
//     HUD Utils
// ----------------------------------------------------------------------------
var Healthbar = function (parent, size, offset, colors) {
    this.parent = parent;
    this.maxHealth = parent.maxHealth;
    this.size = size;
    this.offset = offset;
    this.line = 2;  // border line width
    this.colors = colors;

    this.draw = function (context) { 
        var pos = this.parent.pos,
            offset = this.offset, 
            size = this.size,
            healthPercent = this.parent.health / this.maxHealth;
            
        // Draw inner health bar
        context.globalAlpha = 0.5;
        context.fillStyle = this.colors.fill;
        context.fillRect(pos.x + offset.x, pos.y + offset.y, healthPercent * size.w, size.h);
        context.globalAlpha = 1.0;
            
        // Draw outer border
        context.lineWidth = this.line;
        context.strokeStyle = this.colors.stroke;
        context.strokeRect(pos.x + offset.x, pos.y + offset.y, size.w, size.h);
        context.lineWidth = 1;
    };
};




