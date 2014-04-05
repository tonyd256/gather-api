
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

exports.update = function (req, res, next) {
  UserModel.findOne(req.params.id, function (err, user) {
    console.log(err);
    console.log(user);
    if (err) return next(err);

    if (req.body.name) user.name = req.body.name;
    if (req.body.pushEnabled !== undefined) user.pushEnabled = req.body.pushEnabled;
    if (req.body.pushID) user.pushID = req.body.pushID;
    user.updatedAt = Date.now();

    user.save( function (err, result) {
      if (err) return next(err);
      res.send(result);
    });
  });
};
