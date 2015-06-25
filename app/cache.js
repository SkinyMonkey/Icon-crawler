var fs = require('fs');
var request = require('request');
var mime = require('mime');

var fileExists = require('../utils').fileExists;
var logger = require('../log');

var CONFIG = require('../config');
var metadata = {};

function stamp(domain) {
  if (domain in metadata) {
    metadata[domain].timestamp = Date.now();
  }
  else {
    metadata[domain] = {
      'timestamp': Date.now()
    }
  }
}

function stamped(domain) {
  return (domain in metadata);
}

function addMetadata(domain, cacheFilePath) {
  var stats = fs.statSync(cacheFilePath);

  logger.info('Adding metadata for : ', domain);
  metadata[domain]['metadata'] =
    {'content-length' : stats["size"],
     'content-type': mime.lookup(cacheFilePath)};
}

function iconMetadata(domain) {
  return metadata[domain]['metadata'];
}

function inCache(domain) {
  return (fileExists(iconCachePath(domain)));
}

function toCache(uri, domain, res, cb) {
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
 var timestamp = metadata[domain].timestamp - 0;
 var res = ((timestamp + CONFIG.timeout) < Date.now());
 logger.info('expired:', res);
 return (res);
}

function loadIndexFromFS(cb) {
  if (fileExists(CONFIG.cacheIndexPath)) {
    fs.readFile(CONFIG.cacheIndexPath, function (err, data) {
      if (err) {
        // FIXME : check what's in error
        logger.error('Error while loading the cache index : ' + err);
        process.exit(-1);
      }
      metadata = JSON.parse(data);
      cb();
    });
  }
  else {
    logger.error("No index file found, creating one");
    fs.writeFileSync(CONFIG.cacheIndexPath, "{}");
    metadata = {};
    cb();
  }
}

function saveIndexToFS() {
  logger.error('Dumping index to fs.');
  fs.writeFileSync(CONFIG.cacheIndexPath, JSON.stringify(metadata));
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
