// ----------------------------------------------------------------------------
//     Textbox
// ----------------------------------------------------------------------------
var Textbox = function (text, pos) {
    this.pos    = pos
    this.textPos = {x:0, y:0};
    this.width  = 0;
    this.height = 27 * text.length;
    this.fontSize = 23;
    this.text = text;
};

Textbox.prototype.draw = function (context) {
    context.font = this.fontSize + "px Verdana";
    context.fillStyle = "black";
    if (this.width == 0) { 
        this.width = Math.max.apply(Math, ([context.measureText(x).width for each (x in this.text)]))*1.2;
        this.textPos = {
                x: this.pos.x + 25,
                y: this.pos.y + this.fontSize + 3
        };
    }

    // Draw text box
    context.drawImage(images.textbox, this.pos.x, this.pos.y, this.width, this.height);

    // Draw text
    for (var i = 0; i < this.text.length; ++i) {
        context.fillText(this.text[i], this.textPos.x, this.textPos.y + (i * this.fontSize));
    }
};


// ----------------------------------------------------------------------------
//     Menubox
// ----------------------------------------------------------------------------

var pointerImages = { "0": {x: 0, y:0, w:32, h: 34},
                      "1": {x:32, y:0, w:32, h: 34},
                      "2": {x:64, y:0, w:32, h: 34} };

var pointerTypes = Object.keys(pointerImages);


var Menubox = function (choices, pos) {
    this.pos    = pos
    this.textPos = {x:0, y:0};
    this.width  = 0;
    this.height = 30 * Object.keys(choices).length;
    this.choices   = choices;
    this.selected = 0;
    this.current = 0;
    this.fontSize = 23;
    this.pointerPos = {x:0,y:0};
    this.timeBuffer = 0;
    this.keyDown = false;
};

Menubox.prototype.draw = function (context) {
    context.font = this.fontSize + "px Verdana";
    context.fillStyle = "black";
    if (this.width == 0) { 
        this.width = Math.max.apply(Math, ([context.measureText(x).width for each (x in Object.keys(this.choices))])) + 150;
        this.textPos = {
            x: this.pos.x + 25,
            y: this.pos.y + this.fontSize + 20
        };
        this.pointerPos = {
            x: this.pos.x + this.width - 50,
            y: this.pos.y + 20
        };
    }

    // Draw text box
    context.drawImage(images.textbox, this.pos.x, this.pos.y, this.width, this.height);

    // Draw choices
    var keys = Object.keys(this.choices);
    for (var i = 0; i < keys.length; ++i) {
        context.fillText(keys[i], this.textPos.x, this.textPos.y + (i * this.fontSize));
    }
    // Draw prices
    var costs = [k["cost"] for each(k in this.choices) if ("cost" in k)];
    for (var i = 0; i < costs.length; ++i) {
        context.fillText(costs[i], this.textPos.x + (this.width - this.textPos.x), this.textPos.y + (i * this.fontSize));
    }
    // Draw pointer
    var strRep = String(Math.floor(this.current) % 3);
    context.drawImage(images.pointer, 
                      pointerImages[strRep].x,
                      pointerImages[strRep].y,
                      pointerImages[strRep].w,
                      pointerImages[strRep].h,
                      this.pointerPos.x,
                      this.pointerPos.y,
                      pointerImages[strRep].w,
                      pointerImages[strRep].h);
};

Menubox.prototype.update = function (farmer) {
    if (keyState[87] || keyState[38]) {
        if (this.selected > 0) {
            if (this.timeBuffer == -3) {
                this.selected -= 1;
                this.pointerPos.y -= this.fontSize;
                this.timeBuffer = 0;
            } else {
                this.timeBuffer -= 1;
            }
        }
    }
    if (keyState[83] || keyState[40]) {
        if (this.selected < Object.keys(this.choices).length - 1) {
            if (this.timeBuffer == 3) {
                this.selected += 1;
                this.pointerPos.y += this.fontSize;
                this.timeBuffer = 0;
            } else {
                this.timeBuffer += 1;
            }
            
        }
    }
    if (keyState[13] && !this.keyDown) {
        var cost = this.choices[Object.keys(this.choices)[this.selected]]["cost"];
        if(cost == null) {
            return false;
        }
        else if(farmer.cash >= cost) {
            farmer.cash -= cost;
            this.choices[Object.keys(this.choices)[this.selected]]["func"](farmer);
        }
    }
    this.keyDown = keyState[13];
    this.current += 0.1;
    return true;
    //this.current = Math.floor(this.current / 3);

}

// ----------------------------------------------------------------------------
//     Icon Box
// ----------------------------------------------------------------------------
var Iconbox = function (icons, amounts) {
    this.icons = icons;
    this.amounts = amounts;
    this.pos  = { x: 0, y: 0 };
    this.size = { w: 0, h: 32 }; // Note: icons size 32x32
};

Iconbox.prototype.draw = function (context) {
    var offset = 0, text, i;

    // Recalculate size
    this.size.w = 0;
    for (i = 0; i < this.icons.length; ++i) {
        this.size.w += 32;
    }
    for (i = 0; i < this.amounts.length; ++i) {
        this.size.w += context.measureText(" " + this.amounts[i] + " ").width;
    }
    this.pos.x = 800 - this.size.w;
    this.pos.y = 0;

    // Draw the icons + amounts at the appropriate locations
    context.font = "20px Verdana";
    context.fillStyle = "white";
    for (i = 0; i < this.amounts.length; ++i) {
        context.drawImage(this.icons[i], this.pos.x + offset, this.pos.y, 32, 32);
        offset += 32;

        text = " " + this.amounts[i] + " ";
        context.fillText(text, this.pos.x + offset, this.pos.y + 25);
        offset += context.measureText(text).width;
    };
};



