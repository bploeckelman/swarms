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

    context.fillStyle = '#fff';
    context.font = "20pt Arial";
    for (var i = 0; i < this.text.length; ++i) {
        context.fillText(this.text[i], this.pos.x + 4, this.pos.y + (i + 1)*35);
    }
};

// ----------------------------------------------------------------------------
//     Pointer
// ----------------------------------------------------------------------------

var pointerImages = { "0": {x: 0, y:0, w:32, h: 34},
                      "1": {x:32, y:0, w:32, h: 34},
                      "2": {x:64, y:0, w:32, h: 34} };

var pointerTypes = Object.keys(pointerImages);

var Pointer = function (selected, textbox, image) {
    this.image = image;
    this.current = 0;
    this.timeBuffer = 0;
    this.selected = selected;
    this.textbox = textbox;
    this.pos = { x: this.textbox.pos.x + this.textbox.width - 32,
                 y: this.textbox.pos.y};

};

Pointer.prototype.draw = function (context) {
    var strRep = String(Math.floor(this.current) % this.textbox.text.length);
    context.drawImage(this.image, 
                      pointerImages[strRep].x,
                      pointerImages[strRep].y,
                      pointerImages[strRep].w,
                      pointerImages[strRep].h,
                      this.pos.x,
                      this.pos.y,
                      pointerImages[strRep].w,
                      pointerImages[strRep].h);
                     

};

Pointer.prototype.update = function () {
    if (keyState[87]) {
        if (this.selected > 0) {
            if (this.timeBuffer == -2) {
                this.selected -= 1;
                this.pos.y -= 40;
                this.timeBuffer = 0;
            } else {
                this.timeBuffer -= 1;
            }
        }
    }
    if (keyState[83]) {
        if (this.selected < this.textbox.text.length - 1) {
            if (this.timeBuffer == 2 ) {
                this.selected += 1;
                this.pos.y += 40;
                this.timeBuffer = 0;
            } else {
                this.timeBuffer += 1;
            }
            
        }
    }
    if (keyState[13]) {
        if(this.selected == 0) {
            
        }else if (this.selected == 1) {

        }else if (this.selected == 2) {
            return false;
        }
    }
    this.current += 0.1;
    return true;
    //this.current = Math.floor(this.current / 3);
};
