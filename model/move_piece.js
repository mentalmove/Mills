function test_move_piece (own_board, opponent_board) {

    var joined_board = own_board | opponent_board;
    var new_board, neighbours, j;

    for ( var i = 0; i < 24; i++ ) {
        if ( !(own_board & (1 << i)) )
            continue;
        neighbours = Library.neighbours[i];
        for ( j = 0; j < neighbours.length; j++ ) {
            if ( joined_board & (1 << neighbours[j]) )
                continue;
            new_board = own_board;
            new_board ^= 1 << i;
            new_board |= 1 << neighbours[j];
            if ( builds_mill(new_board, neighbours[j]) )
                return true;
        }
    }
    
    return false;
}
function _move_piece (given_solution, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, moves_left) {

    var opponent_pieces = (colour == "white") ? black_pieces : white_pieces;

    if ( moves_left <= 0 ) {
        if ( opponent_pieces > 3 )
            return [analyse_respecting_neighbours(white_board, black_board), given_solution];
        return [analyse(white_board, black_board), given_solution];
    }

    var best_result_value = (colour == "white") ? -13824 : 13824;
    var best_case = (colour == "white") ? 13823 : -13823;
    
    var joined_board = white_board | black_board;
    
    var own_board = (colour == "white") ? white_board : black_board;

    var fnc = (opponent_pieces <= 3) ? _jump_piece : _move_piece;

    var tmp_result, result;

    var neighbours;

    var i, j, solution, new_board;
    for ( var ii = 0; ii < 24; ii++ ) {
        i = indices[ii];
        if ( !(own_board & (1 << i)) )
            continue;

        if ( Math.round(Math.random()) )
            neighbours = (Library.neighbours[i].slice()).reverse();
        else
            neighbours = Library.neighbours[i];

        for ( j = 0; j < neighbours.length; j++ ) {
            if ( joined_board & (1 << neighbours[j]) )
                continue;
            solution = given_solution || [i, neighbours[j]];
            new_board = own_board;
            new_board ^= 1 << i;
            new_board |= 1 << neighbours[j];

            if ( builds_mill(new_board, neighbours[j]) ) {
                if ( opponent_pieces <= 3 )
                    return [best_case, solution];
                if ( colour == "white" )
                    tmp_result = _remove_piece(solution, colour, new_board, black_board, white_pieces, black_pieces, 0, 0, moves_left);
                else
                    tmp_result = _remove_piece(solution, colour, white_board, new_board, white_pieces, black_pieces, 0, 0, moves_left);
            }
            else {
                if ( colour == "white" )
                    tmp_result = fnc(solution, "black", new_board, black_board, white_pieces, black_pieces, 0, 0, (moves_left - 1));
                else
                    tmp_result = fnc(solution, "white", white_board, new_board, white_pieces, black_pieces, 0, 0, (moves_left - 1));
            }

            //if ( !given_solution )
                //console.log( "\t MOVE: " + tmp_result[1][0] + " --> " + tmp_result[1][1] + " (" + tmp_result[0] + ")" );

            if ( !tmp_result )
                continue;
            if ( colour == "white" && tmp_result[0] <= best_result_value )
                continue;
            if ( colour == "black" && tmp_result[0] >= best_result_value )
                continue;

            result = tmp_result;
            best_result_value = tmp_result[0];
        }
    }

    if ( !result && given_solution )
        return [(-1 * best_case), given_solution];

    return result;
}
