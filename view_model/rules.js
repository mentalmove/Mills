var Library = require("../library/utilities.js");

var view, ai;
function set_view (o) {
    view = o;
}
function set_ai (o) {
    ai = o;
    ai.define_id_callback(id_callback);
    ai.define_set_piece_callback(set_piece_callback);
    ai.define_remove_piece_callback(remove_piece_callback);
    ai.define_move_piece_callback(move_piece_callback);
    ai.define_give_up_callback(function () {
        game_over(places, human_colour);
    });
}

var numeric_colours = {
    white: 1,
    black: -1
};
var expected_answer_counter = 1;
var RETARDITION = 150001;

var human_colour, machine_colour;

var actual_colour = "white";

var places, initial_pieces;

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
function get_slides () {
    var slides = [];
    var tmp, j;
    for ( var i = 0; i < places.length; i++ ) {
        if ( places[i].has_piece == human_colour ) {
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
function get_board () {
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
    return board;
}

/*  */

function piece_removed (index, colour) {

    var validated = true;
    if ( places[index].has_piece != colour )
        validated = false;
    if ( !validated ) {
        if ( colour == machine_colour ) {
            var removable = [];
            var redundant = get_jump_targets(removable, machine_colour);
            view.enable_remove(places, removable, piece_removed);
        }
        return;
    }

    places[index].remove_piece();

    var counter = 0;
    for ( var i = 0; i < places.length; i++ ) {
        if ( places[i].has_piece == colour )
            counter++;
    }
    if ( (counter + initial_pieces[colour].length) < 3 ) {
        view.game_over(places, actual_colour);
        return;
    }

    toggle_actor();
}
function piece_set (index, colour) {

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
        if ( colour == machine_colour ) {
            view.show_board(places);
            machine_move(expected_answer_counter, true);
        }
        else {
            var removable = [];
            var redundant = get_jump_targets(removable, machine_colour);
            view.enable_remove(places, removable, piece_removed);
        }
    }
    else
        toggle_actor();
}
function piece_moved (source_index, target_index, colour) {
        
    places[source_index].remove_piece(true);
    places[target_index].set_piece(new view.Piece(colour));

    if ( check_builds_mill(target_index, colour) ) {
        if ( colour == machine_colour ) {
            view.show_board(places);
            machine_move(expected_answer_counter, true);
        }
        else {
            var removable = [];
            var redundant = get_jump_targets(removable, machine_colour);
            view.enable_remove(places, removable, piece_removed);
        }
    }
    else
        setTimeout(toggle_actor, 41);
}

function enable_move () {
    var slides = get_slides();
    if ( !slides.length ) {
        view.game_over(places, machine_colour);
        return;
    }
    view.enable_move(places, slides, piece_moved);
}
function enable_jump () {

    var sources = [];
    var targets = get_jump_targets(sources, human_colour);

    if ( sources.length > 3 ) {
        enable_move();
        return;
    }

    var slides = [];
    for ( var i = 0; i < sources.length; i++ )
        slides.push([sources[i], targets]);
    view.enable_move(places, slides, piece_moved);
}

/*  */

function human_move () {

    if ( initial_pieces[human_colour].length ) {
        var targets = get_jump_targets();
        view.enable_set(places, targets, piece_set);
        return;
    }

    var counter = 0;
    for ( var i = 0; i < places.length; i++ ) {
        if ( places[i].has_piece == human_colour )
            counter++;
    }
    if ( counter < 3 ) {
        view.game_over(places, machine_colour);
        return;
    }
    if ( counter == 3 ) {
        enable_jump();
        return;
    }
    enable_move(human_colour);
}
function machine_move (id, remove) {

    if ( expected_answer_counter != id )
        return;

    var msg = {
        id: id,
        moving: actual_colour,
        initial_pieces: [initial_pieces.white.length, initial_pieces.black.length],
        remove: !!remove
    };
    msg.board = get_board();

    ai.sendMessage(msg);

    setTimeout(machine_move, RETARDITION, id, remove);
}
function id_callback () {
    expected_answer_counter++;
}
function set_piece_callback (place) {
    console.log( places[place].show_index + " SET" );
    piece_set(place, machine_colour);
}
function remove_piece_callback (place) {
    console.log( places[place].show_index + " REMOVED" );
    piece_removed(place, human_colour);
}
function move_piece_callback (from, to) {
    console.log( "MOVED " + places[from].show_index + " - " + places[to].show_index );
    piece_moved(from, to, machine_colour);
}

function toggle_actor () {
    actual_colour = (actual_colour == "white") ? "black" : "white";
    if ( actual_colour == human_colour )
        human_move();
    else {
        if ( initial_pieces[human_colour].length < 9 )
            view.show_board(places);
        machine_move(expected_answer_counter);
    }
}

/*  */

function set_colour (h, m) {
    human_colour = h;
    machine_colour = m;
}
function main (h, m) {
    if ( h )
        set_colour(h, m);
    if ( !human_colour )
        return;
    
    places = view.generate_places();
    initial_pieces = {
        white: view.generate_pieces("white"),
        black: view.generate_pieces("black")
    };
    
    /*places[0].set_piece(initial_pieces[human_colour].pop());
    places[1].set_piece(initial_pieces[human_colour].pop());
    places[2].set_piece(initial_pieces[machine_colour].pop());
    places[3].set_piece(initial_pieces[machine_colour].pop());
    
    places[4].set_piece(initial_pieces[human_colour].pop());
    places[5].set_piece(initial_pieces[machine_colour].pop());*/
    
    /*places[4].set_piece(initial_pieces[human_colour].pop());
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
    places[15].set_piece(initial_pieces[human_colour].pop());*/
    
    if ( actual_colour == human_colour )
        human_move();
    else
        machine_move(expected_answer_counter);
}

module.exports = {
    set_view: set_view,
    set_ai: set_ai,
    set_colour: set_colour,
    main: main
};
