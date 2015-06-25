var _ = require('lodash');
var cheerio = require('cheerio');
var request = require('request');

var cache = require('./cache');
var sendIcon = require('./sendicon');

var GENERIC_PATHS = ['/favicon.ico', '/apple-touch-icon.png'];

// We want to call the callback when the action failed or finished
// we can redefine the function to return its result
// then we'll use the last callback function to select the a result and save it

function saveIfFound(uri, domain, finalRes, found) {
  request.head(uri, function(err, res, body){
    if (res.headers['content-type'].indexOf('image/') !== 0)
      // FIXME : call callback here
      return;

    if (!err && (res.statusCode == 200 || res.statusCode == 304))
      // FIXME : call callback here
      cache.toCache(uri, domain, res.headers, finalRes, sendIcon.fromCache);
    else
      // FIXME : call callback here
      console.log(err);
  });
}

function pathStrategy(callback, domain, finalRes) {
  _.forEach(GENERIC_PATHS, function (path) {
    saveIfFound('http://' + domain + path, domain, finalRes);
    saveIfFound('http://www.' + domain + path, domain, finalRes);
  });
}

function crawlStrategy(callback, domain, finalRes) {
  /*
  request.get(uri, function(err, res, body) {
    $ = cheerio.load(body);
  // look for link with icon in the rel
  // take the href
    $('link').forEach(function (link) {
      if (link.attr('rel').indexOf('icon') != -1)
        cache.toCache(link.attr('href'), domain, res.headers, finalRes, sendIcon.fromCache);
    });

  // look for anything that looks like an icon
  });
  */
}

module.exports = [pathStrategy, crawlStrategy];
