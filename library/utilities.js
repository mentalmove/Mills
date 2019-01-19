var mills = [];
var neighbours = [];

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
module.exports = {
    mills: mills,
    neighbours: neighbours
};

//console.log("utilities.js");
