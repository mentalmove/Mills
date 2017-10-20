function MovePiece (mills, neighbours, search_removable, evaluate_fnc) {
    
    function respect_removed (board, colour, moves) {
        
        var to_delete = search_removable(board, (colour * -1));
        var verbose_colour = (colour == 1) ? "white" : "black";
        
        var i, j, count, deletable, tmp, tmp_value, the_value;
        var collection = [];
        for ( count = 0; count < to_delete.length; count++ ) {
            deletable = to_delete[count];
            for ( i = 0; i < moves.length; i++ ) {
                tmp = {};
                tmp.args = [moves[i][0], moves[i][1], verbose_colour];
                tmp.board = [];
                for ( j = 0; j < board.length; j++ )
                    tmp.board[j] = board[j];
                tmp.board[moves[i][0]] = 0;
                tmp.board[moves[i][1]] = colour;
                tmp.board[deletable] = 0;
                
                tmp_value = evaluate_fnc(tmp.board);
                if ( collection.length <= i || ((colour == 1 && tmp_value > the_value) || (colour == -1 && tmp_value < the_value)) ) {
                    the_value = tmp_value;
                    collection[i] = tmp;
                }
            }
        }
        
        return collection;
    }
    
    function search_move (board, colour) {
        
        var pieces = [];
        var moves = [];
        var building_mill = [];
        var not_building_mill = [];
        
        var i, j, builds_mill, tmp_value;
        
        for ( i = 0; i < board.length; i++ ) {
            if ( board[i] == colour )
                pieces.push(i);
        }
        
        for ( i = 0; i < pieces.length; i++ ) {
            for ( j = 0; j < neighbours[pieces[i]].length; j++ ) {
                if ( board[neighbours[pieces[i]][j]] )
                    continue;
                moves.push( [pieces[i], neighbours[pieces[i]][j]] );
            }
        }
        
        for ( i = 0; i < moves.length; i++ ) {
            builds_mill = 0;
            for ( j = 0; j < mills[moves[i][1]].length; j++ ) {
                if ( (board[mills[moves[i][1]][j][0]] + board[mills[moves[i][1]][j][1]] + board[mills[moves[i][1]][j][2]]) == (2 * colour)
                        && mills[moves[i][1]][j][0] != moves[i][0] && mills[moves[i][1]][j][1] != moves[i][0] && mills[moves[i][1]][j][2] != moves[i][0] ) {
                            builds_mill = 1;
                            building_mill.push( moves[i] );
                            break;
                        }
            }
            if ( !builds_mill )
                not_building_mill.push( moves[i] );
        }
        
        var collection = [];
        
        var building_mill_collection = respect_removed(board, colour, building_mill);
        
        for ( i = 0; i < building_mill_collection.length; i++ )
            collection.push( building_mill_collection[i] );
        
        var verbose_colour = (colour == 1) ? "white" : "black";
        var tmp;
        var value_object = {};
        for ( i = 0; i < not_building_mill.length; i++ ) {
            tmp = {};
            tmp.args = [not_building_mill[i][0], not_building_mill[i][1], verbose_colour];
            tmp.board = [];
            for ( j = 0; j < board.length; j++ )
                tmp.board[j] = board[j];
            tmp.board[not_building_mill[i][0]] = 0;
            tmp.board[not_building_mill[i][1]] = colour;
            
            tmp_value = evaluate_fnc(tmp.board);
            if ( !building_mill.length ) {
                if ( !value_object[not_building_mill[i][0]] || ((colour == 1 && tmp_value > value_object[not_building_mill[i][0]]) || (colour == -1 && tmp_value < value_object[not_building_mill[i][0]])) ) {
                    value_object[not_building_mill[i][0]] = tmp_value;
                    collection.push( tmp );
                }
            }
            else {
                if ( !value_object.general || ((colour == 1 && tmp_value > value_object.general) || (colour == -1 && tmp_value < value_object.general)) ) {
                    value_object.general = tmp_value;
                    collection.push( tmp );
                }
            }
        }
        
        return collection;
    }
    this.search_move = search_move;
}
