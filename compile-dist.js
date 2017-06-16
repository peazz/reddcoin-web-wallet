var fs = require('fs-extra');

var source = './app/deps';
var dest = './dist/deps';

fs.copy(source, dest, function (err) {

    if (err)
    {
        return console.error(err);
    }

    console.log('Copied to ' + dest);

});


var source = './app/views';
var dest = './dist/views';

fs.copy(source, dest, function (err) {

    if (err)
    {
        return console.error(err);
    }

    console.log('Copied to ' + dest);

});

var source = './app/assets';
var dest = './dist/assets';

fs.copy(source, dest, function (err) {

    if (err)
    {
        return console.error(err);
    }

    console.log('Copied to ' + dest);

});