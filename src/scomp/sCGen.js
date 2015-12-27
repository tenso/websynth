"use strict";
/*global sGen*/
/*global sCBase*/
/*global gButton*/
/*global gButtonGroup*/
/*global gInput*/

function sCGen(container, uid) {
    var out = sGen({freq: 110, amp: 0.25, type: "sine"}),
        that = sCBase(container, "sCGen", {gen: out}, uid),
        buttonGroup = gButtonGroup(),
        ampControl;
            
    function addShape(shape) {
        var button = gButton(shape, function () {out.setArgs({type: shape}); }, true, buttonGroup);
        if (out.getArgs().type === shape) {
            button.set();
        }
        that.addContent(button);
    }
    
    that.addIn("gen", "freq").addOut("gen");
    
    that.addContent(ampControl = gInput(out.getArgs().amp, function (value) {
        out.setArgs({amp: parseFloat(value)});
    }, "amp"));
    
    that.nextRow();
    addShape("sine");
    addShape("square");
    addShape("saw");
    that.nextRow();
    addShape("triangle");
    addShape("noise");
    

    
    that.setGuiControls({
        gen: {
            type: buttonGroup,
            amp: ampControl
        }
    });
    
    return that;
}