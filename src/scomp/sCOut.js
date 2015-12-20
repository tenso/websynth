"use strict";
/*global sMix*/
/*global gSlider*/
/*global sCBase*/
/*global audioWork*/

function sCOut(container, args, uid) {
    var that,
        mix = sMix();
        
    function setGain(value) {
        mix.setArgs({gainL: value, gainR: value});
    }
        
    that = sCBase(container, "sCOut", {mix: mix}, args, uid).addIn("mix");
    that.nextRow();
    that.addLabeledContent(gSlider(mix.getArgs().gainL, 0.0, 1.0, setGain), "VOL");

    //FIXME: global coupling!
    audioWork.mixerOut.addInput(mix);
    
    return that;
}