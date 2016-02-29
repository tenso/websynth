/*jslint node: true */

/*global gWidget*/
/*global gLabel*/

"use strict";

function wNote(note, label) {
    var that = gWidget(label).addRemove(),
        textContent = gLabel(note, "html").w(650).h(250).userSelect("text").stopPropagation(true);

    that.setTitle(label || "Note");
    textContent.overflow("auto").whiteSpace("pre").textAlign("left").fontFamily("sans-serif").fontSize(16);
    that.addTabled(textContent);
    that.typeIs = "wNote";
    return that;
}
