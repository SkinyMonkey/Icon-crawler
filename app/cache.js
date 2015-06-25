var fs = require('fs');
var request = require('request');
var mime = require('mime');

var fileExists = require('../utils.js').fileExists;

var CONFIG = require('../config.js');
var INDEX = {};

function stamp(domain) {
  if (domain in INDEX) {
    INDEX[domain].timestamp = Date.now();
  }
  else {
    INDEX[domain] = {
      'timestamp': Date.now()
    }
  }
}

function stamped(domain) {
  return (domain in INDEX);
}

function addMetadata(domain, cacheFilePath) {
  var stats = fs.statSync(cacheFilePath);

  console.log('Adding metadata for : ', domain);
  INDEX[domain]['metadata'] =
    {'content-length' : stats["size"],
     'content-type': mime.lookup(cacheFilePath)};
}

function iconMetadata(domain) {
  return INDEX[domain]['metadata'];
}

function inCache(domain) {
  return (fileExists(iconCachePath(domain)));
}

function toCache(uri, domain, headers, res, cb) {
  // FIXME : what happens with very close querys for same domain?
  var cacheFilePath = iconCachePath(domain);

  // Avoid redownloading an icon with different strategies
  if (inCache(domain))
    return;

  request(uri).pipe(fs.createWriteStream(cacheFilePath)).on('close', function(err) {
    if (err)
      res.status(err.status).end();
    else {
      stamp(domain);
      addMetadata(domain, cacheFilePath);

      // cb == sendIcon.fromCache
      cb(domain, res);
    }
  });
}

function expired(domain) {
 var timestamp = INDEX[domain].timestamp - 0;
 var res = ((timestamp + CONFIG.timeout) < Date.now());
 console.log('expired:', res);
 /*
 console.log('domain:', domain);
 console.log('now :',Date.now());
 console.log('timestamp:', timestamp);
 console.log('timeout:', (timestamp + CONFIG.timeout));
 console.log('CONFIG.timeout:', CONFIG.timeout);
 console.log(res);
 */
 return (res);
}

function loadIndexFromFS(cb) {
  if (fileExists(CONFIG.cacheIndexPath)) {
    fs.readFile(CONFIG.cacheIndexPath, function (err, data) {
      if (err) {
        // FIXME : check what's in error
        console.log('Error while loading the cache index : ' + err);
        process.exit(-1);
      }
      INDEX = JSON.parse(data);
      cb();
    });
  }
  else {
    console.log("No index file found, creating one");
    fs.writeFileSync(CONFIG.cacheIndexPath, "{}");
    INDEX = {};
    cb();
  }
}

function saveIndexToFS() {
  console.log('Dumping index to fs.');
  console.log(CONFIG.cacheIndexPath);
  console.log(JSON.stringify(INDEX));
  fs.writeFileSync(CONFIG.cacheIndexPath, JSON.stringify(INDEX));
}

function iconCachePath(domain) {
  return CONFIG.fsCachePath + '/' + domain + '.ico';
}

module.exports = {
  'expired' : expired,
  'stamped' : stamped,
  'loadIndexFromFS' : loadIndexFromFS,
  'saveIndexToFS' : saveIndexToFS,
  'iconCachePath' : iconCachePath,
  'toCache' : toCache,
  'inCache' : inCache,
   'iconMetadata': iconMetadata
}
