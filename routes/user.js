
var UserModel = require('../models/user');
var sns = new require('aws-sdk').SNS({ apiVersion: '2010-03-31' });

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
    if (req.body.pushID) user.pushID = req.body.pushID;
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

    var params = {
      PlatformApplicationArn: process.env['SNS_APPLICATION_ARN'],
      Token: req.params.deviceID
    };

    sns.createPlatformEndpoint(params, function (err, data) {
      if (err) return next(err);

      user.pushID = data.EndpointArn;
      user.save( function (err, result) {
        if (err) return next(err);
        res.send();
      });
    });
  });
};

