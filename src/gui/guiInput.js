"use strict";
/*global test*/
/*global log*/
/*global gui*/
/*global document*/

//NOTE: mouse is relative to container, dont use for nodes not in container.
function guiInput(container, sizeOfContainerChanged) {
    var that = {},
        keyIsDown = 0,
        mouseCapturer,
        prevMouseCapturer,
        keyCapturer,
        mouse = {},
        oldSize = {w: 0, h: 0};

    function setMouseFromEvent(e, target) {
        mouse.x = gui.getEventOffsetInElement(container,  e).x;
        mouse.y = gui.getEventOffsetInElement(container,  e).y;
        mouse.relativeX = mouse.x - mouse.captureOffsetInElement.x;
        mouse.relativeY = mouse.y - mouse.captureOffsetInElement.y;
        
        if (target) {
            mouse.offsetInElement = gui.getEventOffsetInElement(target, e);
            mouse.offsetInElement.x += container.scrollLeft;
            mouse.offsetInElement.y += container.scrollTop;
            mouse.offsetInParent = gui.getEventOffsetInElement(target.parentNode, e);
            mouse.offsetInParent.x += container.scrollLeft;
            mouse.offsetInParent.y += container.scrollTop;
        }
    }

    function runCaptureCBIfExist(name, e) {
        if (mouseCapturer && mouseCapturer.hasOwnProperty(name)) {
            setMouseFromEvent(e, mouseCapturer);
            e.mouseCapturer = mouseCapturer;
            mouseCapturer[name](e, mouse);
        }
    }

    function runCBIfExist(name, e) {
        if (e.target.hasOwnProperty(name)) {
            e.target[name](e, mouse);
        }
    }

    function setMouseCaptureFromEvent(e, target) {
        mouse.captureOffsetInElement = gui.getEventOffsetInElement(target, e);
        mouse.captureOffsetInElement.x += container.scrollLeft;
        mouse.captureOffsetInElement.y += container.scrollTop;
        mouse.captureX = gui.getEventOffsetInElement(container, e).x;
        mouse.captureY = gui.getEventOffsetInElement(container, e).y;
    }

    function checkSize(container) {
        var newSize = {w: container.scrollWidth, h: container.scrollHeight};

        if (newSize.w !== oldSize.w
                || newSize.h !== oldSize.h) {
            oldSize = newSize;
            if (sizeOfContainerChanged) {
                sizeOfContainerChanged(newSize);
            }
        }
    }

    that.setMouseCapturer = function (e, wantedObject) {
        e.stopPropagation();

        if (!wantedObject) {
            mouseCapturer = e.target;
        } else {
            mouseCapturer = wantedObject;
        }

        if (prevMouseCapturer) {
            if (typeof prevMouseCapturer.iWasDeselected === "function") {
                prevMouseCapturer.iWasDeselected(mouseCapturer);
            }
            prevMouseCapturer = undefined;
        }

        setMouseCaptureFromEvent(e, mouseCapturer);
        runCaptureCBIfExist("iMouseCaptured", e);

        if (typeof mouseCapturer.iWasSelected === "function") {
            mouseCapturer.iWasSelected();
        }
    };

    that.setKeyCapturer = function (e, wantedObject) {
        if (e) {
            e.stopPropagation();
        }
        if (!wantedObject) {
            keyCapturer = e.target;
        } else {
            keyCapturer = wantedObject;
        }
    };

    that.mouseOver = undefined;

    document.addEventListener("mouseup", function (e) {
        if (mouseCapturer) {
            runCaptureCBIfExist("iMouseUpAfterCapture", e);
            prevMouseCapturer = mouseCapturer;
            mouseCapturer = undefined;
        }
    });

    document.addEventListener("mousemove", function (e) {
        if (mouseCapturer) {
            runCaptureCBIfExist("iMousePressAndMove", e);

            if (typeof mouseCapturer.iWasMoved === "function") {
                mouseCapturer.iWasMoved(mouseCapturer);
            }

            checkSize(container);
        }
    });

    document.addEventListener("mouseover", function (e) {
        if (mouseCapturer) {
            runCaptureCBIfExist("iMouseOverAfterCapture", e);
        }
        if (typeof that.mouseOver === "function") {
            that.mouseOver(e, mouseCapturer);
        }
    });

    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        //NOTE: dont set  captured here: will send all sorts of events...
        setMouseCaptureFromEvent(e, e.target);
        setMouseFromEvent(e, e.target);
        runCBIfExist("iOpenContextMenu", e);
    });

    document.addEventListener("keydown", function (e) {
        if (keyCapturer) {
            if (keyCapturer.iKeyDown) {
                var key = String.fromCharCode(e.keyCode).toLowerCase();

                if (keyIsDown === key) {
                    return;
                }
                keyIsDown = key;
                keyCapturer.iKeyDown(key, e.shiftKey);
            }
        }
    }, false);

    document.addEventListener("keyup", function (e) {
        if (keyCapturer) {
            if (keyCapturer.iKeyUp) {
                var key = String.fromCharCode(e.keyCode).toLowerCase();

                if (keyIsDown !== key) {
                    return;
                }
                keyIsDown = 0;
                keyCapturer.iKeyUp(key, e.shiftKey);
            }
        }
    }, false);

    return that;
}
