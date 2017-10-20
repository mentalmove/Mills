function setPiece (mills, neighbours, search_removable, dummy) {
    
    
    function respect_removed (board, colour, the_sets) {
        
        var duplication_buster = {};
        var i, j, k, tmp, to_delete, the_continue;
        var collection = [];
        var verbose_colour = (colour == 1) ? "white" : "black";
        for ( i = 0; i < the_sets.length; i++ ) {
            if ( duplication_buster[the_sets[i]] )
                continue;
            duplication_buster[the_sets[i]] = 1;
            
            to_delete = search_removable(board, (colour * -1));
            for ( j = 0; j < to_delete.length; j++ ) {
                tmp = {};
                tmp.args = [the_sets[i], verbose_colour];
                tmp.board = [];
                for ( k = 0; k < board.length; k++ ) {
                    if ( k == the_sets[i] )
                        tmp.board[k] = colour;
                    else
                        tmp.board[k] = board[k];
                }
                tmp.board[to_delete[j]] = 0;
                collection.push( tmp );
            }
        }
        
        return collection;
    }
    
    function search_move (board, colour, forbidden, jump) {
        
        var the_sets = [];
        var opposite = [];
        
        var i, j, sum, index;
        var possible_sets = {
            i_can_build: [],
            opponent_can_build: [],
            opponent_has_chances: [],
            i_have_chances: []
        };
        for ( i = 0; i < board.length; i++ ) {
            if ( forbidden === i )
                continue;
            if ( board[i] ) {
                if ( i % 2 != 0 )
                    continue;
                index = ((i % 8) < 4) ? i + 4 : i - 4;
                if ( !board[index] )
                    opposite.push(index);
                continue;
            }
            
            for ( j = 0; j < mills[i].length; j++ ) {
                sum = board[mills[i][j][0]] + board[mills[i][j][1]] + board[mills[i][j][2]];
                if ( (sum * colour) == 2 )
                    possible_sets.i_can_build.push(i);
                if ( jump === undefined ) {
                    if ( (sum * colour) == -2 )
                        possible_sets.opponent_can_build.push(i);
                }
                if ( (sum * colour) == -1 ) {
                    if ( !board[mills[i][j][0]] || !board[mills[i][j][1]] || !board[mills[i][j][2]] )
                        possible_sets.opponent_has_chances.push(i);
                }
                if ( (sum * colour) == 1 ) {
                    if ( !board[mills[i][j][0]] || !board[mills[i][j][1]] || !board[mills[i][j][2]] )
                        possible_sets.i_have_chances.push(i);
                }
            }
        }
        
        if ( possible_sets.i_can_build.length )
            the_sets = possible_sets.i_can_build;
        else
            if ( possible_sets.opponent_can_build.length )
                the_sets = possible_sets.opponent_can_build;
            else
                if ( possible_sets.opponent_has_chances.length )
                    the_sets = possible_sets.opponent_has_chances;
                else
                    if ( possible_sets.i_have_chances.length )
                        the_sets = possible_sets.i_have_chances;
                
        if ( possible_sets.i_can_build.length )
            return respect_removed(board, colour, possible_sets.i_can_build);
        
        if ( !possible_sets.opponent_can_build.length ) {
            for ( i = 0; i < opposite.length; i++ )
                the_sets.push( opposite[i] );
        }

        while ( !the_sets.length ) {
            index = Math.floor(Math.random() * board.length);
            if ( board[index] || (index % 2 == 0 && !Math.floor(Math.random() * 3)) )
                continue;
            the_sets.push(index);
        }
        
        var duplication_buster = {};
        var tmp;
        var collection = [];
        var verbose_colour = (colour == 1) ? "white" : "black";
        for ( i = 0; i < the_sets.length; i++ ) {
            if ( duplication_buster[the_sets[i]] )
                continue;
            duplication_buster[the_sets[i]] = 1;
            tmp = {};
            tmp.args = [the_sets[i], verbose_colour];
            tmp.board = [];
            for ( j = 0; j < board.length; j++ ) {
                if ( j == the_sets[i] )
                    tmp.board[j] = colour;
                else
                    tmp.board[j] = board[j];
            }
            collection.push( tmp );
        }
        
        return collection;
    }
    this.search_move = search_move;
}
