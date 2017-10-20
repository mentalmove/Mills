function Rules (view, places, init_callback) {
    
    //var view;                                                                 // argument
    //var places;                                                               // argument
    
    //var model;                                                                // Constructor
    
    var pieces_to_set = {
        white: 9,
        black: 9
    };
    
    var board = [];
    
    var myself = this;
    
    
    function builds_mill (index, colour_indicator) {
        var tmp, trio, lowest, highest;
        if ( index % 2 ) {
            tmp = index % 8;
            /**
             * Builds connection between the three squares
             */
            if ( board[tmp] == colour_indicator && board[tmp + 8] == colour_indicator && board[tmp + 16] == colour_indicator )
                return true;
            /**
             * Is middle of line
             */
            trio = [(index - 1), index, (index + 1)];
            if ( trio[2] % 8 == 0 )
                trio[2] -= 8;
            if ( board[trio[0]] == colour_indicator && board[trio[1]] == colour_indicator && board[trio[2]] == colour_indicator )
                return true;
        }
        else {
            /**
             * Is corner of line...
             */
            lowest = Math.floor(index / 8) * 8;
            highest = lowest + 7;
            trio = [(index - 2), (index - 1), index];
            while ( trio[0] < lowest )
                trio[0] += 8;
            while ( trio[1] < lowest )
                trio[1] += 8;
            if ( board[trio[0]] == colour_indicator && board[trio[1]] == colour_indicator && board[trio[2]] == colour_indicator )
                return true;
            /**
             * ...or maybe corner of other line
             */
            trio = [index, (index + 1), (index + 2)];
            while ( trio[2] > highest )
                trio[2] -= 8;
            while ( trio[1] > highest )
                trio[1] -= 8;
            if ( board[trio[0]] == colour_indicator && board[trio[1]] == colour_indicator && board[trio[2]] == colour_indicator )
                return true;
        }
        
        return false;
    }
    
    function enable_remove (no_mill) {
        
        var i;
        var to_remove = [];
        for ( i = 0; i < board.length; i++ ) {
            if ( board[i] != -1 )
                continue;
            if ( no_mill && builds_mill(i, -1) )
                continue;
            to_remove.push(i);
        }
        
        if ( no_mill && !to_remove.length ) {
            enable_remove(false);
            return;
        }
        
        for ( i = 0; i < to_remove.length; i++ )
            places[to_remove[i]].enable_remove();
        
        view.en_dis_able_remove(true);
    }
    
    function set_phase () {
        var white = 0;
        var black = 0;
        for ( var i = 0; i < board.length; i++ ) {
            if ( board[i] == 1 )
                white++;
            if ( board[i] == -1 )
                black++;
        }
        view.phase = [ "lost", "lost" ];
        if ( white == 3 )
            view.phase[0] = "jump";
        if ( black == 3 )
            view.phase[1] = "jump";
        if ( white > 3 )
            view.phase[0] = "move";
        if ( black > 3 )
            view.phase[1] = "move";
        if ( view.phase[0] == "lost" ) {
            myself.game_end("black");
            return;
        }
        if ( view.phase[1] == "lost" )
            myself.game_end("white");
    }
    
    function enable_jumps () {
        
        var possible_moves = {};
        var empty_places = [];
        var target_coordinates = [];
        
        var i;
        for ( i = 0; i < board.length; i++ ) {
            if ( board[i] == 0 ) {
                empty_places.push(i);
                places[i].update_location();
                target_coordinates.push( places[i].style.location );
            }
        }
        for ( i = 0; i < board.length; i++ ) {
            if ( board[i] != 1 )
                continue;
            possible_moves[i] = empty_places;
            places[i].update_location();
        }
        
        for ( var prop in possible_moves )
            places[parseInt(prop)].enable_move(empty_places, target_coordinates);
    }
    
    function enable_moves () {
        
        var possible_moves = {};
        var num_movable_pieces = 0;
        var lower, higher, plus8, minus8, success, tmp, indices, i;
        for ( i = 0; i < board.length; i++ ) {
            if ( board[i] != 1 )
                continue;
            lower = (i % 8) ? i - 1 : i + 7;
            higher = (i % 8 != 7) ? i + 1 : i - 7;
            plus8 = -1;
            minus8 = -1;
            if ( i % 2 ) {
                if ( i - 8 >= 0 )
                    minus8 = i - 8;
                if ( i + 8 < board.length )
                    plus8 = i + 8;
            }
            tmp = [];
            if ( !board[lower] )
                tmp.push(lower);
            if ( !board[higher] )
                tmp.push(higher);
            if ( plus8 != -1 && !board[plus8] )
                tmp.push(plus8);
            if ( minus8 != -1 && !board[minus8] )
                tmp.push(minus8);
            if ( tmp.length ) {
                possible_moves[i] = tmp;
                num_movable_pieces++;
            }
        }
        
        if ( !num_movable_pieces ) {
            myself.game_end("black");
        }
        else {
            for ( var prop in possible_moves ) {
                places[parseInt(prop)].update_location();
                tmp = [];
                indices = [];
                for ( i = 0; i < possible_moves[prop].length; i++ ) {
                    places[possible_moves[prop][i]].update_location();
                    tmp.push( places[possible_moves[prop][i]].style.location );
                    indices.push( possible_moves[prop][i] );
                }
                places[parseInt(prop)].enable_move(indices, tmp);
            }
        }
    }
    
    this.game_end = function (winner) {
        view.game_end(winner);
    };
    
    this.swap_pieces = function (old_index, new_index, colour) {
        
        view.status = "wait";
        
        places[old_index].remove_piece();
        places[new_index].set_piece(colour);
        board[old_index] = 0;
        board[new_index] = (colour == "white") ? 1 : -1;
        
        if ( colour == "white" ) {
            for ( var i = 0; i < places.length; i++ ) {
                if ( places[i].piece )
                    places[i].disable_move();
            }
            if ( builds_mill(new_index, 1) )
                enable_remove(true);
            else
                model.search_move();
        }
        else {
            if ( builds_mill(new_index, -1) ) {
                model.remove_piece();
                setTimeout(from_phase_to_phase, 1234);
            }
            else
                from_phase_to_phase();
        }
    }; 
    
    
    this.remove_piece = function (index, colour) {
        board[index] = 0;
        places[index].remove_piece();
        if ( colour == "white" ) {
            if ( view.phase == "begin" )
                view.enable_set();
            
            view.status = "human";
        }
        else {
            view.status = "wait";
            if ( view.phase == "begin" ) {
                setTimeout(model.search_move, 666);
            }
            else {
                set_phase();
                setTimeout(model.search_move, 666);
            }
        }
        view.en_dis_able_remove(false);
    };
    
    function from_phase_to_phase () {
        set_phase();
        if ( view.phase[0] == "move")
            enable_moves();
        else
            enable_jumps();
    }
    
    this.set_piece = function (index, colour) {
        if ( board[index] ) {
            places[index].disable_set();
            return false;
        }
        pieces_to_set[colour]--;
        board[index] = (colour == "white") ? 1 : -1;
        if ( colour == "black" && pieces_to_set[colour] <= 0 && view.phase == "begin" ) {
            view.phase = "move";
        }
        var black_builds_mill;
        if ( colour == "black" ) {
            places[index].set_piece("black");
            black_builds_mill = builds_mill(index, -1);
            if ( black_builds_mill ) {
                view.en_dis_able_remove(true);
                model.remove_piece();
                if ( view.phase == "begin" )
                    return true;
            }
            if ( view.phase == "begin" )
                view.enable_set();
            else {
                if ( black_builds_mill )
                    setTimeout(from_phase_to_phase, 1234);
                else
                    from_phase_to_phase();
            }
            view.status = "human";
            return true;
        }
        view.status = "wait";
        if ( builds_mill(index, 1) ) {
            enable_remove(true);
            return true;
        }
        model.search_move();
        return true;
    };
    
    
    /**
     * Constructor
     */
    for ( var i = 0; i < places.length; i++ )
        board[i] = 0;
    view.status = "human";
    init_callback();
    
    var model = new Delegate(this, board, pieces_to_set);
}
