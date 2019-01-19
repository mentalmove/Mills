var calculation = require("./calculation.js");

var id_callback, set_piece_callback, remove_piece_callback, move_piece_callback, give_up_callback;
function define_id_callback (f) {
    id_callback = f;
}
function define_set_piece_callback (f) {
    set_piece_callback = f;
}
function define_remove_piece_callback (f) {
    remove_piece_callback = f;
}
function define_move_piece_callback (f) {
    move_piece_callback = f;
}
function define_give_up_callback (f) {
    give_up_callback = f;
}

var callback_id;
var colour_indices = {
    white: 0,
    black: 1
};

function convert (board) {
    var white_board = 0;
    var black_board = 0;
    var white_pieces = 0;
    var black_pieces = 0;
    for ( var i = 0; i < 24; i++ ) {
        if ( !board[i] )
            continue;
        if ( board[i] == 1 ) {
            white_board |= 1 << i;
            white_pieces++;
            continue;
        }
        black_board |= 1 << i;
        black_pieces++;
    }
    return {
        white_board: white_board,
        black_board: black_board,
        pieces: {
            white: white_pieces,
            black: black_pieces
        }
    };
}

//var _set_piece = calculation._set_piece;
//var _move_piece = calculation._move_piece;
//var _jump_piece = calculation._jump_piece;
//var _remove_piece = calculation._remove_piece;
//var randomise_indices = calculation.randomise_indices;
var Mills = calculation.Mills;
var AllNeighbours = calculation.AllNeighbours;
//var builds_mill = calculation.builds_mill;
//var almost_builds_mill = calculation.almost_builds_mill;

function jump_piece (colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces) {
    
    var MAX = 4;
    if ( (colour == "white" && black_pieces <= 3) || (colour == "black" && white_pieces <= 3) )
        MAX = 2;
    
    var result = calculation.jump_piece(-1, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, MAX)[1];
    
    if ( id_callback )
        id_callback(callback_id);
    if ( move_piece_callback )
        move_piece_callback(result[0], result[1]);
}
function remove_piece (colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces) {
    
    var MAX = 6;
    
    var result = calculation.remove_piece(-1, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, MAX)[1];
    
    if ( id_callback )
        id_callback(callback_id);
    if ( remove_piece_callback )
        remove_piece_callback(result);
}
function move_piece (colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces) {
    
    var MAX = 8;
    
    var own_board = (colour == "white") ? white_board : black_board;
    var enemy_board = (colour == "white") ? black_board : white_board;
    var joined_board = white_board | black_board;
    
    var i, almost_builds_mill_tester, fac;
    var probably_builds_mill = false;
    for ( i = 0; i < 24; i++ ) {
        if ( !(own_board & (1 << i)) )
            continue;
        almost_builds_mill_tester = calculation.almost_builds_mill(enemy_board, joined_board, i);
        if ( almost_builds_mill_tester[0] != 2 && almost_builds_mill_tester[1] != 2 )
            continue;
        probably_builds_mill = true;
        break;
    }
    if ( probably_builds_mill ) {
        MAX = 2;
        for ( i = 0; i < 24; i++ ) {
            if ( !(enemy_board & (1 << i)) )
                continue;
            almost_builds_mill_tester = calculation.almost_builds_mill(own_board, joined_board, i);
            if ( calculation.builds_mill(enemy_board, i) || (almost_builds_mill_tester[0] != 2 && almost_builds_mill_tester[1] != 2) )
                continue;
            if ( almost_builds_mill_tester[0] == 2 ) {
                fac = (Mills[i][0] & enemy_board) ^ Mills[i][0];
                if ( (AllNeighbours[fac] &  ~Mills[i][0]) & enemy_board ) {
                    MAX = 8;
                    break;
                }
            }
            if ( almost_builds_mill_tester[1] == 2 ) {
                fac = (Mills[i][1] & enemy_board) ^ Mills[i][1];
                if ( (AllNeighbours[fac] &  ~Mills[i][1]) & enemy_board ) {
                    MAX = 8;
                    break;
                }
            }
        }
    }
    
    var result = calculation.move_piece(-1, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, MAX)[1];
    
    if ( id_callback )
        id_callback(callback_id);
    
    if ( result == -1 )
        give_up_callback();
    else {
        if ( move_piece_callback )
            move_piece_callback(result[0], result[1]);
    }
}
function set_piece (colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, give_up) {
    
    var MAX = 6;
    
    var r = calculation.set_piece(-1, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, MAX);
    if ( !r ) {
        give_up_callback();
        return;
    }
    
    var result = r[1];
    
    if ( id_callback )
        id_callback(callback_id);
    if ( set_piece_callback )
        set_piece_callback(result);
}
function sendMessage (data) {
    
    callback_id = data.id;
    var colour = data.moving;
    
    var converted = convert(data.board);
    
    var fnc = (data.remove) ? remove_piece : null;
    if ( !fnc ) {
        if ( data.initial_pieces[colour_indices[colour]] )
            fnc = set_piece;
        else
            fnc = (converted.pieces[colour] == 3) ? jump_piece : move_piece;
    }
    
    fnc(colour, converted.white_board, converted.black_board, converted.pieces.white, converted.pieces.black, data.initial_pieces[0], data.initial_pieces[1]);
}

module.exports = {
    sendMessage: sendMessage,
    define_id_callback: define_id_callback,
    define_set_piece_callback: define_set_piece_callback,
    define_remove_piece_callback: define_remove_piece_callback,
    define_move_piece_callback: define_move_piece_callback,
    define_give_up_callback: define_give_up_callback
};
