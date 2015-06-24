var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var router = express.Router();

var CONFIG = require(__dirname + '/config.js');

var getIcon = require(__dirname + '/app/geticon');
var cache = require(__dirname + '/app/cache');

app.use(bodyParser.urlencoded({ extended: true }));

// FIXME : replace by utils..fileExists
if (!fs.existsSync(CONFIG.fsCachePath)){
  fs.mkdirSync(CONFIG.fsCachePath);
}

cache.loadIndexFromFS(function () {
  router.get('/get', getIcon);

  app.use('/', router);

  // FIXME : add handler for 404?
  //         add handler for general

  // FIXME : handles to dump cache on FS in case of crash/whatever

  app.listen(CONFIG.port);
  console.log('Server started on :' + CONFIG.port);
})
