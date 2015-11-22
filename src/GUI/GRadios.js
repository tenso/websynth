"use strict";
/*global setMouseCapturer*/
/*global getStyle*/
/*global getStyleInt*/
/*global logError*/

/*global gContainerInit*/
/*global gContainerAddContent*/
/*global gMakeButton*/

function GRadios(container, title) {
    gContainerInit(this, container, "radiobuttons", title);
    this.radioGroup = [];
}

/* Returns index of new button */
GRadios.prototype.add = function (label, callback, isRadio) {
    var button = gMakeButton(label, callback, isRadio, this.radioGroup);
    gContainerAddContent(this, button);
    
    return this.radioGroup.length - 1;
};

GRadios.prototype.set = function (index) {
    if (index < 0 || index >= this.radioGroup.length) {
        logError("index oob in GRadios");
        return;
    }
    this.radioGroup[index].set();
};

GRadios.prototype.setValue = function (index, value) {
    if (index < 0 || index >= this.radioGroup.length) {
        logError("index oob in GRadios");
        return;
    }
    this.radioGroup[index].setValue(value);
};