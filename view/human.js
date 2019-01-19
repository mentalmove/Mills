var Human = (function (playground) {

    function Mousedriven () {

        function remove_events (element) {
            playground.removeEventListener("mouseup", element.mouseup, false);
            playground.removeEventListener("mouseleave", element.mouseleave, false);
            playground.removeEventListener("mousemove", element.mousemove, false);

            if ( element.cloned && element.cloned.parentNode ) {
                element.cloned.removeEventListener("mouseup", element.mouseup, false);
                element.cloned.removeEventListener("mousemove", element.mousemove, false);
                element.cloned.parentNode.removeChild(element.cloned);
            }
            element.style.visibility = "visible";
        }

        function mousedown (ev) {
            var element = ev.target;
            var size = element.get_size();
            element.start(ev.pageX, ev.pageY, size);

            element.mousemove = function (ev) {
                element.move(ev.pageX, ev.pageY, size, remove_events);
            };
            playground.addEventListener("mousemove", element.mousemove, false);
            element.cloned.addEventListener("mousemove", element.mousemove, false);

            element.mouseup = function (ev) {
                mouseup(ev, element);
            };
            playground.addEventListener("mouseup", element.mouseup, false);
            element.cloned.addEventListener("mouseup", element.mouseup, false);

            element.mouseleave = function (ev) {
                mouseleave(ev, element);
            };
            playground.addEventListener("mouseleave", element.mouseleave, false);

            element.style.visibility = "hidden";
        }
        function mouseup (ev, element) {
            element.end(ev.pageX, ev.pageY);
            remove_events(element);
        }
        function mouseleave (ev, element) {
            if ( !ev.explicitOriginalTarget || ev.explicitOriginalTarget == element )
                return;
            if ( ev.pageX && ev.pageY )
                element.end(ev.pageX, ev.pageY);
            else
                element.end(-666, -666);
            remove_events(element);
        }

        this.initialise_events = function (element) {
            element.style.cursor = "pointer";
            element.addEventListener("mousedown", mousedown, false);
        };
        this.reset_events = function (element) {
            element.style.cursor = "default";
            element.removeEventListener("mousedown", mousedown, false);
        };

    }
    function Touchdriven () {

        function remove_events (element) {

            playground.removeEventListener("touchcancel", element.touchcancel, false);
            element.removeEventListener("touchmove", element.touchmove, false);

            if ( element.cloned && element.cloned.parentNode ) {
                element.cloned.parentNode.removeChild(element.cloned);
            }
            element.style.visibility = "visible";
        }

        function touchstart (ev) {
            ev.preventDefault();
            var element = ev.touches[0].target;
            var size = element.get_size();
            element.start(ev.touches[0].pageX, ev.touches[0].pageY, size);

            element.touchcancel = function (ev) {
                touchcancel(ev, element);
            };
            playground.addEventListener("touchcancel", element.touchcancel, false);

            element.touchmove = function (ev) {
                var touch = ev.targetTouches[0];
                element.move(touch.pageX, touch.pageY, size, remove_events);
            };
            element.addEventListener("touchmove", element.touchmove, false);

            element.style.visibility = "hidden";
        }
        function touchend (ev) {
            var touches = ev.changedTouches[0];
            var element = ev.changedTouches[0].target;

            element.end(touches.clientX, touches.clientY);
            remove_events(element);
        }
        function touchcancel (ev, element) {
            remove_events(element);
        }


        this.initialise_events = function (element) {
            element.addEventListener("touchstart", touchstart, false);
            element.addEventListener("touchend", touchend, false);
        };
        this.reset_events = function (element) {
            element.removeEventListener("touchstart", touchstart, false);
            element.removeEventListener("touchend", touchend, false);
        };
    }

    var utilities;
    if( navigator.userAgent.match(/android|iphone|ipad|mobile|surface/i) ) {
        try {
            var dummy = new TouchEvent("touchstart");
            utilities = new Touchdriven();
        }
        catch (e) {}
    }
    if ( !utilities )
        utilities = new Mousedriven();

    return function (element) {
        
        var myself = this;

        var piece;
        var targets;
        var callback;
        var src_index = -1;

        function start (pageX, pageY, size) {
            if ( !element.cloned ) {
                element.cloned = element.cloneNode(true);
                element.cloned.style.position = "absolute";
                element.cloned.style.width = size.w + "px";
                element.cloned.style.height = size.h + "px";
                element.cloned.style.zIndex = 1;
            }
            element.cloned.style.left = (pageX - size.center_x) + "px";
            element.cloned.style.top = (pageY - size.center_y) + "px";
            document.body.appendChild(element.cloned);
        }
        function move (pageX, pageY, size, abort_fnc) {
            if ( !element.cloned ) {
                abort_fnc(element);
                return;
            }
            element.cloned.style.left = (pageX - size.center_x) + "px";
            element.cloned.style.top = (pageY - size.center_y) + "px";
        }
        function end (pageX, pageY) {
            if ( !targets || !targets.length )
                return;
            var rect;
            for ( var i = 0; i < targets.length; i++ ) {
                rect = targets[i].tell_area();
                if ( pageX > rect.left && pageY > rect.top && pageX < rect.right && pageY < rect.bottom ) {
                    if ( !piece || src_index < 0 || !callback )
                        return;
                    callback(src_index, targets[i].index, human_colour, piece);
                    setTimeout(function () {
                        delete element.cloned;
                    }, 17);
                    myself.reset();
                    return;
                }
            }
        }
        function get_size () {
            var rect = element.getBoundingClientRect();
            return {w: Math.round(rect.width), h: Math.round(rect.height), center_x: parseInt(rect.width / 2), center_y: parseInt(rect.height / 2)};
        }
        element.start = start;
        element.move = move;
        element.end = end;
        element.get_size = get_size;

        this.initialise = function (p, i, t, cb) {
            piece = p;
            src_index = i;
            targets = t;
            callback = cb;
            utilities.initialise_events(element);
        };
        this.reset = function () {
            src_index = -1;
            targets = null;
            callback = null;
            utilities.reset_events(element);
        };
    };
})(document.getElementById("base"));
