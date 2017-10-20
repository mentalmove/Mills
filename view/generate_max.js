function Move (index, src, gap, indices, targets, place) {
    
    place.piece.style.display = "none";
    
    var mouse_down = true;
    
    var x = src[0];
    var y = src[1];
    
    var piece = document.createElement("div");
    piece.className = "piece";
    piece.style.backgroundColor = "white";
    piece.style.position = "absolute";
    piece.style.left = x + "px";
    piece.style.top = y + "px";
    document.body.appendChild(piece);
    
    function evaluate () {
        document.body.onmouseup = null;
        document.getElementById("base").onmousemove = null;
    }
    
    function mouse_up () {
        
        mouse_down = false;
        
        var success = 0;
        for ( var i = 0; i < targets.length; i++ ) {
            if ( Math.abs(targets[i][0] - x) > 40 )
                continue;
            if ( Math.abs(targets[i][1] - y) > 40 )
                continue;
            rules.swap_pieces(index, indices[i], "white");
            success = 1;
            break;
        }
        
        piece.parentNode.removeChild(piece);
        if ( !success )
            place.piece.style.display = "block";
        move = null;
    }
    
    function mouse_move (ev) {
        if ( !mouse_down ) {
            evaluate();
            return;
        }
        x = ev.clientX - gap[0];
        y = ev.clientY - gap[1];
        piece.style.left = x + "px";
        piece.style.top = y + "px";
    }
    
    document.body.onmouseup = mouse_up;
    document.getElementById("base").onmousemove = mouse_move;
}

function Place (parent_element, index) {
    
    this.piece;
    
    var myself = this;
    
    function fade_away_piece (element, brightness) {
        if ( brightness - 24 <= 0 ) {
            element.parentNode.removeChild(element);
            return;
        }
        element.style.opacity = brightness / 100;
        setTimeout(fade_away_piece, 16, element, (brightness - 4));
    }
    
    this.set_piece = function (colour) {
        myself.piece = document.createElement("div");
        myself.piece.className = "piece";
        myself.piece.style.backgroundColor = colour;
        element.appendChild(myself.piece);
    };
    this.remove_piece = function () {
        if ( !myself.piece )
            return;
        fade_away_piece(myself.piece, 96);
        myself.piece = null;
    };
    
    this.enable_set = function (set_piece_fnc) {
        element.style.cursor = "pointer";
        element.onclick = function () {
            if ( !set_piece_fnc(index)  )
                return;
            myself.set_piece("white");
        };
    };
    this.disable_set = function () {
        element.style.cursor = "default";
        element.onclick = null;
    };
    
    this.enable_remove = function () {
        myself.piece.style.cursor = "pointer";
        myself.piece.onclick = function () {
            rules.remove_piece(index, "black");
        };
    };
    this.disable_remove = function () {
        if ( myself.piece ) {
            myself.piece.style.cursor = "default";
            myself.piece.onclick = null;
        }
    };
    
    this.enable_move = function (indices, target_coordinates) {
        if ( !myself.piece )
            return;
        myself.piece.style.cursor = "pointer";
        myself.piece.onmousedown = function (ev) {
            move = new Move(index, element.style.location, [ev.layerX, ev.layerY], indices, target_coordinates, myself);
        };
    };
    this.disable_move = function () {
        if ( myself.piece ) {
            myself.piece.onmousedown = null;
            myself.piece.style.cursor = "default";
        }
    };
    
    var element = document.createElement("div");
    element.className = "place";
    parent_element.appendChild(element);
    this.style = element.style;
    
    this.update_location = function () {
        element.style.location = get_position(element);
    };
}

function generate () {
    
    var i, j, prop, tmp, val;
    var parent_elements = [
        document.getElementsByClassName("element")[0],
        document.getElementById("middle"),
        document.getElementById("inner")
    ];
    var places = [];

    for ( i = 0; i < 3; i++ ) {
        for ( j = 0; j < 8; j++ ) {
            tmp = new Place(parent_elements[i], (i * 8) + j);
            places.push(tmp);
        }
    }

    var proto_coordinates = [
        {left: "default", top: "default"},
        {left: "0px", right: "0px", top: "default", margin: "auto"},
        {right: "default", top: "default"},
        {right: "default", top: "0px", bottom: "0px", margin: "auto"},
        {right: "default", bottom: "default"},
        {left: "0px", right: "0px", bottom: "default", margin: "auto"},
        {left: "default", bottom: "default"},
        {left: "default", top: "0px", bottom: "0px", margin: "auto"}
    ];

    var place_coordinates = [];
    var def = "-20px";
    for ( i = 0; i < 3; i++ ) {
        for ( j = 0; j < 8; j++ ) {
            tmp = {};
            for ( prop in proto_coordinates[j] ) {
                val = proto_coordinates[j][prop];
                tmp[prop] = (val == "default") ? def : val;
            }
            place_coordinates.push(tmp);
        }
        def = "-44px";
    }

    for ( i = 0; i < places.length, i < place_coordinates.length; i++ )
        for ( prop in place_coordinates[i] )
            places[i].style[prop] = place_coordinates[i][prop];
    
    function on_resize () {
        document.getElementById("base").style.width = get_window_size()[1] + "px";
    }
    window.onresize = on_resize;
    on_resize();
    
    return places;
}

var move = null;
new Interface( generate(), "begin" );
