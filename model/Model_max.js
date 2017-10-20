function Delegate (rules, board, pieces_to_set) {
    
    var myself = this;
    
    var begin, move, jump;
    var phases = [];
    
    
    function load_class (pseudoclass, phase_index) {
        var url = "model/" + pseudoclass + ".js";
        var script_node = document.createElement("script");
        script_node.setAttribute("type","text/javascript");
        script_node.setAttribute("src", url);
        document.getElementsByTagName("head")[0].appendChild(script_node);
        script_node.onload = function () {
            phases[phase_index] = new window[pseudoclass](mills, neighbours, search_removable, evaluate);
            setTimeout(function (node) {
                node.parentNode.removeChild(node);
            }, 41, script_node);
        };
    }
    
    function search_removable (board, colour) {
        
        var removable = [];
        var i, j, the_continue;
        
        for ( i = 0; i < board.length; i++ ) {
            if ( board[i] != colour )
                continue;
            the_continue = 0;
            for ( j = 0; j < mills[i].length; j++ ) {
                if ( Math.abs(board[mills[i][j][0]] + board[mills[i][j][1]] + board[mills[i][j][2]]) == 3 ) {
                    the_continue = 1;
                    break;
                }
            }
            if ( the_continue )
                continue;
            removable.push(i);
        }
        if ( removable.length )
            return removable;
        
        for ( i = 0; i < board.length; i++ ) {
            if ( board[i] != colour )
                continue;
            removable.push(i);
        }
        return removable;
    }
    
    function evaluate (board) {
        
        var result = 0;
        
        var i, j, sum;
        for ( i = 0; i < board.length; i++ ) {
            
            if ( !board[i] )
                continue;
            
            result += board[i] * 24;
            
            for ( j = 0; j < mills[i].length; j++ ) {
                sum = board[mills[i][j][0]] + board[mills[i][j][1]] + board[mills[i][j][2]];
                if ( Math.abs(sum) != 2 )
                    continue;
                result += sum * 2;
            }
            
            for ( j = 0; j < neighbours[i].length; j++ ) {
                if ( board[neighbours[i][j]] )
                    continue;
                result += board[i];
            }
        }
        
        return result;
    }
    
    function which_search_collection_function (board, colour) {
        
        var threshold = 0;
        for ( i = 0; i < board.length; i++ ) {
            if ( board[i] == colour )
                threshold++;
        }
        
        if ( threshold > 3 )
            return move.search_move;
        return jump.search_move;
    }
    
    
    function try_out (board, tries, colour, fnc) {
        
        var tmp, random_index;
        
        if ( !tries ) {
            tmp = {};
            tmp.value = evaluate(board);
            return tmp;
        }
        
        var local_timestamp = new Date().getTime();
        var time_needed = local_timestamp - timestamp;
        if ( !fnc && tries >= 3 && time_needed > 6000 ) {
            tries -= 2;
        }
        
        var search_collection_function = fnc || which_search_collection_function(board, colour);
        
        var tmp_collection = search_collection_function(board, colour);
        var collection = [];
        while ( tmp_collection.length ) {
            random_index = Math.floor(Math.random() * tmp_collection.length);
            collection.push(tmp_collection[random_index]);
            tmp_collection.splice(random_index, 1);
        }
        
        var to_return;
        for ( var i = 0; i < collection.length; i++ ) {
            tmp = try_out(collection[i].board, (tries - 1), (colour * -1), fnc);
            if ( !tmp )
                continue;
            if ( to_return === undefined || ((colour == 1 && tmp.value > to_return.value) || (colour == -1 && tmp.value < to_return.value)) ) {
                to_return = tmp;
                to_return.args = collection[i].args;
            }
        }

        return to_return;
    }
    
    
    var mills = [];
    var neighbours = [];
    
    var timestamp;
    
    
    this.remove_piece = function () {
        
        var to_delete = search_removable(board, 1);
        
        var which = -1;
        var i, j, tmp_board, tmp_value, the_value;
        for ( i = 0; i < to_delete.length; i++ ) {
            tmp_board = [];
            for ( j = 0; j < board.length; j++ )
                tmp_board[j] = board[j];
            tmp_board[to_delete[i]] = 0;
            tmp_value = evaluate(tmp_board);
            if ( which == -1 || tmp_value < the_value ) {
                the_value = tmp_value;
                which = to_delete[i];
            }
        }
        setTimeout(function () {
            rules.remove_piece(which, "white");
        }, 101);
    };
    this.search_move = function () {
        
        var the_return;
        var tries = 5;
        var MAX_TRIES = 7;                                                      // 7
        
        timestamp = new Date().getTime();
        
        if ( pieces_to_set.black > 0 ) {
            if ( !begin )
                begin = phases[0];
            while ( tries > (pieces_to_set.white + pieces_to_set.black) )
                tries -= 2;
            the_return = try_out(board, tries, -1, begin.search_move);
            setTimeout(function () {
                rules.set_piece.apply(undefined, the_return.args);
            }, 41);
        }
        else {
            if ( !jump ) {
                jump = phases[2];
                jump.set_begin(begin);
            }
            tries = 0;
            for ( var i = 0; i < board.length; i++ ) {
                if ( board[i] )
                    tries++;
            }
            tries = (tries > MAX_TRIES) ? MAX_TRIES : tries;
            if ( tries % 2 == 0 )
                tries--;
            the_return = try_out(board, tries, -1);
            setTimeout(function () {
                rules.swap_pieces.apply(undefined, the_return.args);
            }, 41);
        }
        
        if ( phases.length < 2 ) {
            load_class("MovePiece", 1);
            return;
        }
        if ( phases.length < 3 )
            load_class("JumpPiece", 2);
        if ( !move )
            move = phases[1];
    };
    
    
    /**
     * Constructor
     */
    var i, j;
    for ( i = 0; i < 24; i+= 2 ) {
        mills[i] = [];
        mills[i].push( [i, i + 1, (i + 2) % 8 + parseInt(i / 8) * 8] );
        mills[i].push( [(i + 6) % 8 + parseInt(i / 8) * 8, (i + 7) % 8 + parseInt(i / 8) * 8, i] );
        mills[i + 1] = [];
        mills[i + 1].push( [i, i + 1, (i + 2) % 8 + parseInt(i / 8) * 8] );
        
        neighbours[i] = [(i + 7) % 8 + parseInt(i / 8) * 8, i + 1];
        neighbours[i + 1] = [i, (i + 2) % 8 + parseInt(i / 8) * 8];
    }
    for ( i = 1; i < 8; i+= 2 ) {
        for ( j = 0; j < 24; j+= 8 ) {
            mills[i + j].push( [i, i + 8, i + 16] );
            if ( j >= 8 )
                neighbours[i + j].push( i + j - 8 );
            if ( j < 16 )
                neighbours[i + j].push( i + j + 8 );
        }
    }
    
    load_class("setPiece", 0);
}
