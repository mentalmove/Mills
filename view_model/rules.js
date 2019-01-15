var human_colour = "white";
var machine_colour = "black";

function Rules () {
    
    var actual_colour = "white";
    
    var numeric_colours = {
        white: 1,
        black: -1
    };
    
    var expected_answer_counter = 1;
    
    var RETARDITION = 150001;
    
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
        
        //console.log( source_index + " => " + target_index + " " + colour + "; human: " + (colour == human_colour) );
        
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
    function machine_move (id, remove) {
        
        if ( expected_answer_counter != id )
            return;
        
        indicate_thinking(machine_colour);
        
        var msg = {
            id: id,
            moving: actual_colour,
            initial_pieces: [initial_pieces.white.length, initial_pieces.black.length],
            remove: !!remove
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
        msg.board = board;
        
        ai.postMessage(msg);
        
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
    
    var ai = new Worker( "model/ai.js" );
    ai.onmessage = function ( event ) {
        
        if ( !event.data || event.data.id != expected_answer_counter )
            return;
        
        console.log( event.data );
        
        expected_answer_counter++;
        
        switch (event.data.task) {
            case "set_piece":
                piece_set(event.data.place, machine_colour);
            break;
            case "move_piece":
                piece_moved(event.data.from, event.data.to, machine_colour);
            break;
            case "jump_piece":
                piece_moved(event.data.from, event.data.to, machine_colour);
            break;
            case "remove_piece":
                setTimeout(piece_removed, 1001, event.data.place, human_colour);
                //piece_removed(event.data.place, human_colour);
            break;
            case "give_up":
                game_over(human_colour);
            break;
        }
    };
    
    // [0, 0, 0, 0, 0, 0, -1, 1, -1, -1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0]
    
/*var test = [
        0,
  0,
  0,
  1,
  -1,
  1,
  0,
  0,
  -1,
        1,
  0,
  -1,
  -1,
  1,
  0,
  0,
  -1,
  1,
  -1,
  0,
  -1,
  1,
  -1,
  0
];
for ( var t = 0; t < test.length; t++ ) {
    if ( !test[t] )
        continue;
    if ( test[t] > 0 )
        places[t].set_piece(initial_pieces[human_colour].pop());
    else
        places[t].set_piece(initial_pieces[machine_colour].pop());
}
initial_pieces.white = [];
initial_pieces.black = [];
actual_colour = machine_colour;*/
    
    //places[0].set_piece(initial_pieces[machine_colour].pop());
    //places[1].set_piece(initial_pieces[machine_colour].pop());
    //places[2].set_piece(initial_pieces[machine_colour].pop());
    //places[3].set_piece(initial_pieces[machine_colour].pop());
    //places[14].set_piece(initial_pieces[machine_colour].pop());
    
    //places[8].set_piece(initial_pieces[human_colour].pop());
    //places[9].set_piece(initial_pieces[human_colour].pop());
    //places[10].set_piece(initial_pieces[human_colour].pop());
    //places[12].set_piece(initial_pieces[human_colour].pop());
    //places[13].set_piece(initial_pieces[human_colour].pop());
    
    /*places[0].set_piece(initial_pieces[human_colour].pop());
    places[1].set_piece(initial_pieces[human_colour].pop());
    places[2].set_piece(initial_pieces[machine_colour].pop());
    places[3].set_piece(initial_pieces[machine_colour].pop());
    places[4].set_piece(initial_pieces[human_colour].pop());
    places[5].set_piece(initial_pieces[human_colour].pop());
    places[6].set_piece(initial_pieces[machine_colour].pop());
    places[7].set_piece(initial_pieces[machine_colour].pop());
    
    places[8].set_piece(initial_pieces[machine_colour].pop());
    places[9].set_piece(initial_pieces[machine_colour].pop());
    places[10].set_piece(initial_pieces[human_colour].pop());
    places[11].set_piece(initial_pieces[human_colour].pop());
    places[12].set_piece(initial_pieces[machine_colour].pop());
    places[13].set_piece(initial_pieces[machine_colour].pop());
    places[14].set_piece(initial_pieces[human_colour].pop());
    places[15].set_piece(initial_pieces[human_colour].pop());
    
    places[16].set_piece(initial_pieces[human_colour].pop());
    places[17].set_piece(initial_pieces[machine_colour].pop());*/
    
    
    if ( actual_colour == human_colour )
        human_move();
    else
        machine_move(expected_answer_counter);
}
new Rules();
