importScripts("../library/utilities.js");
importScripts("set_piece.js");
importScripts("move_piece.js");
importScripts("jump_piece.js");
importScripts("remove_piece.js");

var callback_id;
var execution_counter;
var analise_counter;

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
var Rings = [
    255,
    255 << 8,
    255 << 16
];
var EvenRings = [
    85,
    85 << 8,
    85 << 16
];

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

function analyse (white_board, black_board) {
    
    analise_counter++;
    
    var joined_board = white_board | black_board;
    var result = 0;
    
    var factor, i, j, building_mills, own_board, enemy_board, fac;
    
    for ( i = 0; i < 24; i++ ) {
        
        fac = 1 << i;
        
        if ( !(joined_board & fac) )
            continue;
        
        if ( white_board & fac ) {
            result += 576;
            factor = 1;
            own_board = white_board;
            enemy_board = black_board;
        }
        else {
            result -= 576;
            factor = -1;
            own_board = black_board;
            enemy_board = white_board;
        }
        
        if ( !(i & 1) )
            result += factor;
        if ( i > 7 && i < 16 )
            result += factor * 2;
        
        if ( builds_mill(own_board, i) )
            result += factor * 24;
        else {
            building_mills = almost_builds_mill(enemy_board, joined_board, i);
            if ( building_mills[0] )
                result += factor * 13 * building_mills[0];
            if ( building_mills[1] )
                result += factor * 13 * building_mills[1];
        }
        
        for ( j = 0; j < Library.neighbours[i].length; j++ ) {
            if ( !(joined_board & (1 << Library.neighbours[i][j])) )
                result += factor * 5;
        }
        /**
         * For any reasons slower...
         */
        /*if ( AllNeighbours[fac] && (AllNeighbours[fac] & joined_board) != AllNeighbours[fac] ) {
            for ( j = 0; j < Neighbours[fac].length; j++ ) {
                if ( !(joined_board & Neighbours[fac][j]) )
                    result += factor * 5;
            }
        }*/
    }
    
    return result;
}

/*  */

function jump_piece (colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces) {
    
    var MAX = 4;
    if ( (colour == "white" && black_pieces <= 3) || (colour == "black" && white_pieces <= 3) )
        MAX = 2;
    
    var result = _jump_piece(-1, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, MAX)[1];
    
    var msg = {
        task: "jump_piece",
        from: result[0],
        to: result[1],
        id: callback_id
    };
    
    postMessage(msg);
}
function remove_piece (colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces) {
    
    var MAX = 6;
    
    var result = _remove_piece(-1, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, MAX)[1];
    
    var msg = {
        task: "remove_piece",
        place: result,
        id: callback_id
    };
    
    postMessage(msg);
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
        almost_builds_mill_tester = almost_builds_mill(enemy_board, joined_board, i);
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
            almost_builds_mill_tester = almost_builds_mill(own_board, joined_board, i);
            if ( builds_mill(enemy_board, i) || (almost_builds_mill_tester[0] != 2 && almost_builds_mill_tester[1] != 2) )
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
    
    var result = _move_piece(-1, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, MAX)[1];
    
    if ( result == -1 ) {
        var msg = {
            task: "give_up",
            id: callback_id
        };
    }
    else {
        var msg = {
            task: "move_piece",
            from: result[0],
            to: result[1],
            id: callback_id
        };
    }
    
    
    postMessage(msg);
}
function set_piece (colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces) {
    
    var MAX = 6;
    
    /*var own_board, enemy_board;
    if ( colour == "white" ) {
        own_board = white_board;
        enemy_board = black_board;
    }
    else {
        own_board = black_board;
        enemy_board = white_board;
    }
    for ( var i = 0; i < 3; i++ ) {
        if ( (EvenRings[i] & enemy_board) && !(Rings[i] & own_board) ) {
            MAX++;
            break;
        }
    }
    console.log( MAX );*/
    
    var result = _set_piece(-1, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, MAX)[1];
    
    var msg = {
        task: "set_piece",
        place: result,
        id: callback_id
    };
    
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
            fnc = (converted.pieces[colour] == 3) ? jump_piece : move_piece;
    }
    
    console.log( event.data );
    
    execution_counter = 0;
    analise_counter = 0;
    var start_time = (new Date()).getTime();
    
    fnc(colour, converted.white_board, converted.black_board, converted.pieces.white, converted.pieces.black, event.data.initial_pieces[0], event.data.initial_pieces[1]);
    
    console.log( "Analised: " + analise_counter + " ; executed: " +  execution_counter);
    var end_time = (new Date()).getTime();
    console.log( "Execution duration: " + ((end_time - start_time) / 1000) );
    
    setTimeout(randomise_indices, 17);
};
