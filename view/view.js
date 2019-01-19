var readline = require("readline");

var hor = ["A", "B", "C", "D", "E", "F", "G"];
function Piece (colour) {
    var myself = this;
    this.colour = colour;
}
function Place (show_position, index) {
    this.index = index;
    var myself = this;
    var piece;
    Object.defineProperty(myself, "has_piece", {
        get: function () {
            return piece && piece.colour;
        }
    });
    this.set_piece = function (p, retarded) {
        if ( piece )
            return;
        piece = p;
    };
    this.remove_piece = function () {
        piece = null;
    };
    this.show_position = show_position;
    this.show_index = hor[show_position[0]] + (show_position[1] + 1);
}

function generate_pieces (colour) {
    var pieces = [];
    for ( var i = 0; i < 9; i++ )
        pieces[i] = new Piece(colour);
    return pieces;
}
function generate_places () {
    
    var places = [];
    var show_position, v, h, r;
    
    var s = [1, 1, 1, 4, 7, 7, 7, 4];
    
    for ( var i = 0; i < 24; i++ ) {
        
        r = parseInt(i / 8);
        v = s[i % 8];
        h = s[(i + 2) % 8];
        if ( r ) {
            if ( v != 4 )
                v = (v < 4) ? (v + r) : (v - r);
            if ( h != 4 )
                h = (h < 4) ? (h + r) : (h - r);
        }
        
        show_position = [h - 1, v - 1];
        
        places[i] = new Place(show_position, i);
    }
    
    return places;
}

/*  */

var human_colour, machine_colour;

function set_colour (h, m) {
    human_colour = h;
    machine_colour = m;
}
function ask_colour (cb) {
    console.log( "" );
    console.log( "Which colour would you prefer (w/b)?" );
    var rl = readline.createInterface({
        input: process.stdin,
    });
    var pattern = /\s?[wWbB]/;
    rl.on("line", function (answer) {
        if ( !answer.match(pattern) ) {
            console.log( "Unexpected!" );
            console.log( "Which colour would you prefer (w/b)?" );
        }
        else {
            if ( answer.match(/w/i) )
                console.log( "WHITE  -  o" );
            else
                console.log( "BLACK  -  x" );
            console.log( "" );
            rl.close();
            cb(answer);
        }
    });
}

/*  */

function show_board (places) {
    
    console.log( "" );
    console.log( "" );
    console.log( "" );
    console.log( "" );
    
    // Global???
    var symbols = {
        white: "o",
        black: "x",
        '?': " "
    };
    
    var i, ii;
    var board = Array(13);
    for ( i = 0; i < 13; i++ ) {
        board[i] = Array(13);
        for ( ii = 0; ii < 13; ii++ )
            board[i][ii] = "   ";
    }
    for ( i = 0; i < 13; i++ ) {
        for ( ii = 0; ii < 13; ii++ ) {
            if ( !(i % 2) && ((ii > i && ii < (13 - i)) || (ii >= (13 - i) && ii <= i) || (i == 6 && (ii < 5 || ii > 7))) ) {
                board[i][ii] = "  -";
                board[ii][i] = "  |";
            }
        }
    }
    
    for ( var i = 0; i < places.length; i++ ) {
        has_piece = places[i].has_piece;
        ii = places[i].show_position;
        if ( !has_piece )
            board[ ii[1] * 2 ][ ii[0] * 2 ] = "  ⋅";    // ⋅
        else
            board[ ii[1] * 2 ][ ii[0] * 2 ] = "  " + symbols[has_piece];
    }
    
    console.log( "       (A)   (B)   (C)   (D)   (E)   (F)   (G)" );
    console.log( "" );
    
    var row_counter = 1;
    var start;
    for ( i = 0; i < 13; i++ ) {
        if ( !(i % 2) )
            start = " (" + row_counter++ + ")  ";
        else
            start = "      ";
        console.log( start + board[i].join("") );
    }
    
    console.log( "" );
    console.log( "" );
}

