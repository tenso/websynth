"use strict";
/*global setMouseCapturer*/
/*global getStyle*/
/*global getStyleInt*/
/*global logError*/

function GRadios(container, title) {
    this.buttons = [];
    this.container = container;
    this.title = title;
    this.contId = container.id;
    
    this.table = document.createElement("table");
    this.table.className = "collection-table component";

    this.container.appendChild(this.table);
    
    var titleRow = document.createElement("tr"),
        titleElem = document.createElement("td");
    titleElem.innerText = this.title;
    titleElem.className = "label";
    titleElem.colSpan = 10000;
    titleRow.appendChild(titleElem);
    this.table.appendChild(titleRow);
    
    this.buttonCont = document.createElement("tr");
    this.table.appendChild(this.buttonCont);
}

GRadios.prototype.makeButton = function (id, callback, isRadio) {
    var button = document.createElement("div");
    
    button.siblings = this.buttons;
    button.className = "button-class radio-button-inactive";
    button.innerText = id;
    button.style.position = "relative";
    button.id = "radio-button-" + this.contId + "-" + id;
    button.value = false;
    button.callback = callback;
    button.isRadio = isRadio;
    
    button.onmousedown = function (e) {
        e.stopPropagation();
        this.set();
    };
        
    button.set = function () {
        var i;
        if (this.isRadio) {
            for (i = 0; i < this.siblings.length; i += 1) {
                if (this.siblings[i].isRadio) {
                    this.siblings[i].setValue(this.siblings[i] === this);
                }
            }
        } else {
            this.setValue(!this.value);
        }
    };
    button.setValue = function (value) {
        this.value = value;
        this.className = "button-class " + (this.value ? "radio-button-active" : "radio-button-inactive");
        this.callback(this.value);
    };
    
    return button;
};

/* Returns index of new button */
GRadios.prototype.add = function (label, callback, isRadio) {
    var cont = document.createElement("td"),
        button = this.makeButton(label, callback, isRadio);
                    
    this.buttons.push(button);
    cont.appendChild(button);
    
    this.buttonCont.appendChild(cont);
    
    return this.buttons.length - 1;
};

GRadios.prototype.set = function (index) {
    if (index < 0 || index >= this.buttons.length) {
        logError("index oob in GRadios");
        return;
    }
    this.buttons[index].set();
};