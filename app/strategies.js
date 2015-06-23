var _ = require('lodash');
var request = require('request');

var sendIcon = require('./sendicon');

var GENERIC_PATHS = ['/favicon.ico', '/apple-touch-icon.png'];
function pathStrategy(domain, found, finalRes) {
  _.forEach(GENERIC_PATHS, function (path) {

    var uri = 'http://' + domain + path;
    request.head(uri, function(err, res, body){
      // FIXME : check content type/content length 
      if (res.headers['content-type'].indexOf('image/') !== 0)
        return;

      if (!err && (res.statusCode == 200 || res.statusCode == 304)) {
        found(uri, domain, res.headers, finalRes);
      }
      else {
        console.log(err);
      }
    });
  });

  // FIXME
  // try www + domain + path


  // FIXME : how to wait for every requests to be done before send this back?
  //console.log('No favicon could be found with this strategy');
}

function crawlStrategy(domain, found, finalRes) {
  ;
}

module.exports = [pathStrategy, crawlStrategy];
