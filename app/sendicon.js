var sendIcon = function (res, root, icon) {
  res.sendFile(icon, {'root' : root}, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', icon);
    }
  });
}

module.exports = sendIcon;
