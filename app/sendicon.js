var request = require('request');
var fs = require('fs');

var CONFIG = require('../config');

var sendIcon = function (res, filePath) {
  res.sendFile(filePath, {}, function (err) {
    if (err) {
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', filePath);
    }
  });
}

function sendSavedIcon(uri, domain, headers, res) {
  var filePath = CONFIG.fscachePath + '/' + domain + '.ico';

  // Save file to fs cache
  request(uri).pipe(fs.createWriteStream(filePath)).on('close', function(err) {
    if (err){
      res.status(err.status).end();
    }
    else {
      // Send file back to client
      sendIcon(res, filePath);
    }
  });
}

function sendCachedIcon() {
  ;
}


module.exports = {
  'sendSavedIcon' : sendSavedIcon,
  'sendCachedIcon' : sendCachedIcon
}
