var ai = require("./model/ai.js");
var view = require("./view/view.js");
var rules = require("./view_model/rules.js");

rules.set_view(view);
rules.set_ai(ai);

function init (colour) {
    if ( colour.match(/w/i) ) {
        view.set_colour("white", "black");
        rules.main("white", "black");
    }
    else {
        view.set_colour("black", "white");
        rules.main("black", "white");
    }
}
view.ask_colour(init);
