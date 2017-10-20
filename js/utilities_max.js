function get_position (element) {
    var parent_element = element.offsetParent || document.body;
    var left = element.offsetLeft;
    var top = element.offsetTop;
    while ( parent_element ) {
        left += parent_element.offsetLeft;
        top += parent_element.offsetTop;
        parent_element = parent_element.offsetParent;
    }
    return [left, top];
}
function get_window_size () {
    if ( window.innerHeight )
        return [window.innerWidth, window.innerHeight];
    if ( document.body && document.body.clientHeight )
        return [document.body.clientWidth, document.body.clientHeight];
    if ( document.documentElement && document.documentElement.clientHeight )
        return [document.documentElement.clientWidth, document.documentElement.clientHeight];
    var tmp = document.createElement("div");
    tmp.style.position = "fixed";
    tmp.style.right = "0px";
    tmp.style.bottom = "0px";
    document.body.appendChild(tmp);
    var pos = get_position(tmp);
    tmp.parentNode.removeChild(tmp);
    return pos;
}
