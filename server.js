var fs = require('fs');
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var router = express.Router();
var config = require(__dirname + '/config.js');

var getIcon = require(__dirname + '/app/geticon');

app.use(bodyParser.urlencoded({ extended: true }));

if (!fs.existsSync(config.fscachePath)){
  fs.mkdirSync(config.fscachePath);
}

router.get('/get', getIcon);

app.use('/', router);

// FIXME : add handler for 404?
//         add handler for general

app.listen(config.port);
console.log('Server started on :' + config.port);
