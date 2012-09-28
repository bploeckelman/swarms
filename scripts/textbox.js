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
    // TODO: move all this sort of thing into updated textbox object
    context.font = "50px Verdana";
    var overlay = {
            x: 50,
            y: 25,
            w: context.canvas.width  / 1.75,
            h: context.canvas.height / 3
        },
        text = "Game Over!",
        textSize = Math.max.apply(null, [context.measureText(x) for (x in this.choices)]);
        textPos = {
            x: overlay.x + (overlay.w / 2) - (textSize.width / 2),
            y: overlay.y + 80
        },
        gradient = context.createLinearGradient(0, 0, context.canvas.width, 0);

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
};


// ----------------------------------------------------------------------------
//     Menubox
// ----------------------------------------------------------------------------

var pointerImages = { "0": {x: 0, y:0, w:32, h: 34},
                      "1": {x:32, y:0, w:32, h: 34},
                      "2": {x:64, y:0, w:32, h: 34} };

var pointerTypes = Object.keys(pointerImages);


var Menubox = function (choices, prices, pos) {
    this.pos    = pos
    this.textPos = {x:0, y:0};
    this.width  = 0;
    this.height = 25 * choices.length
    this.prices = prices;
    this.choices   = choices;
    this.selected = 0;
    this.current = 0;
    this.fontSize = 23;
    this.pointerPos = {x:0,y:0};
    this.timeBuffer = 0;
};

Menubox.prototype.draw = function (context) {
    context.font = this.fontSize + "px Verdana";
    context.fillStyle = "black";
    if (this.width == 0) { 
        this.width = Math.max.apply(Math, ([context.measureText(x).width for each (x in this.choices)]))*3;
        this.textPos = {
                x: this.pos.x + this.width * 0.08,
                y: this.pos.y + this.fontSize
        };
        this.pointerPos = {x:this.pos.x + this.width * .8,
                           y: this.pos.y
        };
    }



    // Draw text box
    context.drawImage(images.textbox, this.pos.x, this.pos.y, this.width, this.height);

    // Draw choices
    for (var i = 0; i < this.choices.length; ++i) {
        context.fillText(this.choices[i], this.textPos.x, this.textPos.y + (i * this.fontSize));
    }
    // Draw prices
    for (var i = 0; i < this.prices.length; ++i) {
        context.fillText(this.prices[i], this.textPos.x + (this.width - this.textPos.x), this.textPos.y + (i * this.fontSize));
    }i
    // Draw pointer
    var strRep = String(Math.floor(this.current) % this.choices.length);
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

Menubox.prototype.update = function () {
    if (keyState[87]) {
        if (this.selected > 0) {
            if (this.timeBuffer == -2) {
                this.selected -= 1;
                this.pointerPos.y -= this.fontSize;
                this.timeBuffer = 0;
            } else {
                this.timeBuffer -= 1;
            }
        }
    }
    if (keyState[83]) {
        if (this.selected < this.choices.length - 1) {
            if (this.timeBuffer == 2 ) {
                this.selected += 1;
                this.pointerPos.y += this.fontSize;
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



