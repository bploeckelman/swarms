// ----- Get JSLint to settle down ----------------------------------------
/*jslint browser: true*/
/*global Level*/
/*global console*/

var keyState = {}, mouseState = {}, mousePos = { x: 0, y: 0};

window.addEventListener('keydown', function(e) {
    keyState[e.keycode || e.which] = true;
}, true);
window.addEventListener('keyup', function(e) {
    keyState[e.keycode || e.which] = false;
}, true);


// ----------------------------------------------------------------------
//  Entry Point
// ----------------------------------------------------------------------
(function main() {
    "use strict";
    // ------------------------------------------------------------------
    // Note: var declarations get hoisted up here anyways, 
    //       so might as well just put them here... happy JSLint, happy life
    var reqFrame,
        canvas,
        canvasWidth,
        canvasHeight,
        canvasBorder,
        canvasBGColor,
        context,
        numTrees,
        treeBoundary,
        firstTime = true,
        level;

    reqFrame = window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.oRequestAnimationFrame
            || window.msRequestAnimationFrame
            || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };

    canvasWidth   = 800;
    canvasHeight  = 600;
    canvasBorder  = "rgb(175,175,125) 5px solid";
    canvasBGColor = "rgb(16,32,16)";

    numTrees = 10;
    treeBoundary = { x: 100, y: 100, w: canvasWidth - 100, h: canvasHeight - 100 };
    level = new Level(numTrees, treeBoundary);


    // ----- SetupEnvironment -------------------------------------------------
    document.getElementsByTagName("body")[0].style.background = "rgb(16,16,16)";
    document.getElementById("container").style.width  = canvasWidth  + "px";
    document.getElementById("container").style.height = canvasHeight + "px";
    document.getElementById("container").style.margin = "auto auto";

    // Setup the canvas 
    canvas = document.getElementById("canvas");
    if (!canvas) {
        console.log("Error: unable to get canvas element");
    }
    canvas.width            = canvasWidth;
    canvas.height           = canvasHeight;
    canvas.style.border     = canvasBorder;
    canvas.style.background = canvasBGColor;

    // Setup the context
    context = canvas.getContext("2d");
    if (!context) {
        console.log("Error: unable to get canvas 2d context");
    }

    // ------------------------------------------------------------------
    window.addEventListener('mousedown', function (e) {
        mouseState[e.button || e.which] = true;
        mousePos = {
            x: e.pageX - canvas.offsetLeft,
            y: e.pageY - canvas.offsetTop
        };
    }, true);
    window.addEventListener('mousemove', function (e) {
        mousePos = {
            x: e.pageX - canvas.offsetLeft,
            y: e.pageY - canvas.offsetTop
        };
    }, true);
    window.addEventListener('mouseup', function (e) {
        mouseState[e.button || e.which] = false;
    }, true);

    // ------------------------------------------------------------------
    function howTo() {
        if (keyState[13] || keyState[27]) { firstTime = false;}
        // How to play
        context.font = "50px Verdana";
        var overlay = {
                x: (canvas.width  / 2) - (canvas.width  / 2.5),
                y: (canvas.height / 2) - (canvas.height / 3),
                w: canvas.width  / 1.2,
                h: canvas.height / 1.5
            },
            text = "How to play",
            textSize = context.measureText(text),
            textPos = {
                x: overlay.x + (overlay.w / 2) - (textSize.width / 2),
                y: overlay.y + 80
            },
            gradient = context.createLinearGradient(0, 0, canvas.width, 0);

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
        context.fillText("Use the arrow keys or WASD to move around", overlay.x + 30, overlay.y + 140);
        context.fillText("Use space or the mouse to spray pesticide", overlay.x + 30, overlay.y + 170);
        context.fillText("Use enter to confirm a purchase", overlay.x + 30, overlay.y + 200);
        
        context.fillStyle = "green";
        context.fillText("*Collect red fruit, cash it in, powerup, protect trees*", overlay.x + 25, overlay.y + 240);
        
        context.fillStyle = "black";
        context.fillText("Watch out for the swarms, some are even poisonous", overlay.x + 20, overlay.y + 280);
        context.fillText("Your game is over when you die or all your trees die", overlay.x + 20, overlay.y + 310);
        
        context.fillStyle = "yellow";
        context.fillText("[ Press ENTER or ESC to begin! ]", textPos.x - 30, overlay.y + 360);
    };

    // ------------------------------------------------------------------
    // ------------------------------------------------------------------
    (function drawLoop() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background image
        context.save();
        context.globalAlpha = 0.4;
        context.drawImage(images.grass, 0, 0, canvas.width, canvas.height);
        context.restore();

        if (firstTime) {
            howTo();
        } else {
            level.update(canvas);
            level.draw(context);
        }
        reqFrame(drawLoop);
    }) ();

})();
