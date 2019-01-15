function _set_piece (given_solution, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, moves_left) {
    
    execution_counter++;
    
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
                tmp_result = _remove_piece(solution, colour, new_board, black_board, (white_pieces + 1), black_pieces, (initial_white_pieces - 1), initial_black_pieces, (moves_left - 1));
            else
                tmp_result = _remove_piece(solution, colour, white_board, new_board, white_pieces, (black_pieces + 1), initial_white_pieces, (initial_black_pieces - 1), (moves_left - 1));
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
                    fnc = _set_piece;
                else
                    fnc = (black_pieces == 3) ? _jump_piece : _move_piece;
                tmp_result = fnc(solution, next_colour, new_board, black_board, (white_pieces + 1), black_pieces, (initial_white_pieces - 1), initial_black_pieces, (moves_left - 1));
            }
            else {
                if ( initial_white_pieces > 1 )
                    fnc = _set_piece;
                else
                    fnc = (white_pieces == 3) ? _jump_piece : _move_piece;
                tmp_result = fnc(solution, next_colour, white_board, new_board, white_pieces, (black_pieces + 1), initial_white_pieces, (initial_black_pieces - 1), (moves_left - 1));
            }
        }
        
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
