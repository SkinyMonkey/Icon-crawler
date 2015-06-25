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

function exitHandler(options, err) {
  if (options.dump)
    cache.saveIndexToFS();

  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}

cache.loadIndexFromFS(function () {
  router.get('/get', getIcon);

  app.use('/', router);

  // FIXME : add handler for 404?
  //         add handler for general

  process.on('exit', exitHandler.bind(null,{dump: true, exit:true}));
  process.on('SIGINT', exitHandler.bind(null, {dump: true, exit:true}));
  process.on('uncaughtException', exitHandler.bind(null, {dump: false, exit:false}));

  app.listen(CONFIG.port);
  console.log('Server started on :' + CONFIG.port);
})
