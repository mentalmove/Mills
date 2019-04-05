function test_jump_piece (own_board, opponent_board) {

    var joined_board = own_board | opponent_board;
    var new_board, i, j, jj;

    var builds_almost_mill;
    var mill_candidates = [];
    for ( i = 0; i < 24; i++ ) {
        if ( joined_board & (1 << i) )
            continue;
        builds_almost_mill = almost_builds_mill(opponent_board, joined_board, i);
        if ( builds_almost_mill[0] == 2 || builds_almost_mill[1] == 2 )
            mill_candidates.push(i);
    }

    if ( !mill_candidates.length )
        return false;

    for ( i = 0; i < 24; i++ ) {
        if ( !(own_board & (1 << i)) )
            continue;
        for ( jj = 0; jj < mill_candidates.length; jj++ ) {
            j = mill_candidates[jj];
            new_board = own_board;
            new_board ^= 1 << i;
            new_board |= 1 << j;
            if ( builds_mill(new_board, j) )
                return true;
        }
    }
    
    return false;
}
function _jump_piece (given_solution, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, moves_left) {

    if ( moves_left <= 0 )
        return [analyse(white_board, black_board), given_solution];

    var best_result_value = (colour == "white") ? -13824 : 13824;
    var best_case = (colour == "white") ? 13823 : -13823;
    var worst_case = (colour == "white") ? -13823 : 13823;
    
    var joined_board = white_board | black_board;
    
    var own_board = (colour == "white") ? white_board : black_board;
    var own_pieces = (colour == "white") ? white_pieces : black_pieces;
    var opponent_pieces = (colour == "white") ? black_pieces : white_pieces;

    var fnc = (opponent_pieces <= 3) ? _jump_piece : _move_piece;

    var identifiers = [];
    
    var tmp_result, result, fnc;
    var i, j, jj, solution, new_board, identifier;

    for ( var ii = 0; ii < 24; ii++ ) {
        i = indices[ii];
        if ( !(own_board & (1 << i)) )
            continue;
        for ( jj = 0; jj < 24; jj++ ) {
            j = indices[jj];
            if ( joined_board & (1 << j) )
                continue;
            solution = given_solution || [i, j];
            new_board = own_board;
            new_board ^= 1 << i;
            new_board |= 1 << j;

            if ( builds_mill(new_board, j) ) {
                if ( opponent_pieces <= 3 )
                    return [best_case, solution];
                if ( own_pieces <= 3 )
                    return [worst_case, solution];
                if ( colour == "white" )
                    tmp_result = _remove_piece(solution, colour, new_board, black_board, white_pieces, black_pieces, 0, 0, (moves_left - 1));
                else
                    tmp_result = _remove_piece(solution, colour, white_board, new_board, white_pieces, black_pieces, 0, 0, (moves_left - 1));
            }
            else {
                identifier = (colour == "white") ? analyse(new_board, black_board) : analyse(white_board, new_board);
                if ( identifiers.includes(identifier) )
                    continue;
                identifiers.push(identifier);

                if ( colour == "white" )
                    tmp_result = fnc(solution, "black", new_board, black_board, white_pieces, black_pieces, 0, 0, (moves_left - 1));
                else
                    tmp_result = fnc(solution, "white", white_board, new_board, white_pieces, black_pieces, 0, 0, (moves_left - 1));
            }

            //if ( !given_solution )
                //console.log( "\t JUMP: " + tmp_result[1][0] + " --> " + tmp_result[1][1] + " (" + tmp_result[0] + ")" );

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

    return result;
}
