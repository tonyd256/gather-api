
var UserModel = require('../models/user');
var push = require('../controllers/push');

exports.read = function (req, res, next) {
  UserModel.findOne({ deviceID: req.params.id }, function (err, user) {
    if (err) return next(err);
    res.send(user);
  });
};

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
  UserModel.findById(req.params.id, function (err, user) {
    if (err) return next(err);

    if (req.body.name) user.name = req.body.name;
    if (req.body.pushEnabled !== undefined) user.pushEnabled = req.body.pushEnabled;
    user.updatedAt = Date.now();

    user.save( function (err, result) {
      if (err) return next(err);
      res.send(result);
    });
  });
};

exports.register = function (req, res, next) {
  UserModel.findById(req.params.id, function (err, user) {
    if (err) return next(err);

    push.createEndpoint(res.body.deviceToken, function (err, pushID) {
      if (err) return next(err);

      user.pushEnabled = true;
      user.pushID = pushID;
      user.updatedAt = Date.now();

      user.save( function (err, result) {
        if (err) return next(err);
        res.send();
      });
    });
  });
};

