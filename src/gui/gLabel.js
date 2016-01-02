"use strict";
/*global gBase*/

function gLabel(label) {
    var that = gBase();
        
    that.setValue = function (str) {
        that.textContent = str;
        return that;
    };
        
    that.className = "gLabel";
    that.typeIs = "gLabel";
    that.textContent = label;
    return that;
}