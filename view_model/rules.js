var human_colour = "white";
var machine_colour = "black";

function Rules () {
    
    var actual_colour = "white";
    
    var numeric_colours = {
        white: 1,
        black: -1
    };
    
    var expected_answer_counter = 1;
    
    var RETARDITION = 10001;
    
    /*  */
    
    function get_jump_targets (sources, colour) {
        var targets = [];
        var has_piece;
        for ( var i = 0; i < places.length; i++ ) {
            has_piece = places[i].has_piece;
            if ( !has_piece )
                targets.push(places[i]);
            else {
                if ( sources && (!colour || colour == has_piece) )
                    sources.push(places[i]);
            }
                
        }
        return targets;
    }
    function get_slides (colour) {
        var slides = [];
        var tmp, j;
        for ( var i = 0; i < places.length; i++ ) {
            if ( places[i].has_piece == colour ) {
                tmp = [];
                for ( j = 0; j < Library.neighbours[i].length; j++ ) {
                    if ( !places[Library.neighbours[i][j]].has_piece )
                        tmp.push( places[Library.neighbours[i][j]] );
                }
                if ( tmp.length )
                    slides.push([places[i], tmp]);
            }
        }
        return slides;
    }
    
    function check_builds_mill (index, colour) {
        var mills = Library.mills[index];
        var j, result;
        for ( var i = 0; i < mills.length; i++ ) {
            result = 0;
            for ( j = 0; j < 3; j++ ) {
                if ( mills[i][j] == index )
                    continue;
                if ( places[mills[i][j]].has_piece && places[mills[i][j]].has_piece == colour )
                    result++;
                else
                    break;
            }
            if ( result == 2 )
                return true;
        }
        return false;
    }
    
    /*  */
    
    function piece_removed (index, colour) {
        
        for ( var i = 0; i < places.length; i++ )
            places[i].disable_remove();
        
        var validated = true;
        if ( places[index].has_piece != colour )
            validated = false;
        if ( !validated ) {
            enable_remove(colour);
            return;
        }
        
        places[index].remove_piece();
        
        var counter = 0;
        for ( var i = 0; i < places.length; i++ ) {
            if ( places[i].has_piece == colour )
                counter++;
        }
        if ( (counter + initial_pieces[colour].length) < 3 ) {
            game_over(actual_colour);
            return;
        }
        
        toggle_actor();
    }
    function enable_remove (colour) {
        
        indicate_thinking(actual_colour);
        
        var i;
        
        if ( actual_colour == human_colour ) {
            var not_in_mill = [];
            var is_in_mill = [];
            var has_piece;
            var other_colour = (actual_colour == "white") ? "black" : "white";
            for ( var i = 0; i < places.length; i++ ) {
                has_piece = places[i].has_piece;
                if ( !has_piece || has_piece == actual_colour )
                    continue;
                if ( check_builds_mill(i, other_colour) )
                    is_in_mill.push(places[i]);
                else
                    not_in_mill.push(places[i]);
            }
            var removable = (not_in_mill.length) ? not_in_mill : is_in_mill;
            
            if ( !removable.length ) {
                game_over(actual_colour);
                return;
            }
            
            for ( var i = 0; i < removable.length; i++ )
                removable[i].enable_remove(piece_removed);
        }
        else {
            
        }
    }
    
    function piece_set (index, colour) {
        
        for ( var i = 0; i < places.length; i++ )
            places[i].disable_set();
        
        var validated = true;
        if ( !initial_pieces[colour] || !initial_pieces[colour].length )
            validated = false;
        if ( places[index].has_piece )
            validated = false;
        if ( !validated ) {
            if ( colour == human_colour )
                human_move();
            else
                machine_move(expected_answer_counter);
            return;
        }
        
        var builds_mill = check_builds_mill(index, colour);
        
        places[index].set_piece(initial_pieces[colour].pop());
        if ( builds_mill ) {
            var other_colour = (colour == "white") ? "black" : "white";
            if ( colour == human_colour )
                enable_remove(other_colour);
            else
                machine_move(expected_answer_counter, true);
        }
        else
            toggle_actor();
    }
    function enable_set () {
        var targets = get_jump_targets();
        for ( var i = 0; i < targets.length; i++ )
            targets[i].enable_set(piece_set);
    }
    
    function piece_moved (source_index, target_index, colour, piece) {
        
        if ( colour == human_colour ) {
            var slides = get_slides(colour);
            for ( var i = 0; i < slides.length; i++ )
                slides[i][0].disable_move();
            if ( piece ) {
                places[source_index].unset_piece();
                places[target_index].set_piece(piece);
            }
            else {
                places[source_index].remove_piece(true);
                places[target_index].set_piece(new Piece(colour));
            }
        }
        else {
            if ( !places[source_index] ) {
                places[source_index].remove_piece(true);
                places[target_index].set_piece(new Piece(colour));
            }
            else
                places[source_index].move(places[target_index]);
        }
        
        var builds_mill = check_builds_mill(target_index, colour);
        if ( builds_mill ) {
            if ( colour == human_colour )
                enable_remove(machine_colour);
            else
                machine_move(expected_answer_counter, true);
            return;
        }
        
        setTimeout(toggle_actor, 41);
    }
    function enable_move () {
        var slides = get_slides(human_colour);
        if ( !slides.length ) {
            game_over(machine_colour);
            return;
        }
        for ( var i = 0; i < slides.length; i++ )
            slides[i][0].enable_move(slides[i][1], piece_moved);
    }
    
    function enable_jump () {
        
        var sources = [];
        var targets = get_jump_targets(sources, human_colour);
        
        if ( sources.length > 3 ) {
            enable_move();
            return;
        }
        
        for ( var i = 0; i < sources.length; i++ )
            sources[i].enable_move(targets, piece_moved);
    }
    
    /*  */
    
    function human_move () {
        
        indicate_thinking();
        
        if ( initial_pieces[human_colour].length ) {
            enable_set();
            return;
        }
        
        var counter = 0;
        for ( var i = 0; i < places.length; i++ ) {
            if ( places[i].has_piece == human_colour )
                counter++;
        }
        if ( counter < 3 ) {
            game_over(machine_colour);
            return;
        }
        if ( counter == 3 ) {
            enable_jump(human_colour);
            return;
        }
        enable_move(human_colour);
    }
    function load_script (url) {
        var script_node = document.createElement("script");
        script_node.setAttribute("type","text/javascript");
        script_node.setAttribute("src", url);
        document.getElementsByTagName("head")[0].appendChild(script_node);
        script_node.onload = setTimeout(function (node) {
            node.parentNode.removeChild(node);
        }, 41, script_node);
}
    function machine_move (id, remove) {
        
        if ( expected_answer_counter != id )
            return;
        
        indicate_thinking(machine_colour);
        
        var msg = {
            id: id,
            /*  moving: actual_colour,  */
            initial_pieces: initial_pieces.black.length,
            remove: +(!!remove)
        };
        var board = [];
        var has_piece, value;
        for ( var i = 0; i < places.length; i++ ) {
            has_piece = places[i].has_piece;
            if ( !has_piece )
                value = 0;
            else
                value = numeric_colours[has_piece];
            board[i] = value;
        }
        //msg.board = board;
        
        var url = "model/?";
        for ( var prop in msg )
            url += "&" + prop + "=" + msg[prop];
        url += "&board=" + board.toString();
        
        load_script (url);
        
        setTimeout(machine_move, RETARDITION, id, remove);
    }
    function toggle_actor () {
        actual_colour = (actual_colour == "white") ? "black" : "white";
        if ( actual_colour == human_colour )
            human_move();
        else
            machine_move(expected_answer_counter);
    }
    
    function game_over (winner) {
        indicate_thinking(winner + "_wins");
        change_borders(winner);
        console.log( winner + " wins!" );
    }
    
    /**
     * Constructor
     */
    var places = generate_places();
    var initial_pieces = {
        white: generate_pieces("white"),
        black: generate_pieces("black")
    };
    
    window.rules = {
        set_piece: function (place, id) {
            if ( id != expected_answer_counter )
                return;
            expected_answer_counter++;
            piece_set(place, machine_colour);
        },
        move_piece: function (from, to, id) {
            if ( id != expected_answer_counter )
                return;
            expected_answer_counter++;
            piece_moved(from, to, machine_colour);
        },
        remove_piece: function (place, id) {
            if ( id != expected_answer_counter )
                return;
            expected_answer_counter++;
            setTimeout(piece_removed, 1001, place, human_colour);
        },
        give_up: function (id) {
            if ( id != expected_answer_counter )
                return;
            expected_answer_counter++;
            game_over(human_colour);
        }
    };
    
    
    if ( actual_colour == human_colour )
        human_move();
    else
        machine_move(expected_answer_counter);
}
new Rules();
