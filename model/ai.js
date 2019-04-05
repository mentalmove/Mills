importScripts("../library/utilities.js");
importScripts("set_piece.js");
importScripts("move_piece.js");
importScripts("jump_piece.js");
importScripts("remove_piece.js");

var callback_id;

var colour_indices = {
    white: 0,
    black: 1
};

var i, j, k;
var buffer = new ArrayBuffer(24);
var indices = new Uint8Array(buffer);
for ( i = 0; i < 24; i++ )
    indices[i] = i;
function randomise_indices () {
    var random_index, tmp;
    for ( var i = 0; i < 24; i++ ) {
        random_index = Math.floor(Math.random() * 24);
        if ( i == random_index )
            continue;
        tmp = indices[i];
        indices[i] = indices[random_index];
        indices[random_index] = tmp;
    }
}
randomise_indices();
function push_position_to_front (position, index) {
    index = index || 0;
    var tmp, i;
    for ( i = (index + 1); i < 24; i++ ) {
        if ( indices[i] == position ) {
            indices[i] = indices[index];
            indices[index] = position;
            break;
        }
    }
}

var Mills = Array(24);
var AlmostMills = Array(24);
var tmp, tmp1, tmp2, tmp3, ni, n, na;
for ( i = 0; i < 24; i++ ) {
    Mills[i] = Array(2);
    AlmostMills[i] = Array(6);
    for ( j = 0; j < 2; j++ ) {
        tmp = 0;
        tmp1 = 0;
        tmp2 = 0;
        tmp3 = 0;
        for ( k = 0; k < 3; k++ ) {
            tmp |= 1 << Library.mills[i][j][k];
            if ( k )
                tmp1 |= 1 << Library.mills[i][j][k];
            if ( k != 1 )
                tmp2 |= 1 << Library.mills[i][j][k];
            if ( k != 2 )
                tmp3 |= 1 << Library.mills[i][j][k];
        }
        Mills[i][j] = tmp;
        AlmostMills[i][j * 3] = tmp1;
        AlmostMills[i][j * 3 + 1] = tmp2;
        AlmostMills[i][j * 3 + 2] = tmp3;
    }
}
var Neighbours = {};
var AllNeighbours = {};
for ( i = 0; i < 24; i++ ) {
    ni = 1 << i;
    n = Array(Library.neighbours[i].length);
    na = 0;
    for ( j = 0; j < Library.neighbours[i].length; j++ ) {
        n[j] = 1 << Library.neighbours[i][j];
        na |= n[j];
    }
    Neighbours[ni] = n;
    AllNeighbours[ni] = na;
}

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

/*  */

function builds_mill (board, index) {
    var mill;
    for ( var i = 0; i < Mills[index].length; i++ ) {
        mill = Mills[index][i];
        if ( (mill & board) == mill )
            return true;
    }
    return false;
}
function almost_builds_mill (enemy_board, joined_board, index) {
    var mills = Mills[index];
    var almost_mills = AlmostMills[index];
    var result = [0, 0];
    var i;
    if ( !(mills[0] & enemy_board) && (mills[0] & joined_board) ) {
        result[0] = 1;
        for ( i = 0; i < 3; i++ ) {
            if ( (almost_mills[i] & joined_board) == almost_mills[i] ) {
                result[0] = 2;
                break;
            }
        }
    }
    if ( !(mills[1] & enemy_board) && (mills[1] & joined_board) ) {
        result[1] = 1;
        for ( i = 3; i < 6; i++ ) {
            if ( (almost_mills[i] & joined_board) == almost_mills[i] ) {
                result[1] = 2;
                break;
            }
        }
    }
    return result;
}

