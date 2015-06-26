var _ = require('lodash');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');

var cache = require('./cache');
var sendIcon = require('./sendicon');
var logger = require('../log');

var GENERIC_PATHS = ['/favicon.ico', '/apple-touch-icon.png'];

function downloadIcon(uri, domain, asyncCb) {
  var cacheFilePath = cache.iconCachePath(domain);

  if (cache.inCache(domain))
    return;

  request(uri).pipe(fs.createWriteStream(cacheFilePath)).on('close', function(err) {
    if (err)
      res.status(err.status).end();
    else {

      var stats = fs.statSync(cacheFilePath);

      if (stats["size"] == 0) {
        fs.unlinkSync(cacheFilePath);
        logger.error('The domain sent back an invalid icon :' + domain);
        asyncCb(null, null);
        return;
      }

      asyncCb(uri);
    }
  });
}

function saveIfFound(uri, domain, asyncCb) {
  logger.debug('Trying with path strategy: ' + domain);

  request(uri, function(err, res, body){
    if (!err && (res.statusCode == 200 || res.statusCode == 304)) {
      if (!cache.inCache(domain)) {
        logger.info('Found with strategy #1: ' + domain);
        downloadIcon(uri, domain, asyncCb);
      }
    }
    else{
      if (res && res.statusCode == 404)
        logger.warn('Nothing here : ' + uri);
    }
  });
}

function pathStrategy(domain, asyncCb) {
  _.forEach(GENERIC_PATHS, function (path) {
    saveIfFound('http://' + domain + path, domain, asyncCb);
    saveIfFound('http://www.' + domain + path, domain, asyncCb);
  });
}

function crawlStrategy(domain, asyncCb) {
  request.get('http://' + domain, function(err, res, body) {
    if (!err && res.statusCode == 200) {
      $ = cheerio.load(body);

      $('link').each(function (index, element) {
        if ($(element).attr('rel').indexOf('icon') != -1) {
          logger.info('Found with strategy #2: ' + domain);
          downloadIcon('http://' + domain + $(element).attr('href'), domain, asyncCb);
        }
      });
   }
  });
}

module.exports = [pathStrategy, crawlStrategy];
