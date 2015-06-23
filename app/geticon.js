var _ = require('lodash');
var fs = require('fs');
var url = require('url');
var request = require('request');

var sendSavedIcon = require('./sendicon').sendSavedIcon;
var sendCachedIcon = require('./sendicon').sendCachedIcon;

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

var getIcon = function (req, res) {

  var domain = cleanHostName(req.query.domain);
  
  console.log('domain to crawl : ' + domain);

  checkDomainExists(domain, res, function () {
   // FIXME : if icon does not exist in fs cache

    // FIXME : debug
    STRATEGIES[0](domain, sendSavedIcon, res);

    // FIXME : for strategy in STRATEGIES
    // var = res strategy(domain) != null
    // if res != null
    //  return res
    // return 'default.ico'

    // else
    //sendCachedIcon

    // How to know that no strategy worked?
  });
}

module.exports = getIcon;
