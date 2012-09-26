// ----------------------------------------------------------------------------
//     Textbox
// ----------------------------------------------------------------------------
var Textbox = function (text, pos, width, height) {
    this.pos    = pos;
    this.width  = width;
    this.height = height;
    this.text   = text;
};

Textbox.prototype.draw = function (context) {
    context.fillStyle = '#00f';
    context.strokeStyle = '#f00';
    context.lineWidth = 4;

    context.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    context.strokeRect(this.pos.x, this.pos.y, this.width, this.height);

    context.fillStyle = '#000';
    context.font = "20pt Arial";
    for (var i = 0; i < this.text.length; ++i) {
        context.fillText(this.text[i], this.pos.x + 4, this.pos.y + (i + 1)*35);
    }
};