var agressive_analyse = null;
function analyse_agressively (white_board, black_board) {

    var reversed_board = ~(white_board | black_board);
    var own_board = (agressive_analyse == "white") ? white_board : black_board;
    var opponent_board = (agressive_analyse == "black") ? white_board : black_board;
    var factor = (agressive_analyse == "black") ? -1 : 1;

    var i, fac, new_neighbours;

    var result = 0;

    var neighbour_board = 0;
    for ( i = 0; i < 24; i++ ) {
        fac = 1 << i;
        if ( own_board & fac ) {
            result += 576 * factor;
            continue;
        }
        if ( !(opponent_board & fac) )
            continue;
        neighbour_board |= AllNeighbours[fac] & reversed_board;
    }

    var remembered = 0;
    while ( neighbour_board != remembered ) {
        new_neighbours = 0;
        remembered = neighbour_board;
        for ( i = 0; i < 24; i++ ) {
            fac = 1 << i;
            if ( !(neighbour_board & fac) )
                continue;
            new_neighbours |= AllNeighbours[fac] & reversed_board;
        }
        neighbour_board |= new_neighbours;
    }

    for ( i = 0; i < 24; i++ ) {
        fac = 1 << i;
        if ( !(neighbour_board & fac) )
            continue;
        result -= factor;
    }

    return result;
}
function analyse_respecting_neighbours (white_board, black_board) {

    if ( agressive_analyse )
        return analyse_agressively(white_board, black_board);

    var joined_board = white_board | black_board;
    var result = 0;
    
    var factor, i, j, building_mills, fac;
    
    for ( i = 0; i < 24; i++ ) {
        
        fac = 1 << i;
        
        if ( !(joined_board & fac) )
            continue;
        
        if ( white_board & fac ) {
            result += 576;
            factor = 1;
        }
        else {
            result -= 576;
            factor = -1;
        }

        for ( j = 0; j < Library.neighbours[i].length; j++ ) {
            if ( !(joined_board & (1 << Library.neighbours[i][j])) )
                result += factor * 12;
        }
    }

    return result;
}
function analyse (white_board, black_board) {
    
    var joined_board = white_board | black_board;
    var result = 0;
    
    var factor, i, j, building_mills, own_board, opponent_board, fac;
    
    for ( i = 0; i < 24; i++ ) {
        
        fac = 1 << i;
        
        if ( !(joined_board & fac) )
            continue;
        
        if ( white_board & fac ) {
            result += 576;
            factor = 1;
            own_board = white_board;
            opponent_board = black_board;
        }
        else {
            result -= 576;
            factor = -1;
            own_board = black_board;
            opponent_board = white_board;
        }
        
        if ( !(i & 1) )
            result += factor;
        if ( i > 7 && i < 16 )
            result += factor * 2;
        
        if ( builds_mill(own_board, i) )
            result += factor * 24;
        else {
            building_mills = almost_builds_mill(opponent_board, joined_board, i);
            if ( building_mills[0] )
                result += factor * 13 * building_mills[0];
            if ( building_mills[1] )
                result += factor * 13 * building_mills[1];
        }
        
        for ( j = 0; j < Library.neighbours[i].length; j++ ) {
            if ( !(joined_board & (1 << Library.neighbours[i][j])) )
                result += factor * 5;
        }
    }
    
    return result;
}

/*  */

