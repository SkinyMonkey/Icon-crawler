var _ = require('lodash');
var cheerio = require('cheerio');
var request = require('request');

var cache = require('./cache');
var sendIcon = require('./sendicon');

var GENERIC_PATHS = ['/favicon.ico', '/apple-touch-icon.png'];

function saveIfFound(uri, domain, finalRes, found) {
  request.head(uri, function(err, res, body){
    if (res.headers['content-type'].indexOf('image/') !== 0)
      return;

    if (!err && (res.statusCode == 200 || res.statusCode == 304))
      cache.toCache(uri, domain, res.headers, finalRes, sendIcon.fromCache);
    else
      console.log(err);
  });
}

function pathStrategy(domain, finalRes) {
  _.forEach(GENERIC_PATHS, function (path) {
    saveIfFound('http://' + domain + path, domain, finalRes);
    saveIfFound('http://www.' + domain + path, domain, finalRes);
  });
}

function crawlStrategy(domain, finalRes) {
  request.get('http://' + domain, function(err, res, body) {
    if (!err && res.statusCode == 200) {
      $ = cheerio.load(body);

      $('link').each(function (index, element) {
        if ($(element).attr('rel').indexOf('icon') != -1)
          cache.toCache($(element).attr('href'), domain, res.headers, finalRes, sendIcon.fromCache);
      });

      // FIXME : must be downloaded first to check dimensions
      /*
         $('img').each(function (index, element) {
         if ($(element).attr('id').indexOf('logo') != -1
         || $(element).attr('src').indexOf('logo') != -1
         || $(element).attr('class').indexOf('logo') != -1)
         cache.toCache($(element).attr('src'), domain, res.headers, finalRes, sendIcon.fromCache);
         });
         */
    }

  });
}

module.exports = [pathStrategy, crawlStrategy];
