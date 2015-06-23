var _ = require('lodash');
var fs = require('fs');
var url = require('url');
var request = require('request');

var config = require('../config');

var PATHS = ['/favicon.ico', '/apple-touch-icon.png'];
function pathStrategy(domain, found) {
  _.forEach(PATHS, function (path) {

    console.log('path:'+ path);
    var uri = 'http://' + domain + path;
    request.head(uri, function(err, res, body){
      console.log('Trying : ' + uri,
      // FIXME : check content type/content length 

      if (!err && (res.statusCode == 200 || res.statusCode == 304)) {
        found(uri, domain, res.headers);
      }
      else {console.log(err);}
    });
  });

  // FIXME
  // try www + domain + path


  // FIXME : how to wait for every requests to be done before send this back?
  //console.log('No favicon could be found with this strategy');
}

function crawlStrategy(domain) {
  ;
}

function sendSavedIcon(uri, domain, headers, res) {
  var filePath = config.fscachePath + '/' + domain + '.ico';

  // Save file to fs cache
  request(uri).pipe(fs.createWriteStream(filePath)).on('close', function(err) {
    if (err){
      res.status(err.status).end();
    }
    else {
      // Send file back to client
      res.sendFile(filePath, {}, function (err) {
        if (err) {
          res.status(err.status).end();
        }
        else {
          console.log('Sent:', filePath);
        }
      });
    }
  });
}

function sendCachedIcon() {
  ;
}

function CleanHostName(originalURL) {
  if (originalURL.indexOf('http://') != 0) {
    return url.parse('http://' + originalURL).hostname;
  }
  return url.parse(originalURL).hostname;
}

var STRATEGIES = [pathStrategy, crawlStrategy];
var getIcon = function (req, res) {

  var domain = CleanHostName(req.query.domain);
  
  console.log('domain to crawl : ' + domain);

  // FIXME : test if domain exists else send back error

  // FIXME : if icon does not exist in fs cache

  // FIXME : remove!
  // A closure is used to keep the final res object
  // without polluting other function scopes with a useless variable
  pathStrategy(domain, function (domain, body, res_) {
    sendSavedIcon(domain, body, res_, res);
  });

  // FIXME : for strategy in STRATEGIES
  // var = res strategy(domain) != null
  // if res != null
  //  return res
  // return 'default.ico'
  
  // else
  //sendCachedIcon

  // How to know that no strategy worked?
}

module.exports = getIcon;
