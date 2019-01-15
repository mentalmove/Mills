function Place (element, index) {
    
    var myself = this;
    var piece;
    var click_function;
    
    var area;
    
    
    this.style = element.style;
    this.index = index;
    
    Object.defineProperty(myself, "has_piece", {
        get: function () {
            return piece && piece.colour;
        }
    });
    
    
    this.tell_position = function () {
        return element.getBoundingClientRect();
    };
    this.tell_area = function () {
        return area.getBoundingClientRect();
    };
    
    this.slide_piece = function (src_place, p) {
        if ( piece )
            return;
        piece = p;
        piece.slide(src_place, myself, element);
        element.appendChild(p.element);
    };
    
    this.set_piece = function (p, retarded) {
        if ( piece )
            return;
        if ( retarded == null && p.colour == machine_colour )
            retarded = true;
        piece = p;
        if ( retarded )
            piece.show_slowly("little_slower");
        element.appendChild(p.element);
    };
    this.unset_piece = function () {
        piece = null;
    };
    this.remove_piece = function (immediately) {
        if ( !piece )
            return;
        if ( immediately == null && piece.colour == machine_colour )
            immediately = true;
        if ( immediately )
            element.removeChild(piece.element);
        else
            piece.remove_slowly("little_slower");
        piece = null;
    };
    
    this.enable_remove = function (remove_piece_fnc) {
        if ( !piece )
            return;
        element.style.cursor = "pointer";
        piece.element.classList.add("spin");
        click_function = function () {
            element.style.cursor = "default";
            piece.element.classList.remove("spin");
            myself.disable_remove();
            remove_piece_fnc(index, machine_colour);
        };
        element.addEventListener("touchstart", click_function, false);
        element.addEventListener("mousedown", click_function, false);
    };
    this.disable_remove  = function () {
        if ( piece )
            piece.element.classList.remove("spin");
        myself.disable_set();
    };
    
    this.enable_set = function (set_piece_fnc) {
        if ( piece )
            return;
        element.style.cursor = "pointer";
        click_function = function () {
            element.style.cursor = "default";
            myself.disable_set();
            set_piece_fnc(index, human_colour);
        };
        element.addEventListener("touchstart", click_function, false);
        element.addEventListener("mousedown", click_function, false);
    };
    this.disable_set = function () {
        element.style.cursor = "default";
        if ( click_function ) {
            element.removeEventListener("touchstart", click_function, false);
            element.removeEventListener("mousedown", click_function, false);
        }
        click_function = null;
    };
    
    this.enable_move = function (targets, move_piece_fnc) {
        if ( !piece )
            return;
        myself.disable_set();
        piece.initialise_move(index, targets, move_piece_fnc);
    };
    this.disable_move = function () {
        if ( !piece )
            return;
        piece.disable_move();
    };
    this.move = function (target) {
        if ( !piece )
            return;
        target.slide_piece(myself, piece);
        piece = null;
    };
    
    this.set_play_mode = function () {
        if ( !piece )
            return;
    };
    
    area = document.createElement("div");
    area = document.createElement("div");
    area.className = "place_area";
    element.appendChild(area);
}