function enable_set (places, targets, cb) {
    
    show_board(places);
    
    var question = "Set a " + human_colour + " piece, e.g. to " + targets[0].show_index;
    console.log( question );
    
    var rl = readline.createInterface({
        input: process.stdin,
    });
    var pattern = /[A-Ga-g]\W*[1-7]/i;
    var index = -1;
    var wrong_answer = "Unexpected!";
    var i;
    rl.on("line", function (answer) {
        if ( answer.match(pattern) ) {
            answer = answer.replace(/\W/g, "").toUpperCase();
            for ( i = 0; i < targets.length; i++ ) {
                if ( targets[i].show_index == answer ) {
                    index = targets[i].index;
                    break;
                }
            }
            if ( index < 0 ) {
                for ( var i = 0; i < places.length; i++ ) {
                    if ( places[i].show_index == answer ) {
                        wrong_answer = answer + " is already occupied";
                        break;
                    }
                }
            }
        }
        if ( index < 0 ) {
            console.log( "" );
            console.log( wrong_answer );
            wrong_answer = "Unexpected!";
            console.log( question );
        }
        else {
            rl.close();
            cb(index, human_colour);
        }
    });
}
function enable_remove (places, targets, cb) {
    
    show_board(places);
    
    var question = "Remove a " + machine_colour + " piece, e.g. " + targets[0].show_index;
    console.log( question );
    
    var rl = readline.createInterface({
        input: process.stdin,
    });
    var pattern = /[A-Ga-g]\W*[1-7]/i;
    var index = -1;
    var wrong_answer = "Unexpected!";
    var i;
    rl.on("line", function (answer) {
        if ( answer.match(pattern) ) {
            answer = answer.replace(/\W/g, "").toUpperCase();
            for ( i = 0; i < targets.length; i++ ) {
                if ( targets[i].show_index == answer ) {
                    index = targets[i].index;
                    break;
                }
            }
            if ( index < 0 ) {
                for ( var i = 0; i < places.length; i++ ) {
                    if ( places[i].show_index == answer ) {
                        if ( places[i].has_piece == human_colour )
                            wrong_answer = answer + " is " + human_colour + "!";
                        else
                            wrong_answer = answer + " is empty!";
                        break;
                    }
                }
            }
        }
        if ( index < 0 ) {
            console.log( "" );
            console.log( wrong_answer );
            wrong_answer = "Unexpected!";
            console.log( question );
        }
        else {
            rl.close();
            cb(index, machine_colour);
        }
    });
}
function enable_move (places, slides, cb) {
    
    show_board(places);
    
    var question = "Move a piece, e.g. " + slides[0][0].show_index + " - " + slides[0][1][0].show_index
    console.log( question );
    
    var rl = readline.createInterface({
        input: process.stdin,
    });
    var pattern = /([A-Ga-g])\W*([1-7])\W*([A-Ga-g])\W*([1-7])/i;
    var from_index = -1;
    var to_index = -1;
    var wrong_answer = "Unexpected!";
    var match;
    var f, t, i, j;
    rl.on("line", function (answer) {
        match = answer.match(pattern);
        if ( match ) {
            f = (match[1] + match[2]).toUpperCase();
            t = (match[3] + match[4]).toUpperCase();
            for ( i = 0; i < slides.length; i++ ) {
                if ( slides[i][0].show_index == f ) {
                    wrong_answer = "Invalid target";
                    from_index = slides[i][0].index;
                    for ( j = 0; j < slides[i][1].length; j++ ) {
                        if ( slides[i][1][j].show_index == t ) {
                            to_index = slides[i][1][j].index;
                            break;
                        }
                    }
                }
            }
        }
        if ( from_index < 0 || to_index < 0 ) {
            console.log( "" );
            console.log( wrong_answer );
            wrong_answer = "Unexpected!";
            console.log( question );
        }
        else {
            rl.close();
            cb(from_index, to_index, human_colour);
        }
    });
}

function game_over (places, winner) {
    
    show_board(places);
    
    console.log( winner.toUpperCase() + " WINS" );
    
    for ( var i = 0; i < places.length; i++ ) {
        if ( !places[i].has_piece )
            places[i].set_piece(new Piece("?"));
    }
    
    show_board(places);
}

/*  */

module.exports = {
    generate_pieces: generate_pieces,
    generate_places: generate_places,
    set_colour: set_colour,
    ask_colour: ask_colour,
    show_board: show_board,
    enable_set: enable_set,
    enable_remove: enable_remove,
    enable_move: enable_move,
    game_over: game_over,
    Piece: Piece
};
