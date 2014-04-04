
var UserModel = require('../models/user');

exports.create = function (req, res, next) {
  var user = new UserModel({
    name: req.body.name,
    deviceID: req.body.deviceID
  });

  user.save( function (err, user) {
    if (err) return next(err);
    res.send(user);
  });
};

