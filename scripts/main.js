// ----- Get JSLint to settle down ----------------------------------------
/*jslint browser: true*/
/*global Level*/
/*global console*/

// ----- LoadResources ----------------------------------------------------
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
        "apple_bad"  : new Image()
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

var keyState = {};
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

    canvasWidth   = window.innerWidth - 128;
    canvasHeight  = window.innerHeight - 64;
    canvasBorder  = "rgb(175,175,125) 5px solid";
    canvasBGColor = "rgb(16,32,16)";

    numTrees = 10;
    treeBoundary = { x: 100, y: 100, w: canvasWidth - 100, h: canvasHeight - 100 };
    level = new Level(numTrees, treeBoundary);

    // ----- SetupResize ------------------------------------------------------
    window.onresize = function () {
        canvasWidth   = window.innerWidth  - 128;
        canvasHeight  = window.innerHeight - 64;
        canvas.width  = canvasWidth;
        canvas.height = canvasHeight;
        document.getElementById("container").style.width  = canvasWidth  + "px";
        document.getElementById("container").style.height = canvasHeight + "px";
        document.getElementById("container").style.margin = "auto auto";
    };

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
    canvas.addEventListener("click", function (event) {
        var gascloud = level.farmer.handleClick({
            x: event.pageX - canvas.offsetLeft,
            y: event.pageY - canvas.offsetTop
        });
        if (gascloud !== null) {
            level.gasclouds.push(gascloud);
        }
    }, false);

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
