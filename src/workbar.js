"use strict";
/*global gContainer*/
/*global gLabel*/
/*global gButton*/
/*global lang*/
/*global app*/
/*global wTimeBar*/
/*global util*/
/*global gInput*/
/*global log*/
/*global gBase*/
/*global document*/
/*global gui*/
/*global window*/
/*global gSlider*/
/*global note*/
/*global wNoteInfoBar*/

function workbar() {
    var that = gContainer(),
        timeScroll = gBase(),
        timeBar = wTimeBar(),
        play,
        record,
        marginX = 4,
        marginY = 6,
        buttonH = 16,
        minHeight = 46,
        initialHeight = 200,
        totalTime,
        sComp,
        newNoteSeqStep,
        bpmInput,
        quantInput,
        quantOn,
        zoomX,
        zoomY,
        recordOn,
        time,
        minNote = 1, //FIXME move to infoBar?
        maxNote = 88,
        infoBar = wNoteInfoBar(minNote, maxNote),
        buttonGroup = gContainer().paddingRight(25),
        timeGroup = gContainer().paddingRight(25),
        quantGroup = gContainer().paddingRight(25);

    //FIXME: this logic should move to workspace (or move logic from there to here)
    function drawNoteFromDraw(selection) {
        var noteFreq,
            seq;
        if (sComp) {
            if (sComp.stateMode() === "notes") {
                if (sComp && !newNoteSeqStep) {
                    seq = sComp.getSequencer();
                    noteFreq = note.hz(parseInt(minNote + (1.0 - selection.endH) * (maxNote - minNote), 10));
                    newNoteSeqStep = seq.openAt(selection.startMs, {gate: true, freq: noteFreq});
                    newNoteSeqStep.msOff = selection.endMs;
                } else {
                    newNoteSeqStep.msOff = selection.endMs;
                }
            }
        }
    }
    
    //FIXME: this logic should move to workspace (or move logic from there to here)
    function finishNoteFromDraw(selection) {
        var seq;
        if (sComp) {
            if (sComp.stateMode() === "notes") {
                if (sComp && newNoteSeqStep) {
                    seq = sComp.getSequencer();
                    seq.closeAt(newNoteSeqStep, selection.endMs);
                    newNoteSeqStep = undefined;
                }
            }
        }
    }
    
    /*FIXME: render sArgs, move*/

    function renderPlain(canvas, ctx, currentMs, totalMs, pixelsPerMs, current) {
        var i,
            timeX;
        
        ctx.strokeStyle = "#aaa";
        ctx.beginPath();
        ctx.moveTo(0,  canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        for (i = 0; i < current.length; i += 1) {
            timeX = current[i].ms * pixelsPerMs;
            ctx.moveTo(timeX,  0);
            ctx.lineTo(timeX, canvas.height);
        }
        ctx.stroke();
    }
    
    function renderNotes(canvas, ctx, currentMs, totalMs, pixelsPerMs, current) {
        var i,
            timeX,
            lenX,
            noteY,
            noteNum,
            y,
            pixelsPerNote = canvas.height / (maxNote - minNote);
        
        
        //draw note grid:
        for (i = 0; i < maxNote - minNote; i += 1) {
            ctx.beginPath();
            ctx.strokeStyle = "#aaa";
            y = i * pixelsPerNote;
            ctx.moveTo(0,  y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        //draw notes:
        for (i = 0; i < current.length; i += 1) {
            if (!current[i].hasOwnProperty("msOff")) {
                //log.error("no msOff for note");
                //FIXME: sCVkey adds state with gate off with no offMs (change sCKey or here?)
            } else if (!current[i].args.hasOwnProperty("gate")) {
                log.error("no gate for note");
            } else {
                timeX = current[i].ms * pixelsPerMs;
                if (current[i].msOff === -1) {
                    lenX = currentMs * pixelsPerMs - timeX;
                    if (lenX < 0) {
                        lenX = 0;
                    }
                } else {
                    lenX = current[i].msOff * pixelsPerMs - timeX;
                }

                noteNum = note.note(current[i].args.freq);
                noteY = canvas.height - (noteNum * pixelsPerNote);

                ctx.fillStyle = "#f88";
                ctx.fillRect(timeX, noteY, lenX, pixelsPerNote);
            }
        }
    }

    function renderEvents(canvas, currentMs, totalMs, pixelsPerMs) {
        var sArgs = sComp.getArgs(),
            type,
            i,
            timeX,
            ctx = canvas.getContext("2d");
        
        if (!sComp) {
            log.error("workbar.renderEvents: no sComp");
            return that;
        }
                
        for (type in sArgs) {
            if (sArgs.hasOwnProperty(type)) {
                if (sComp.stateMode() === "notes") {
                    renderNotes(canvas, ctx, currentMs, totalMs, pixelsPerMs, sArgs[type]);
                } else {
                    renderPlain(canvas, ctx, currentMs, totalMs, pixelsPerMs, sArgs[type]);
                }
            }
        }
        return that;
    }

    /**/

    function updateBpmAndQuantification() {
        if (typeof that.changeTimeParams === "function") {
            that.changeTimeParams(bpmInput.getValueInt(), 1 / quantInput.getValue(), quantOn.getValue());
        }
    }

    function updateTotalTime() {
        var total = util.stringToMs(totalTime.getValue());
        if (typeof that.changeTotalMs === "function") {
            that.changeTotalMs(total);
        }
        return that;
    }

    function zoomTimeBar() {
        timeBar.w("calc(" + zoomX.getValueInt() + "% - 40px)").h(zoomY.getValueInt() + "%");
        infoBar.h(zoomY.getValueInt() + "%");
        timeBar.resizeCanvas();
        infoBar.resizeCanvas();
    }

    function updatePlayback() {
        if (typeof that.changePlayback === "function") {
            that.changePlayback(play.getValue());
        }
    }

    function updateRecord() {
        recordOn = record.getValue();
        if (typeof that.changeRecord === "function") {
            that.changeRecord(recordOn);
        }
    }

    that.resizeCanvas = function () {
        that.setTopOfBar(that.parentNode.offsetHeight - initialHeight);
        return that;
    };

    that.setTime = function (currentMs) {
        time.setValue(util.msToString(currentMs));
        timeBar.setCurrentMs(currentMs);
        return that;
    };

    that.setTotalTime = function (totalMs) {
        totalTime.setValue(util.msToString(totalMs));
        timeBar.setTotalMs(totalMs);
        return that;
    };

    that.setTimeParams = function (bpm, quant, measureMs, qOn) {
        bpmInput.setValue(bpm, true);
        quantInput.setValue(1 / quant, true);
        quantOn.setValue(qOn, true);
        timeBar.setTimeParams(bpm, quant, measureMs);
    };
    
    that.setPlayback = function (isOn) {
        play.setValue(isOn, true);
    };
    
    that.setCurrentSComp = function (comp) {
        sComp = comp;

        if (!comp) {
            timeBar.setRenderer(undefined);
        } else {
            timeBar.setRenderer(renderEvents);
        }
        return that;
    };

    that.abs().bg("#fff");
    that.w("100%").bottom(0);

    //callbacks:
    that.changeCurrentMs = undefined;
    that.changeTotalMs = undefined;
    that.changeTimeParams = undefined;
    that.changePlayback = undefined;
    that.changeSize = undefined;
    that.changeSCompState = undefined;

    play = gButton(">", updatePlayback, true).w(40).h(buttonH);
    record = gButton(lang.tr("rec"), updateRecord, true).bg("#f00").w(40).h(buttonH);
    record.setColor("#000", "#fff");

    time = gLabel("--:--:--").fontFamily("monospace");
    totalTime = gInput("--:--:--", updateTotalTime, "").fontFamily("monospace");

    bpmInput = gInput("", updateBpmAndQuantification, "bpm", 30).labelPos("left");
    quantInput = gInput("", updateBpmAndQuantification, "/", 30).labelPos("left");
    quantOn = gButton("1", updateBpmAndQuantification, true).w(20).h(buttonH);

    zoomX = gSlider(0, 100, 1200, function (value) {
        timeBar.w("calc(" + value + "% - 40px)");
        timeBar.resizeCanvas();
    }, true);

    zoomY = gSlider(0, 100, 400, function (value) {
        timeBar.h(value + "%");
        timeBar.resizeCanvas();
        infoBar.h(value + "%");
        infoBar.resizeCanvas();
    });

    //buttons
    buttonGroup.addTabled(record);
    buttonGroup.addTabled(play);
    that.addTabled(buttonGroup);

    //time
    timeGroup.addTabled(time).addTabled(totalTime);
    that.addTabled(timeGroup);

    quantGroup.addTabled(bpmInput.paddingRight(10)).addTabled(quantOn).addTabled(quantInput);
    that.addTabled(quantGroup);

    //zoom
    zoomX.addTo(that).abs().right(marginX * 2 + 10).top(marginY * 2);
    zoomY.addTo(that).abs().right(marginX).top(marginY + 24);


    //timeBar
    timeScroll.addTo(that).abs().left(marginX).right(marginX * 2 + 10).top(buttonH + 2 * marginY).bottom(0);
    timeScroll.overflow("scroll");

    timeBar.addTo(timeScroll).abs().left(40).top(0).w("calc(100% - 40px)").h("100%");
    
    infoBar.addTo(timeScroll).abs().left(0).top(0).w(40).h("100%");
    timeScroll.onscroll = function () {
        infoBar.left(timeScroll.scrollLeft);
    };
    
    timeBar.changeCurrentMs = function (ms) {
        if (typeof that.changeCurrentMs === "function") {
            that.changeCurrentMs(ms);
        }
    };

    timeBar.userDraw = function (selection, done) {
        if (done) {
            finishNoteFromDraw(selection);
        } else {
            drawNoteFromDraw(selection);
        }
        timeBar.draw();
    };
    
    that.setTopOfBar = function (y) {
        var newY = y;
        that.top(newY);

        if (that.getTop() < app.screen.minY) {
            newY = app.screen.minY;
            that.top(newY);
        }

        if (that.getH() < minHeight) {
            newY = that.parentNode.offsetHeight - minHeight;
            that.top(newY);
        }

        if (typeof that.changeTopPosition === "function") {
            that.changeTopPosition(newY);
        }
        timeBar.resizeCanvas();
        infoBar.resizeCanvas();
        return that;
    };

    //keyboard and mouse
    //FIXME: should really not use captureMouse and iMouse... routines here as that is not in workspace container.
    that.onmousedown = function (e) {
        gui.captureMouse(e);
    };

    that.iMousePressAndMove = function (e, mouse) {
        that.setTopOfBar(e.pageY - mouse.pageCaptureOffsetInElement.y);
    };

    document.addEventListener("keydown", function (e) {
        var key = String.fromCharCode(e.keyCode).toLowerCase(),
            select = timeBar.getSelection();
                                        
        if (key === " ") {
            e.preventDefault();
            play.set();
        }
        if (e.keyCode === 46) {
            e.preventDefault();
            if (typeof that.changeSCompState === "function") {
                if (sComp) {
                    if (sComp.stateMode() === "notes") {
                        select.startValue = note.hz(parseInt(minNote + (1.0 - select.endH) * (maxNote - minNote), 10));
                        select.endValue = note.hz(parseInt(minNote + (1.0 - select.startH) * (maxNote - minNote), 10));
                        select.valueType = "freq";
                    } else {
                        select.startValue = select.startH;
                        select.endValue = select.endH;
                        select.valueType = "";
                    }
                    that.changeSCompState(sComp, "delete", select);
                }
            }
        }
    }, false);

    window.addEventListener("resize", function (e) {
        that.resizeCanvas();
    }, false);

    return that;
}
