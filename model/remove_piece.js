function _remove_piece (given_solution, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, moves_left) {
    
    execution_counter++;
    
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
                fnc = _set_piece;
            else
                fnc = (black_pieces == 4) ? _jump_piece : _move_piece;
            tmp_result = fnc(solution, next_colour, white_board, new_board, white_pieces, (black_pieces - 1), initial_white_pieces, initial_black_pieces, ml);
        }
        else {
            if ( initial_white_pieces > 1 )
                fnc = _set_piece;
            else
                fnc = (white_pieces == 4) ? _jump_piece : _move_piece;
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
