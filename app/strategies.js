var _ = require('lodash');
var request = require('request');

var cache = require('./cache');
var sendIcon = require('./sendicon');

var GENERIC_PATHS = ['/favicon.ico', '/apple-touch-icon.png'];

function saveIfFound(uri, domain, finalRes, found) {
  request.head(uri, function(err, res, body){
    if (res.headers['content-type'].indexOf('image/') !== 0)
      return;

    if (!err && (res.statusCode == 200 || res.statusCode == 304)) {
      cache.toCache(uri, domain, res.headers, finalRes, sendIcon.fromCache);
    }
    else {
      console.log(err);
    }
  });
}

function pathStrategy(domain, finalRes) {
  _.forEach(GENERIC_PATHS, function (path) {
    saveIfFound('http://' + domain + path, domain, finalRes);
    saveIfFound('http://www.' + domain + path, domain, finalRes);
  });
}

function crawlStrategy(domain, found, finalRes) {
  // FIXME : get page content
  // look for link first
  // look for anything that looks like an icon
}

module.exports = [pathStrategy, crawlStrategy];
