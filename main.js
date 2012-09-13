// ----------------------------------------------------------------------
//  Entry Point
// ----------------------------------------------------------------------
function main() {
    // ------------------------------------------------------------------
    var reqFrame = window.requestAnimationFrame
                || window.webkitRequestAnimationFrame
                || window.mozRequestAnimationFrame
                || window.oRequestAnimationFrame
                || window. msRequestAnimationFrame
                || function(callback, element) { 
                        window.setTimeout(callback, 1000 / 60); 
                   };

    var canvasWidth   = window.innerWidth - 128;;
    var canvasHeight  = window.innerHeight - 64;;
    var canvasBorder  = "rgb(175,175,125) 5px solid";
    var canvasBGColor = "rgb(16,32,16)";

    // ----- LoadResources ----------------------------------------------------
    var images = { 
           "kalachakra" : new Image()
         , "bubble"     : new Image()
         , "heart"      : new Image()
         , "textbox"    : new Image() 
         , "gold"       : new Image()
         , "shop"       : new Image()
         , "trees_large": new Image()
    };
    images["kalachakra" ].src = "kalachakra.png";
    images["bubble"     ].src = "bubble.png";
    images["heart"      ].src = "heart.png";
    images["textbox"    ].src = "textbox.png";
    images["gold"       ].src = "gold.png";
    images["shop"       ].src = "shop.png";
    images["trees_large"].src = "trees-large.png";

    // ----- SetupEnvironment -------------------------------------------------
    document.getElementsByTagName("body")[0].style.background = "rgb(16,16,16)";
    document.getElementById("container").style.width  = canvasWidth  + "px"; 
    document.getElementById("container").style.height = canvasHeight + "px"; 
    document.getElementById("container").style.margin = "auto auto"; 

    // Setup the canvas 
    var canvas = document.getElementById("canvas");
    if (!canvas) console.log("Error: unable to get canvas element");

    canvas.width            = canvasWidth;
    canvas.height           = canvasHeight;
    canvas.style.border     = canvasBorder;
    canvas.style.background = canvasBGColor;

    // Setup the context
    var context = canvas.getContext("2d");
    if (!context) console.log("Error: unable to get canvas 2d context");


    // ----- SetupResize ------------------------------------------------------
    window.onresize = function(event) {
        canvasWidth   = window.innerWidth - 128;
        canvasHeight  = window.innerHeight - 64;
        canvas.width  = canvasWidth;
        canvas.height = canvasHeight;
        document.getElementById("container").style.width  = canvasWidth  + "px"; 
        document.getElementById("container").style.height = canvasHeight + "px"; 
        document.getElementById("container").style.margin = "auto auto"; 
    };


    // ------------------------------------------------------------------
    function drawLoop() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background image
        context.save();
        context.globalAlpha = 0.3;
        context.drawImage(images["kalachakra"], 0, 0, canvas.width, canvas.height);
        context.restore();

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

};

