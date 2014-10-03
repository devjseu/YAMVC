function click(el){
    var ev = document.createEvent("MouseEvent");
    ev.initMouseEvent(
        "click",
        true /* bubble */, true /* cancelable */,
        window, null,
        0, 0, 0, 0, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /*left*/, null
    );
    el.dispatchEvent(ev);
}

function keyup(el, chr){
    var ev = document.createEvent("KeyboardEvent");

    ev.initKeyboardEvent(
        "keyup",
        true, // bubbles
        true, // cancelable
        window,
        false, // ctrlKeyArg
        false, // altKeyArg
        false, // shiftKeyArg
        false, // metaKeyArg
        40, // keyCodeArg : unsigned long the virtual key code, else 0
        chr.charCodeAt(0) // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
    );

    el.dispatchEvent(ev);
}