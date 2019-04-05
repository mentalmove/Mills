function _remove_piece (given_solution, colour, white_board, black_board, white_pieces, black_pieces, initial_white_pieces, initial_black_pieces, moves_left) {

    var best_result_value = (colour == "white") ? -13824 : 13824;

    var reduced_moves_left = moves_left;
    while (reduced_moves_left > 2)
        reduced_moves_left -= 2;

    var own_board = (colour == "white") ? white_board : black_board;
    var opponent_board = (colour == "white") ? black_board : white_board;
    var opponent_pieces = (colour == "white") ? black_pieces : white_pieces;
    var initial_opponent_pieces = (colour == "white") ? initial_black_pieces : initial_white_pieces;

    var fnc;
    if ( initial_opponent_pieces >= 1 )
        fnc = _set_piece;
    else
        fnc = (opponent_pieces <= 4) ? _jump_piece : _move_piece;
    var test_fnc;
    if ( initial_opponent_pieces >= 1 )
        test_fnc = test_set_piece;
    else
        test_fnc = (opponent_pieces <= 4) ? test_jump_piece : test_move_piece;

    var tmp_result, result;

    var i, new_board, solution;
    var is_in_mill = [];
    var not_in_mill = [];
    for ( var ii = 0; ii < 24; ii++ ) {
        i = indices[ii];
        if ( !(opponent_board & (1 << i)) )
            continue;
        if ( builds_mill(opponent_board, i) )
            is_in_mill.push(i);
        else
            not_in_mill.push(i);
    }
    var mill_remove = (not_in_mill.length) ? not_in_mill : is_in_mill;

    if ( mill_remove.length == 1 )
        reduced_moves_left = 1;

    /*var extend = false;
    if ( 1 && reduced_moves_left == 1 && mill_remove.length != 1 ) {
        extend = true;
    }*/

    //var do_extend;
    for ( i = 0; i < mill_remove.length; i++ ) {
        new_board = opponent_board;
        new_board ^= 1 << mill_remove[i];
        solution = given_solution || [-1, mill_remove[i]];

        /*do_extend = extend;
        if ( do_extend )
            do_extend = test_fnc(new_board, own_board);

        if ( do_extend ) {
            console.log( "do_extend: " + do_extend + " BEFORE" );
        }*/

        if ( colour == "white" )
            tmp_result = fnc(solution, "black", white_board, new_board, white_pieces, (black_pieces - 1), initial_white_pieces, initial_black_pieces, (reduced_moves_left - 1));
        else
            tmp_result = fnc(solution, "white", new_board, black_board, (white_pieces - 1), black_pieces, initial_white_pieces, initial_black_pieces, (reduced_moves_left - 1));

        //if ( !given_solution )
            //console.log( "\t REMOVE: " + tmp_result[1][1] + " (" + tmp_result[0] + "); " + colour + " " + best_result_value );

        if ( !tmp_result )
            continue;
        if ( colour == "white" && tmp_result[0] <= best_result_value )
            continue;
        if ( colour == "black" && tmp_result[0] >= best_result_value )
            continue;

        /*if ( do_extend ) {
            console.log( "do_extend: " + do_extend + " AFTER" );
        }*/

        result = tmp_result;
        best_result_value = tmp_result[0];
    }

    return result;
}
