"use strict";
/*global SBase*/
/*global extend*/

function SMix() {
    SBase.call(this);
    this.gain = [1.0, 1.0];
}
extend(SBase, SMix);


SMix.prototype.makeAudio = function () {
    var i = 0,
        chan = 0,
        chanData,
        inputIndex;
        
    for (chan = 0; chan < this.channels; chan += 1) {
        chanData = this.data[chan];
        chanData.fill(0);
        for (inputIndex = 0; inputIndex < this.inputs.length; inputIndex += 1) {
            for (i = 0; i < chanData.length; i += 1) {
                chanData[i] += this.gain[chan] * this.inputs[inputIndex].data[chan][i];
            }
        }
    }
};

SMix.prototype.setGain = function (chan, gain) {
    this.gain[chan] = gain;
};
