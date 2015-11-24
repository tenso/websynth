"use strict";
/*global Float32Array*/
/*global Log*/
/*global Test*/

function Float32RB(len) {
    this.length = len + 1;
    this.buffer = new Float32Array(this.length);
    this.buffer.fill(0);
    this.setIndex = 0;
    this.getIndex = 0;
}

Float32RB.prototype.get = function () {
    var retVal = this.buffer[this.getIndex];
    this.getIndex += 1;
    this.getIndex %= this.length;
    return retVal;
};

Float32RB.prototype.set = function (val) {
    this.buffer[this.setIndex] = val;
    this.setIndex += 1;
    this.setIndex %= this.length;
};

Float32RB.prototype.setArray = function (array) {
    var i = 0;
    for (i = 0; i < array.length; i += 1) {
        this.set(array[i]);
    }
};

Float32RB.prototype.count = function () {
    if (this.setIndex >= this.getIndex) {
        return this.setIndex - this.getIndex;
    } else {
        return this.length - this.getIndex - this.setIndex;
    }
    
};

Float32RB.prototype.toString = function () {
    var i,
        str = "";
    
    for (i = 0; i < this.buffer.length; i += 1) {
        str += this.buffer[i] + ", ";
    }
    return str;
};

function test_Float32RB() {
    var rb = new Float32RB(4);
    Test.verify(rb.count(), 0);
    rb.set(0);
    rb.set(1);
    Test.verify(rb.count(), 2);
    
    rb.set(2);
    rb.set(3);
    Test.verify(rb.count(), 4);
    
    Test.verify(rb.get(), 0);
    Test.verify(rb.get(), 1);
    Test.verify(rb.count(), 2);
    Test.verify(rb.get(), 2);
    Test.verify(rb.get(), 3);
    Test.verify(rb.count(), 0);
        
    rb.setArray([4, 5, 6]);
    Test.verify(rb.get(), 4);
    Test.verify(rb.count(), 2);
    rb.set(7);
    Test.verify(rb.count(), 3);
    Test.verify(rb.get(), 5);
    Test.verify(rb.count(), 2);
    Test.verify(rb.get(), 6);
    Test.verify(rb.count(), 1);
    Test.verify(rb.get(), 7);
    Test.verify(rb.count(), 0);
}

Test.addTest(test_Float32RB, "Float32RB");