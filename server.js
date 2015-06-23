var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

var port = process.env.PORT || 8080;
var router = express.Router();

// FIXME : check if fscache exists
//         mkdir if it doesnt

router.get('/', function(req, res) {
  icon = 'favicon.ico';
  res.sendFile(icon, {'root' : __dirname + '/fscache'}, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', icon);
    }
  });
});

app.use('/', router);

// FIXME : add handler for 404?
//         add handler for general

app.listen(port);
console.log('Server started on :' + port);
