
var GroupModel = require('../models/group');

exports.read = function (req, res, next) {
  var options = { near: [req.body.latitude, req.body.longitude], maxDistance: req.body.radius };
  GroupModel.geoSearch({}, options, function (err, results) {
    if (err) return next(err);
    res.send(results);
  });
};

exports.create = function (req, res, next) {
  var group = new GroupModel({
    owner: req.body.owner,
    type: req.body.type,
    time: req.body.time,
    coordinate: [req.body.latitude, req.body.longitude],
    people: [req.body.owner]
  });

  group.save( function (err, result) {
    if (err) return next(err);
    res.send(result);
  });
};

