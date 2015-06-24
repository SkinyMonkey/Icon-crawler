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

function applyStrategies(res, domain) {
  // FIXME : for each in strategy
  // strategy
  // wait for all to be finished
  // if stamped(domain)
  //  found = true
  //  break
  // if found == false
  //  res.send(no icon was found)
  //

  _.forEach(STRATEGIES, function (strategy) {
    strategy(domain, res)
  })
}

function getIcon(req, res) {
  var domain = cleanHostName(req.query.domain);

  if (cache.inCache(domain) && cache.expired(domain) == false) {
    console.log('Sending cached file');
    sendIcon.fromCache(res, domain)
  }
  else{
    checkDomainExists(domain, res, function () {
      console.log('Sending fresh file');
      applyStrategies(res, domain);
    });
  }
}

module.exports = getIcon;
