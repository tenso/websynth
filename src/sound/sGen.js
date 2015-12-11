"use strict";
/*global sBase*/

function sGen(args) {
    var that = sBase("gen"),
        inPhase = 0,
        amp = 0.1,
        phase = 0,
        freq = 220,
        type = "sine",
        isOn = true;
    
    that.makeAudio = function () {
        var i = 0,
            chan = 0,
            T,
            period,
            phaseStep,
            newFreq = freq,
            inPeriod;
        
        T = (2 * Math.PI * freq) / that.sampleRate();
        period = that.sampleRate() / (freq);
        
        for (i = 0; i < that.wantedSamples(); i += 1) {
            
            if (that.haveSpecialInput("freq")) {
                newFreq = that.getSpecialChannelData("freq", 0)[i];
            }
            
            if (newFreq !== freq) {
                freq = newFreq;
                T = (2 * Math.PI * freq) / that.sampleRate();
                period = that.sampleRate() / (freq);
            }
            
            if (!isOn) {
                that.genData[i] = 0;
            } else if (type === "sine") {
                inPhase += T;
                that.genData[i] = amp * Math.sin(inPhase + phase);
            } else if (type === "square") {
                inPhase += 1;
                inPeriod = (inPhase + phase) % period;
                that.genData[i] = amp * (inPeriod < (period / 2.0) ? 1.0 : -1.0);
            }
        }

        for (chan = 0; chan < that.numChannels(); chan += 1) {
            that.data[chan] = that.genData.slice();
        }
    };

    that.getArgs = function () {
        return {"amp": amp, "freq": freq, "phase": phase, "type": type, "isOn": isOn};
    };
    
    that.setArgs = function (args) {
        if (args) {
            amp = typeof args.amp === "number" ? args.amp : amp;
            freq = typeof args.freq === "number" ? args.freq : freq;
            phase = typeof args.phase === "number" ? args.phase : phase;
            type = typeof args.type === "string" ? args.type : type;
            isOn = typeof args.isOn === "boolean" ? args.type : isOn;
        }
    };
    that.setArgs(args);
    return that;
}

