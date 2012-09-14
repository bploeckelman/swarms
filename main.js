// ----- Get JSLint to settle down ----------------------------------------
/*jslint browser: true*/
/*global Level*/
/*global console*/

// ----- LoadResources ----------------------------------------------------
var images = {
        "kalachakra" : new Image(),
        "bubble"     : new Image(),
        "heart"      : new Image(),
        "textbox"    : new Image(),
        "gold"       : new Image(),
        "shop"       : new Image(),
        "trees_large": new Image()
    };
images.kalachakra.src  = "kalachakra.png";
images.bubble.src      = "bubble.png";
images.heart.src       = "heart.png";
images.textbox.src     = "textbox.png";
images.gold.src        = "gold.png";
images.shop.src        = "shop.png";
images.trees_large.src = "trees-large.png";


// ----------------------------------------------------------------------
//  Entry Point
// ----------------------------------------------------------------------
function main() {
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
            || function (callback) {//, element) {
            window.setTimeout(callback, 1000 / 60);
        };

    canvasWidth   = window.innerWidth - 128;
    canvasHeight  = window.innerHeight - 64;
    canvasBorder  = "rgb(175,175,125) 5px solid";
    canvasBGColor = "rgb(16,32,16)";

    numTrees = 100; // for testing
    treeBoundary = { x: 0, y: 0, w: canvasWidth, h: canvasHeight };
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
    function drawLoop() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background image
        context.save();
        context.globalAlpha = 0.3;
        context.drawImage(images.kalachakra, 0, 0, canvas.width, canvas.height);
        context.restore();

        level.draw(context);

        reqFrame(drawLoop);
    }

    // ------------------------------------------------------------------
    function handleClick(evt) {
        console.log(evt);
    }
    canvas.addEventListener("click", handleClick, false);


    // ------------------------------------------------------------------
    // ------------------------------------------------------------------
    // ------------------------------------------------------------------

    drawLoop();

}
