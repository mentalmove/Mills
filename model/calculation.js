var Library = require("../library/utilities.js");

function set_piece (given_solution, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, moves_left) {
    
    if ( moves_left <= 0 )
        return [analyse(white_board, black_board), given_solution];
    
    var best_result_value = (colour == "white") ? -13824 : 13824;
    
    var joined_board = white_board | black_board;
    
    var board_to_copy = (colour == "white") ? white_board : black_board;
    var next_colour = (colour == "white") ? "black" : "white";
    
    var identifiers = [];
    
    var tmp_result, result, fnc;
    
    var i, solution, new_board, identifier;
    for ( var ii = 0; ii < 24; ii++ ) {
        i = indices[ii];
        if ( joined_board & (1 << i) )
            continue;
        new_board = board_to_copy;
        new_board |= 1 << i;
        solution = (given_solution < 0) ? i : given_solution;
        if ( builds_mill(new_board, i) ) {
            if ( colour == "white" )
                tmp_result = remove_piece(solution, colour, new_board, black_board, (white_pieces + 1), black_pieces, (initial_white_pieces - 1), initial_black_pieces, (moves_left - 1));
            else
                tmp_result = remove_piece(solution, colour, white_board, new_board, white_pieces, (black_pieces + 1), initial_white_pieces, (initial_black_pieces - 1), (moves_left - 1));
        }
        else {
            if ( colour == "white" )
                identifier = analyse(new_board, black_board);
            else
                identifier = analyse(white_board, new_board);
            if ( identifiers.includes(identifier) )
                continue;
            identifiers.push(identifier);
            
            if ( colour == "white" ) {
                if ( initial_black_pieces > 1 )
                    fnc = set_piece;
                else
                    fnc = (black_pieces == 3) ? jump_piece : move_piece;
                tmp_result = fnc(solution, next_colour, new_board, black_board, (white_pieces + 1), black_pieces, (initial_white_pieces - 1), initial_black_pieces, (moves_left - 1));
            }
            else {
                if ( initial_white_pieces > 1 )
                    fnc = set_piece;
                else
                    fnc = (white_pieces == 3) ? jump_piece : move_piece;
                tmp_result = fnc(solution, next_colour, white_board, new_board, white_pieces, (black_pieces + 1), initial_white_pieces, (initial_black_pieces - 1), (moves_left - 1));
            }
        }
        
        if ( !tmp_result )
            continue;
        
        if ( colour == "white" ) {
            if ( tmp_result[0] > best_result_value ) {
                result = tmp_result;
                best_result_value = tmp_result[0];
            }
        }
        else {
            if ( tmp_result[0] < best_result_value ) {
                result = tmp_result;
                best_result_value = tmp_result[0];
            }
        }
    }
    
    return result;
}
function move_piece (given_solution, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, moves_left) {
    
    if ( moves_left <= 0 )
        return [analyse(white_board, black_board), given_solution];
    
    var best_result_value = (colour == "white") ? -13824 : 13824;
    
    var joined_board = white_board | black_board;
    
    var board_to_change = (colour == "white") ? white_board : black_board;
    var next_colour = (colour == "white") ? "black" : "white";
    
    var identifiers = [];
    
    var tmp_result, result, fnc;
    var i, j, solution, new_board, identifier;
    
    var neighbours;

    for ( var ii = 0; ii < 24; ii++ ) {
        i = indices[ii];
        if ( !(board_to_change & (1 << i)) )
            continue;
        
        if ( Math.round(Math.random()) )
            neighbours = (Library.neighbours[i].slice()).reverse();
        else
            neighbours = Library.neighbours[i];
        
        for ( j = 0; j < neighbours.length; j++ ) {
            if ( joined_board & (1 << neighbours[j]) )
                continue;
            new_board = board_to_change;
            new_board ^= 1 << i;
            new_board |= 1 << neighbours[j];
            if ( given_solution == -1 )
                solution = [i, neighbours[j]];
            else
                solution = given_solution;
            if ( builds_mill(new_board, neighbours[j]) ) {
                if ( colour == "white" )
                    tmp_result = remove_piece(solution, colour, new_board, black_board, white_pieces, black_pieces, 0, 0, 0);
                else
                    tmp_result = remove_piece(solution, colour, white_board, new_board, white_pieces, black_pieces, 0, 0, 0);
            }
            else {
                if ( colour == "white" )
                    identifier = analyse(new_board, black_board);
                else
                    identifier = analyse(white_board, new_board);
                if ( identifiers.includes(identifier) )
                    continue;
                identifiers.push(identifier);
                
                if ( colour == "white" ) {
                    fnc = (black_pieces == 3) ? jump_piece : move_piece;
                    tmp_result = fnc(solution, next_colour, new_board, black_board, white_pieces, black_pieces, 0, 0, (moves_left - 1));
                }
                else {
                    fnc = (white_pieces == 3) ? jump_piece : move_piece;
                    tmp_result = fnc(solution, next_colour, white_board, new_board, white_pieces, black_pieces, 0, 0, (moves_left - 1));
                }
            }
            
            if ( !tmp_result )
                continue;
            
            if ( colour == "white" ) {
                if ( tmp_result[0] > best_result_value ) {
                    result = tmp_result;
                    best_result_value = tmp_result[0];
                }
            }
            else {
                if ( tmp_result[0] < best_result_value ) {
                    result = tmp_result;
                    best_result_value = tmp_result[0];
                }
            }
        }
    }
    
    if ( !result )
        return [best_result_value, given_solution];
    
    return result;
}
function jump_piece (given_solution, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, moves_left) {
    
    if ( moves_left <= 0 )
        return [analyse(white_board, black_board), given_solution];
    
    var best_result_value = (colour == "white") ? -13824 : 13824;
    
    var joined_board = white_board | black_board;
    
    var board_to_change = (colour == "white") ? white_board : black_board;
    var next_colour = (colour == "white") ? "black" : "white";
    
    var identifiers = [];
    
    var tmp_result, result, fnc;
    var i, j, jj, solution, new_board, identifier;
    
    for ( var ii = 0; ii < 24; ii++ ) {
        i = indices[ii];
        if ( !(board_to_change & (1 << i)) )
            continue;
        for ( jj = 0; jj < 24; jj++ ) {
            j = indices[jj];
            if ( joined_board & (1 << j) )
                continue;
            new_board = board_to_change;
            new_board ^= 1 << i;
            new_board |= 1 << j;
            if ( given_solution == -1 )
                solution = [i, j];
            else
                solution = given_solution;
            
            if ( builds_mill(new_board, j) ) {
                if ( colour == "white" ) {
                    if ( black_pieces <= 3 )
                        return [13824, solution];
                    tmp_result = remove_piece(solution, colour, new_board, black_board, white_pieces, black_pieces, 0, 0, (moves_left - 1));
                }
                else {
                    if ( white_pieces <= 3 )
                        return [-13824, solution];
                    tmp_result = remove_piece(solution, colour, white_board, new_board, white_pieces, black_pieces, 0, 0, (moves_left - 1));
                }
            }
            else {
                if ( colour == "white" )
                    identifier = analyse(new_board, black_board);
                else
                    identifier = analyse(white_board, new_board);
                if ( identifiers.includes(identifier) )
                    continue;
                identifiers.push(identifier);
                
                if ( colour == "white" ) {
                    fnc = (black_pieces == 3) ? jump_piece : move_piece;
                    tmp_result = fnc(solution, next_colour, new_board, black_board, white_pieces, black_pieces, 0, 0, (moves_left - 1));
                }
                else {
                    fnc = (white_pieces == 3) ? jump_piece : move_piece;
                    tmp_result = fnc(solution, next_colour, white_board, new_board, white_pieces, black_pieces, 0, 0, (moves_left - 1));
                }
            }
            
            if ( !tmp_result )
                continue;
            
            if ( colour == "white" ) {
                if ( tmp_result[0] > best_result_value ) {
                    result = tmp_result;
                    best_result_value = tmp_result[0];
                }
            }
            else {
                if ( tmp_result[0] < best_result_value ) {
                    result = tmp_result;
                    best_result_value = tmp_result[0];
                }
            }
        }
    }
    
    return result;
}
function remove_piece (given_solution, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, moves_left) {
    
    var best_result_value = (colour == "white") ? -13824 : 13824;
    
    var joined_board;
    
    var board_to_erase_from = (colour == "white") ? black_board : white_board;
    var own_board = (colour == "white") ? white_board : black_board;
    var next_colour = (colour == "white") ? "black" : "white";
    
    var tmp_result, result, fnc;
    
    var i, j, solution, new_board, fac;
    var is_in_mill = [];
    var not_in_mill = [];
    for ( var ii = 0; ii < 24; ii++ ) {
        i = indices[ii];
        if ( !(board_to_erase_from & (1 << i)) )
            continue;
        if ( builds_mill(board_to_erase_from, i) )
            is_in_mill.push(i);
        else
            not_in_mill.push(i);
    }
    var mill_remove = (not_in_mill.length) ? not_in_mill : is_in_mill;
    
    var identifiers = [];
    var identifier;
    var ml, building_mills;
    
    if ( mill_remove.length == 1 )
        moves_left = 0;
    
    for ( i = 0; i < mill_remove.length; i++ ) {
        new_board = board_to_erase_from;
        new_board ^= 1 << mill_remove[i];
        solution = (given_solution < 0) ? mill_remove[i] : given_solution;
        
        if ( colour == "white" )
            identifier = analyse(white_board, new_board);
        else
            identifier = analyse(new_board, black_board);
        if ( identifiers.includes(identifier) )
            continue;
        identifiers.push(identifier);
        
        ml = moves_left || 1;
        if ( (next_colour == "white" && white_pieces <= 3) || (next_colour == "black" && black_pieces <= 3) )
            ml = 0;
        else {
            /**
             * This time for any reasons faster
             */
            joined_board = own_board | new_board;
            for ( j = 0; j < mill_remove.length; j++ ) {
                if ( mill_remove[i] == mill_remove[j] )
                    continue;
                building_mills = almost_builds_mill(own_board, joined_board, mill_remove[j]);
                if ( building_mills[0] == 2 ) {
                    fac = (Mills[mill_remove[j]][0] & new_board) ^ Mills[mill_remove[j]][0];
                    if ( AllNeighbours[fac] && (AllNeighbours[fac] & ~Mills[mill_remove[j]][0]) & new_board )
                        break;
                }
                if ( building_mills[1] == 2 ) {
                    fac = (Mills[mill_remove[j]][1] & new_board) ^ Mills[mill_remove[j]][1];
                    if ( AllNeighbours[fac] && (AllNeighbours[fac] & ~Mills[mill_remove[j]][1]) & new_board )
                        break;
                }
                ml = 0;
            }
        }
        
        if ( colour == "white" ) {
            if ( initial_black_pieces > 1 )
                fnc = set_piece;
            else
                fnc = (black_pieces == 4) ? jump_piece : move_piece;
            tmp_result = fnc(solution, next_colour, white_board, new_board, white_pieces, (black_pieces - 1), initial_white_pieces, initial_black_pieces, ml);
        }
        else {
            if ( initial_white_pieces > 1 )
                fnc = set_piece;
            else
                fnc = (white_pieces == 4) ? jump_piece : move_piece;
            tmp_result = fnc(solution, next_colour, new_board, black_board, (white_pieces - 1), black_pieces, initial_white_pieces, initial_black_pieces, ml);
        }
        
        if ( !tmp_result )
            continue;
        
        if ( colour == "white" ) {
            if ( tmp_result[0] > best_result_value ) {
                result = tmp_result;
                best_result_value = tmp_result[0];
            }
        }
        else {
            if ( tmp_result[0] < best_result_value ) {
                result = tmp_result;
                best_result_value = tmp_result[0];
            }
        }
    }
    
    return result;
}

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
    }
    
    return result;
}

module.exports = {
    set_piece: set_piece,
    move_piece: move_piece,
    jump_piece: jump_piece,
    remove_piece: remove_piece,
    randomise_indices: randomise_indices,
    Mills: Mills,
    AllNeighbours: AllNeighbours,
    builds_mill: builds_mill,
    almost_builds_mill: almost_builds_mill
};
