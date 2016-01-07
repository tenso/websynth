"use strict";
/*global util*/
/*global gBase*/
/*global window*/
/*global log*/
/*global gui*/

function wTimeBar() {
    var that = gBase().bg("#888"),
        canvas = gBase("canvas").addTo(that).w("100%").h("100%"),
        ctx = canvas.getContext("2d"),
        halfH = that.height / 2.0,
        totalMs = 1000,
        currentMs = 0,
        measureMs = 500,
        quant = 0,
        bpm = 0,
        pixelsPerMs = 0,
        selection = {startMs: 0, endMs: 0},
        renderOver;

    function drawBg() {
        var ms = 0,
            timeX = 0;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#aaa";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(0,  halfH);
        ctx.lineTo(canvas.width, halfH);


        if (measureMs > 0) {
            while (ms < totalMs) {
                ms += measureMs;
                timeX = ms * pixelsPerMs;
                ctx.moveTo(timeX,  0);
                ctx.lineTo(timeX, canvas.height);
            }
        }

        ctx.stroke();

        return that;
    }

    function drawFg() {
        var timeX = currentMs * pixelsPerMs;

        ctx.beginPath();
        ctx.strokeStyle = "#8f8";
        ctx.moveTo(timeX,  0);
        ctx.lineTo(timeX, canvas.height);
        ctx.stroke();

        return that;
    }

    function drawSelection() {
        var start,
            end;

        if (selection.startMs !== selection.endMs) {
            start = selection.startMs * canvas.width / totalMs;
            end = selection.endMs * canvas.width / totalMs;
            ctx.fillStyle = "rgba(0, 255, 0, 0.25)";
            ctx.fillRect(start, 0, end - start, canvas.height);
        }

        return that;
    }

    that.draw = function () {
        pixelsPerMs = canvas.width / totalMs;
        drawBg();
        if (typeof renderOver === "function") {
            renderOver(canvas, ctx, currentMs, totalMs, pixelsPerMs);
        }
        drawFg();
        drawSelection();
        return that;
    };

    that.resizeCanvas = function () {
        canvas.width = that.offsetWidth;
        canvas.height = that.offsetHeight;
        halfH = canvas.height / 2.0;
        return that.draw();
    };

    that.setRenderer = function (render) {
        renderOver = render;
        return that.draw();
    };

    that.setCurrentMs = function (ms) {
        currentMs = ms;
        return that.draw();
    };

    that.setTotalMs = function (ms) {
        totalMs = ms;
        return that.draw();
    };

    that.setTimeParams = function (bpmValue, quantValue, measureMsValue) {
        bpm = bpmValue;
        quant = quantValue;
        measureMs = measureMsValue;
        return that.draw();
    };

    that.changeCurrentMs = undefined;

    canvas.onmousedown = function (e) {
        gui.captureMouse(e);
    };

    canvas.iMouseCaptured = function (e) {
        selection.startMs = totalMs * (that.parentNode.scrollLeft + e.pageX) / canvas.width;
        selection.endMs = selection.startMs;
        if (e.button === 2) {

        } else {
            if (typeof that.changeCurrentMs === "function") {
                that.changeCurrentMs(selection.startMs);
            }
        }
    };

    canvas.iMousePressAndMove = function (e) {
        var ms;
        if (e.button === 2) {
            selection.endMs = totalMs * (that.parentNode.scrollLeft + e.pageX) / canvas.width;
            that.draw();
        } else {
            ms = totalMs * (that.parentNode.scrollLeft + e.pageX) / canvas.width;
            if (typeof that.changeCurrentMs === "function") {
                that.changeCurrentMs(ms);
            }
        }
    };

    canvas.iMouseUpAfterCapture = function (e) {
    };

    window.addEventListener("resize", that.resizeCanvas);
    that.typeIs = "wTimeBar";
    return that;
}
