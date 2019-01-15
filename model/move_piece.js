function _move_piece (given_solution, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, moves_left) {
    
    execution_counter++;
    
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
                    tmp_result = _remove_piece(solution, colour, new_board, black_board, white_pieces, black_pieces, 0, 0, 0);
                else
                    tmp_result = _remove_piece(solution, colour, white_board, new_board, white_pieces, black_pieces, 0, 0, 0);
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
                    fnc = (black_pieces == 3) ? _jump_piece : _move_piece;
                    tmp_result = fnc(solution, next_colour, new_board, black_board, white_pieces, black_pieces, 0, 0, (moves_left - 1));
                }
                else {
                    fnc = (white_pieces == 3) ? _jump_piece : _move_piece;
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
