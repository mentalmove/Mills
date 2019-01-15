function Machine (element) {
    
    function get_offset (src, tgt) {
        var src_coordinates = src.tell_position();
        var tgt_coordinates = tgt.tell_position();
        var left = parseInt(src_coordinates.left - tgt_coordinates.left);
        var top = parseInt(src_coordinates.top - tgt_coordinates.top);
        return [left, top];
    }
    
    function animate (cloned, coordinates) {
        cloned.style.transform = "translate(" + (0 - coordinates[0]) + "px, " + (0 - coordinates[1]) + "px)";
        cloned.addEventListener("transitionend", finish, true);
    }
    
    function finish (ev) {
        ev.target.removeEventListener("transitionend", finish, true);
        ev.target.parentNode.removeChild(ev.target);
        element.style.visibility = "visible";
    }
    
    function clone (src, tgt_class, tgt_element) {
        var cloned = element.cloneNode(true);
        cloned.style.visibility = "visible";
        cloned.style.zIndex = 1;
        var coordinates = get_offset(src, tgt_class);
        cloned.style.left = coordinates[0] + "px";
        cloned.style.top = coordinates[1] + "px";
        tgt_element.appendChild(cloned);
        cloned.classList.add("rather_slow");
        setTimeout(animate, 41, cloned, coordinates);
    }
    
    this.initialise = function (src, tgt_class, tgt_element) {
        element.style.visibility = "hidden";
        clone(src, tgt_class, tgt_element);
    };
}