function jump_piece (colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces) {
    
    var MAX = 4;

    var tmp_result = _jump_piece(null, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, 2);
    if ( tmp_result && tmp_result.length > 1 && tmp_result[1] && tmp_result[1].length > 1 && Math.abs(tmp_result[0]) < 13247 ) {
        push_position_to_front(tmp_result[1][0]);
        push_position_to_front(tmp_result[1][1], 1);
    }


    var result = _jump_piece(null, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, MAX);

    if ( result )
        console.log( "JUMP quality: " + result[0] );
    if ( result && result.length > 1 && result[1] && result[1].length > 1 )
        console.log( "To jump: " + result[1][0] + " --> " + result[1][1] );

    if ( !result || result.length < 2 || !result[1] || result[1].length < 2 ) {
        console.log( "Machine gives up in jump_piece" );
        var msg = {
            task: "give_up",
            id: callback_id
        };
    }
    else {
        var msg = {
            task: "jump_piece",
            from: result[1][0],
            to: result[1][1],
            id: callback_id
        };
    }

    postMessage(msg);
}
function remove_piece (colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces) {
    
    var MAX = 4;

    var result = _remove_piece(null, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, MAX);

    if ( result )
        console.log( "REMOVE quality: " + result[0] );
    if ( result && result.length > 1 && result[1] && result[1].length > 1 )
        console.log( "Place to remove: " + result[1][1] );

    if ( !result || result.length < 2 || !result[1] || result[1].length < 2 ) {
        console.log( "Machine gives up in remove_piece" );
        var msg = {
            task: "give_up",
            id: callback_id
        };
    }
    else {
        var msg = {
            task: "remove_piece",
            place: result[1][1],
            id: callback_id
        };
    }

    postMessage(msg);
}
function move_piece (colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces) {

    var MAX = 6;

    var result;
    var tmp_result = _move_piece(null, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, 2);
    if ( tmp_result && tmp_result.length > 1 && tmp_result[1] && tmp_result[1].length > 1 && Math.abs(tmp_result[0]) > 13247 )
        result = tmp_result;
    else {
        if ( agressive_analyse ) {
            tmp_result = _move_piece(null, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, 1);
            if ( tmp_result && tmp_result.length > 1 && tmp_result[1] && tmp_result[1].length > 1 )
                push_position_to_front(tmp_result[1][0]);
        }
        result = _move_piece(null, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, MAX);
    }

    if ( result )
        console.log( "MOVE quality: " + result[0] );
    if ( result && result.length > 1 && result[1] && result[1].length > 1 )
        console.log( "To move: " + result[1][0] + " --> " + result[1][1] );

    if ( !result || result.length < 2 || !result[1] || result[1].length < 2 ) {
        console.log( "Machine gives up in move_piece" );
        var msg = {
            task: "give_up",
            id: callback_id
        };
    }
    else {
        var msg = {
            task: "move_piece",
            from: result[1][0],
            to: result[1][1],
            id: callback_id
        };
    }

    postMessage(msg);
}

function set_piece (colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces) {
    
    var MAX = 4;

    var result = _set_piece(null, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, MAX);

    if ( result )
        console.log( "SET quality: " + result[0] );
    if ( result && result.length > 1 && result[1] && result[1].length > 1 )
        console.log( "Place to set: " + result[1][1] );

    if ( !result || result.length < 2 || !result[1] || result[1].length < 2 ) {
        console.log( "Machine gives up in set_piece" );
        var msg = {
            task: "give_up",
            id: callback_id
        };
    }
    else {
        var msg = {
            task: "set_piece",
            place: result[1][1],
            id: callback_id
        };
    }

    postMessage(msg);
}

onmessage = function (event) {
    
    callback_id = event.data.id;
    var colour = event.data.moving;
    
    var converted = convert(event.data.board);
    
    var fnc = (event.data.remove) ? remove_piece : null;
    if ( !fnc ) {
        if ( event.data.initial_pieces[colour_indices[colour]] )
            fnc = set_piece;
        else
            fnc = (converted.pieces[colour] <= 3) ? jump_piece : move_piece;
    }

    var other_colour = (colour == "black") ? "white" : "black";
    if ( fnc == move_piece && converted.pieces[colour] > converted.pieces[other_colour] )
        agressive_analyse = colour;
    
    execution_counter = 0;
    analise_counter = 0;
    var start_time = (new Date()).getTime();
    
    fnc(colour, converted.white_board, converted.black_board, converted.pieces.white, converted.pieces.black, event.data.initial_pieces[0], event.data.initial_pieces[1]);
    
    var end_time = (new Date()).getTime();
    console.log( "Execution duration: " + ((end_time - start_time) / 1000) );
    
    setTimeout(randomise_indices, 17);
    agressive_analyse = null;
};
