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
    // ------------------------------------------------------------------
    // ------------------------------------------------------------------
    (function drawLoop() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background image
        context.save();
        context.globalAlpha = 0.4;
        context.drawImage(images.grass, 0, 0, canvas.width, canvas.height);
        context.restore();

        level.update(canvas);
        level.draw(context);

        reqFrame(drawLoop);
    }) ();

})();
