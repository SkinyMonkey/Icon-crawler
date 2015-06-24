var request = require('request');
var fs = require('fs');

var cache = require('./cache');
var CONFIG = require('../config');

var sendIcon = function (res, filePath) {
  // FIXME : get mimes/content length

  res.sendFile(filePath, {}, function (err) {
    if (err) {
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', filePath);
    }
  });
}

function fromCache(res, domain) {
  sendIcon(res, cache.iconCachePath(domain));
}


module.exports = {
  'fromCache' : fromCache,
}
