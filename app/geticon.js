var _ = require('lodash');
var fs = require('fs');
var url = require('url');
var request = require('request');
var async = require('async');

var cache = require('./cache');
var sendIcon = require('./sendicon');
var logger = require('../log');

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
        logger.info('Domain does not exist: ' + domain);
        return res.send({'error' : 'This domain does not exists: ' + domain}).end();
      }
      logger.info('An error occured for: ' + domain + ' : ' + err.errno);
      return res.send(
      {'error' : 'An error occured on this domain, please contact an administrator'})
      .end();
    }

    logger.info('Domain exists: ' + domain);
    cb(domain, res);
  });
}

function strategyClosures(domain) {
  closures = [];
  _.forEach(STRATEGIES, function(strategy) {
    closures.push(function (asynCb) {
      strategy(domain, asynCb);
    });
  });
  return (closures);
}

function applyStrategies(domain, res) {
  async.series(strategyClosures(domain), function (uri) {
    // This is a hack on the series error mecanism.
    // Either this callback will be called with an acceptable result
    // or it will be called with null as a first parameter when
    // there is no more strategies available.

    if (uri)
      cache.toCache(domain, res, sendIcon.fromCache);
    else
      res.send({'error': 'No icon could be found on ' + domain}).end();
  });
}

function getIcon(req, res) {
  var domain = cleanHostName(req.query.domain);

  var expired = cache.stamped(domain) && cache.expired(domain);
  if (cache.inCache(domain) && expired == false) {
    logger.info('Sending cached file for: ' + domain);
    sendIcon.fromCache(domain, res)
  }
  else{
    if (cache.inCache(domain) && expired)
      fs.unlinkSync(cache.iconCachePath(domain));

    checkDomainExists(domain, res, function () {
      logger.info('Sending fresh file for: ' + domain);
      applyStrategies(domain, res);
    });
  }
}

module.exports = getIcon;
