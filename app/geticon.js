var _ = require('lodash');
var fs = require('fs');
var url = require('url');
var request = require('request');

var cache = require('./cache');
var sendIcon = require('./sendicon');

var CONFIG = require('../config');
var STRATEGIES = require('./strategies');

function cleanHostName(originalURL) {
  if (originalURL.indexOf('http://') != 0) {
    return url.parse('http://' + originalURL).hostname;
  }
  return url.parse(originalURL).hostname;
}

function checkDomainExists(domain, res, cb) {
  request.head('http://' + domain, function(err){
    if (err){
      if (err.errno == 'ENOTFOUND'){
        return res.send({'error' : 'This domain does not exists: ' + domain}).end();
      }
      return res.send(
      {'error' : 'An error occured on this domain, please contact an administrator'})
      .end();
    }

    cb(domain, res);
  });
}

function strategyClosures(domain, res) {
  // see lo dash for better formule
  // for strategy in strategies
  // push(function() {strategy(domain, res)})
}

function applyStrategies(domain, res) {
  _.forEach(STRATEGIES, function (strategy) {
    strategy(domain, res);
  });
}

function getIcon(req, res) {
  var domain = cleanHostName(req.query.domain);

  var expired = cache.stamped(domain) && cache.expired(domain);
  if (cache.inCache(domain) && expired == false) {
    console.log('Sending cached file');
    sendIcon.fromCache(domain, res)
  }
  else{
    if (cache.inCache(domain) && expired)
      fs.unlinkSync(cache.iconCachePath(domain));

    checkDomainExists(domain, res, function () {
      console.log('Sending fresh file');
      applyStrategies(domain, res);
    });
  }
}

module.exports = getIcon;
