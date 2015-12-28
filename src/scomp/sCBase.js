"use strict";
/*global gWidget*/
/*global inPort*/
/*global outPort*/
/*global gIO*/
/*global log*/
/*global uidGen*/
/*global lang*/
/*global sSequence*/
//FIXME: rename all sC to sG
//FIXME: rename all sId to portName?

var scBaseUID = uidGen();

function sCBase(context, type, sComps, uid) {
    var that = gWidget(context, lang.tr(type)),
        ports = {},
        myUID,
        seq = {},
        guiControls;

    function makeRemoveAllConnections() {
        return function () {
            gIO.delAllConnectionsToAndFromUID(that.uid());
        };
    }
    
    function setGuiControlAfterArg(sId, args) {
        var arg;
        
        if (guiControls) {
            if (guiControls.hasOwnProperty(sId)) {
                for (arg in args) {
                    if (args.hasOwnProperty(arg)) {
                        if (guiControls[sId].hasOwnProperty(arg)) {
                            guiControls[sId][arg].setValue(args[arg], true);
                        }
                    }
                }
            }
        }
    }
        
    function initStates() {
        var sId;
        for (sId in sComps) {
            if (sComps.hasOwnProperty(sId)) {
                seq[sId] = sSequence(sComps[sId], sId, setGuiControlAfterArg);
            }
        }
    }
    
    that.setAndSaveArgs = function (sId, args) {
        if (sComps.hasOwnProperty(sId)) {
            seq[sId].setArgs(args);
            seq[sId].saveAt();
        } else {
            log.error("no such sId:" + sId);
        }
    };
    
    that.setGuiControls = function (controls) {
        guiControls = controls;
    };

    //FIXME: mixin uid functions?
    that.uid = function () {
        return myUID;
    };

    that.setArgs = function (sArgs) {
        var sId;
        for (sId in seq) {
            if (seq.hasOwnProperty(sId)) {
                if (sArgs && sArgs.hasOwnProperty(sId)) {
                    seq[sId].load(sArgs[sId]);
                    setGuiControlAfterArg(sId, sArgs[sId].args);
                }
            }
        }
    };

    that.clearPorts = function () {
        var sId;
        for (sId in sComps) {
            if (sComps.hasOwnProperty(sId)) {
                ports[sId] = [];
            }
        }
    };

    that.addIn = function (sId, type) {
        if (!sComps.hasOwnProperty(sId)) {
            log.error("sCBase.addIn: dont have:" + sId);
            return;
        }
        
        var port = inPort(that.uid(), sComps[sId], sId, type);
        that.addLabeledContent(port, type || "in");
        ports[sId].push(port);
        return that;
    };
    
    that.addOut = function (sId, type) {
        if (!sComps.hasOwnProperty(sId)) {
            log.error("sCBase.addOut dont have:" + sId);
            return;
        }
        
        var port = outPort(that.uid(), sComps[sId], sId, type);
        that.addLabeledContent(port, type || sId || "out");
        ports[sId].push(port);
        return that;
    };
    
    that.data = function () {
        var sId,
            i,
            data = {
                type: type,
                uid: that.uid(),
                x: that.getX(),
                y: that.getY(),
                sComps: [],
                sArgs: {}
            };

        for (sId in sComps) {
            if (sComps.hasOwnProperty(sId)) {
                data.sComps.push({
                    type: sComps[sId].typeId(),
                    sId: sId
                });
            }
        }
        
        for (sId in seq) {
            if (seq.hasOwnProperty(sId)) {
                data.sArgs[sId] = seq[sId].data();
            }
        }
        
        return data;
    };
    
    that.getPort = function (sId, isOut, type) {
        var i;
        
        if (!sComps.hasOwnProperty(sId)) {
            log.error(that.uid() + ".getPort: dont have:" + sId);
            log.obj(sComps);
            return;
        }
        
        for (i = 0; i < ports[sId].length; i += 1) {
            if (ports[sId][i].isOut === isOut && ports[sId][i].portType === type) {
                return ports[sId][i];
            }
        }
        log.error("could not find port");
        return undefined;
    };
    
    that.setMs = function (ms) {
        if (typeof ms !== "number" || isNaN(ms)) {
            log.error("scBase.setMs: ms not a number");
            return;
        }
        var sId;
        for (sId in seq) {
            if (seq.hasOwnProperty(sId)) {
                seq[sId].moveToMs(ms);
            }
        }
    };
    
    if (typeof uid === "number") {
        myUID = uid;
    } else {
        myUID = scBaseUID.getUID();
    }
    
    initStates();
    that.addRemove(makeRemoveAllConnections());
    that.clearPorts();
    
    return that;
}