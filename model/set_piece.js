function test_set_piece (own_board, opponent_board) {

    var joined_board = own_board | opponent_board;
    var new_board;

    for ( var i = 0; i < 24; i++ ) {
        if ( joined_board & (1 << i) )
            continue;
        new_board = own_board;
        new_board |= 1 << i;
        if ( builds_mill(new_board, i) )
            return true;
    }

    return false;
}
function _set_piece (given_solution, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, moves_left) {
    
    if ( moves_left <= 0 )
        return [analyse(white_board, black_board), given_solution];
    
    var best_result_value = (colour == "white") ? -13824 : 13824;
    
    var joined_board = white_board | black_board;
    
    var own_board = (colour == "white") ? white_board : black_board;
    var opponent_pieces = (colour == "white") ? black_pieces : white_pieces;
    var initial_opponent_pieces = (colour == "white") ? initial_black_pieces : initial_white_pieces;

    var fnc;
    if ( initial_opponent_pieces >= 1 )
        fnc = _set_piece;
    else
        fnc = (opponent_pieces <= 3) ? _jump_piece : _move_piece;
    
    var identifiers = [];
    
    var tmp_result, result;

    var i, solution, new_board, identifier;
    for ( var ii = 0; ii < 24; ii++ ) {
        i = indices[ii];
        if ( joined_board & (1 << i) )
            continue;
        new_board = own_board;
        new_board |= 1 << i;
        solution = given_solution || [-1, i];
        if ( builds_mill(new_board, i) ) {
            if ( colour == "white" )
                tmp_result = _remove_piece(solution, colour, new_board, black_board, (white_pieces + 1), black_pieces, (initial_white_pieces - 1), initial_black_pieces, moves_left);
            else
                tmp_result = _remove_piece(solution, colour, white_board, new_board, white_pieces, (black_pieces + 1), initial_white_pieces, (initial_black_pieces - 1), moves_left);
        }
        else {
            identifier = (colour == "white") ? analyse(new_board, black_board) : analyse(white_board, new_board);
            if ( identifiers.includes(identifier) )
                continue;
            identifiers.push(identifier);

            if ( colour == "white" )
                tmp_result = fnc(solution, "black", new_board, black_board, (white_pieces + 1), black_pieces, (initial_white_pieces - 1), initial_black_pieces, (moves_left - 1));
            else
                tmp_result = fnc(solution, "white", white_board, new_board, white_pieces, (black_pieces + 1), initial_white_pieces, (initial_black_pieces - 1), (moves_left - 1));

            //if ( !given_solution )
                //console.log( "\t SET: " + tmp_result[1][1] + " (" + tmp_result[0] + ")" );
        }

        if ( !tmp_result )
            continue;
        if ( colour == "white" && tmp_result[0] <= best_result_value )
            continue;
        if ( colour == "black" && tmp_result[0] >= best_result_value )
            continue;

        result = tmp_result;
        best_result_value = tmp_result[0];
    }

    return result;
}
