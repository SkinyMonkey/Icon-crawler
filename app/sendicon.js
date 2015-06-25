var request = require('request');
var fs = require('fs');

var cache = require('./cache');
var CONFIG = require('../config');

var fromCache = function (domain, res) {
  filePath = cache.iconCachePath(domain);
  res.sendFile(filePath, {'headers': cache.iconMetadata(domain)}, function (err) {
    if (err) {
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', filePath);
    }
  });
}

module.exports = {
  'fromCache' : fromCache,
}
