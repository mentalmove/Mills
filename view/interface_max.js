function Interface (places, phase) {
    
    //var places;                                                               // argument
    
    var myself = this;
    
    this.phase = phase;                                                         // "begin", ["move", "move"], ["move", "jump"], ["jump", "move"], ["jump", "jump"]
    this.status = "wait";                                                       // "wait", "human"
    
    
    function set_piece (index) {
        if ( myself.status != "human" || myself.phase != "begin" )
            return false;
        if ( !rules.set_piece(index, "white") )
            return false;
        for ( var i = 0; i < places.length; i++ )
            places[i].disable_set();
        return true;
    }
    
    this.enable_set = function () {
        for ( var i = 0; i < places.length; i++ ) {
            if ( !places[i].piece )
                places[i].enable_set(set_piece);
            else
                places[i].disable_set();
        }
    }
    
    this.en_dis_able_remove = function (enable) {
        if ( enable ) {
            document.body.style.backgroundColor = "#886666";
        }
        else {
            for ( var i = 0; i < places.length; i++ )
                places[i].disable_remove();
            document.body.style.backgroundColor = "silver";
        }
    };
    
    this.game_end = function (winner) {
        var screen = document.createElement("div");
        screen.style.position = "absolute";
        screen.style.left = "0px";
        screen.style.top = "35%";
        screen.style.width = "100%";
        screen.style.height = "50%";
        screen.style.zIndex = 100;
        screen.style.fontFamily = "Verdana";
        screen.style.fontSize = "84px";
        screen.style.textAlign = "center";
        if ( winner ) {
            screen.style.color = winner;
            var s = winner + " wins";
        }
        else {
            screen.style.color = "#886666";
            var s = "draw";
        }
        screen.innerHTML = s.toUpperCase();
        document.body.appendChild(screen);
    };
    
    
    /**
     * Constructor
     */
    function init () {
        myself.enable_set();
    }
    window.rules = new Rules(this, places, init);
}
