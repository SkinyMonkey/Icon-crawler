var SECONDS = 1000;

var config = {
  'port' : process.env.PORT || 8080,
  'fsCachePath' : __dirname + '/fscache',
  'cacheIndexPath' : __dirname + '/fscache/.index.json',
  'timeout' : 10 * SECONDS
};

module.exports = config;
