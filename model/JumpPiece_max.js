function JumpPiece (mills, neighbours, search_removable, evaluate_fnc) {
    
    var begin;
    this.set_begin = function (o) {
        begin = o;
    };
    
    function search_move (board, colour) {
        
        var pieces = [];
        for ( i = 0; i < board.length; i++ ) {
            if ( board[i] == colour )
                pieces.push(i);
        }
        
        var collection = [];
        
        var i, j, tmp_collection, tmp_board;
        
        for ( i = 0; i < pieces.length; i++ ) {
            tmp_board = [];
            tmp_collection = [];
            for ( j = 0; j < board.length; j++ )
                tmp_board[j] = board[j];
            tmp_board[pieces[i]] = 0;
            tmp_collection = begin.search_move(tmp_board, colour, pieces[i]);
            for ( j = 0; j < tmp_collection.length; j++ ) {
                tmp_collection[j].args.unshift(pieces[i]);
                collection.push(tmp_collection[j]);
            }
        }
        
        return collection;
    }
    this.search_move = search_move;
}
