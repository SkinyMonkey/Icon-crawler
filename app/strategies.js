var _ = require('lodash');
var cheerio = require('cheerio');
var request = require('request');

var cache = require('./cache');
var sendIcon = require('./sendicon');
var logger = require('../log');

var GENERIC_PATHS = ['/favicon.ico', '/apple-touch-icon.png'];

function saveIfFound(uri, domain, asyncCb) {
  request.head(uri, function(err, res, body){
    if (res.headers['content-type'].indexOf('image/') !== 0)
      return;

    if (!err && (res.statusCode == 200 || res.statusCode == 304)) {
      if (!cache.inCache(domain))
        asyncCb(uri);
    }
    else
      logger.warning(err);
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
        if ($(element).attr('rel').indexOf('icon') != -1)
          asyncCb(uri);
      });

      // FIXME : must be downloaded first to check dimensions
      /*
         $('img').each(function (index, element) {
         if ($(element).attr('id').indexOf('logo') != -1
         || $(element).attr('src').indexOf('logo') != -1
         || $(element).attr('class').indexOf('logo') != -1)
         asyncCb($(element).attr('src'));
         });
         */
    }

  });
}

module.exports = [pathStrategy, crawlStrategy];
