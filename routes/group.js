
var GroupModel = require('../models/group');

exports.read = function (req, res, next) {
  var options = { spherical: true, maxDistance: Number(req.query.radius) * Math.PI / 180.0 };
  GroupModel.geoNear([Number(req.query.latitude), Number(req.query.longitude)], options, function (err, results) {
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

exports.comment = function (req, res, next) {
  var comment = {
    author: req.body.author,
    comment: req.body.comment
  };

  GroupModel.findById(req.params.id, function (err, group) {
    if (err) return next(err);

    group.comments.push(comment);
    group.save( function (err, group) {
      if (err) return next(err);
      res.send(group);
    });
  });
};

exports.join = function (req, res, next) {
  GroupModel.findById(req.params.id, function (err, group) {
    if (err) return next(err);
    if (group.people.indexOf(req.params.userID) !== -1) return res.send(group);

    group.people.push(req.params.userID);
    group.save( function (err, group) {
      if (err) return next(err);
      res.send(group);
    });
  });
};

exports.leave = function (req, res, next) {
  GroupModel.findById(req.params.id, function (err, group) {
    if (err) return next(err);

    group.people.remove(req.params.userID);

    if (group.people.length === 0) {
      group.remove( function (err) {
        if (err) return next(err);
        res.send({});
      });
      return;
    }

    group.save( function (err, group) {
      if (err) return next(err);
      res.send(group);
    });
  });
};

