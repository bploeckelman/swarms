// ----------------------------------------------------------------------------
//     HUD Utils
// ----------------------------------------------------------------------------
var Healthbar = function (parent, size, offset, colors) {
    this.parent = parent;
    this.maxHealth = parent.health;
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




