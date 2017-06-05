var ctx,
    paint = false;
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
$(function () {
    $('button').click(() => {
        clickX = new Array();
        clickY = new Array();
        clickDrag = new Array();
        ctx.clearRect(0, 0, $('#draw').width(), $('#draw').height());
    });

    $('#draw').attr('height', 500);
    $('#draw').attr('width', 500);
    $('#draw').css('border', 'solid black 1px');
    ctx = $('#draw').get(0).getContext('2d');
    ctx.strokeStyle = '#6de1ff';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    $('#draw').mousedown(function (e) {
        let mouseX = e.pageX - this.offsetLeft;
        let mouseY = e.pageY - this.offsetTop;
        paint = true;
        addClick(mouseX, mouseY);
        redraw();
    });
    $('#draw').mousemove(function (e) {
        if (paint) {
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
            redraw();
        }
    });
    $('#draw').mouseup(function (e) {
        paint = false;
    });
    $('#draw').mouseleave(function (e) {
        paint = false;
    });
});

function addClick(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(dragging);
}
function redraw() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the canvas

    for (var i = 0; i < clickX.length; i++) {
        ctx.beginPath();
        if (clickDrag[i] && i) {
            ctx.moveTo(clickX[i - 1], clickY[i - 1]);
        } else {
            ctx.moveTo(clickX[i] - 1, clickY[i]);
        }
        ctx.lineTo(clickX[i], clickY[i]);
        ctx.closePath();
        ctx.stroke();
    }
}