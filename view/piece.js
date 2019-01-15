function Piece (colour) {
    
    var myself = this;
    
    var human;
    var machine;
    
    
    this.colour = colour;
    
    
    this.show_slowly = function (class_name) {
        class_name = class_name || "medium_slow";
        myself.element.style.opacity = 0;
        myself.element.classList.add(class_name);
        var transitionend = function () {
            myself.element.classList.remove(class_name);
            myself.element.removeEventListener("transitionend", transitionend, true);
        };
        myself.element.addEventListener("transitionend", transitionend, true);
        setTimeout(function () {
            myself.element.style.opacity = 1;
        }, 17);
        setTimeout(transitionend, 1001);
    };
    this.remove_slowly = function (class_name) {
        class_name = class_name || "medium_slow";
        myself.element.classList.add(class_name);
        myself.element.addEventListener("transitionend", function (ev) {
            if ( !ev.target || !ev.target.parentNode )
                return;
            ev.target.parentNode.removeChild(ev.target);
        }, true);
        setTimeout(function (el) {
            el.style.opacity = 0;
        }, 17, myself.element);
        setTimeout(function (el) {
            if ( el && el.parentNode )
                el.parentNode.removeChild(el);
        }, 1001, myself.element);
    };
    
    this.initialise_move = function (index, targets, callback) {
        machine = null;
        human = human || new Human(myself.element);
        human.initialise(myself, index, targets, callback);
    };
    this.disable_move = function () {
        if ( !human )
            return;
        human.reset();
    };
    
    this.slide = function (src, tgt_class, tgt_element) {
        human = null;
        machine = machine || new Machine(myself.element);
        machine.initialise(src, tgt_class, tgt_element);
    };
    
    
    this.element = document.createElement("div");
    this.element.className = "piece " + colour;
}
