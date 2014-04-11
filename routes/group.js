
var GroupModel = require('../models/group');
var _ = require('underscore');
var push = require('../controllers/push');

exports.read = function (req, res, next) {
  var options = { spherical: true, maxDistance: Number(req.query.radius) * Math.PI / 180.0 };
  GroupModel.geoNear([Number(req.query.latitude), Number(req.query.longitude)], options, function (err, results) {
    if (err) return next(err);

    var groups = _.pluck(results, 'obj');
    GroupModel.populate(groups, [ 'owner', 'people', 'comments.author' ], function (err, result) {
      if (err) return next(err);
      res.send(result);
    });
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

  group.save( function (err, group) {
    if (err) return next(err);

    GroupModel.populate(group, [ 'owner', 'people' ], function (err, result) {
      if (err) return next(err);
      res.send(result);

      push.createTopic(group.id, function (topicID) {
        if (!topicID) return;

        group.topicID = topicID;
        group.save( function (err, group) {
          if (err) return console.error(err);
          push.subscribe(group.topicID, group.owner.pushID);
        });
      });
    });
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

      GroupModel.populate(group, [ 'owner', 'people', 'comments.author' ], function (err, result) {
        if (err) return next(err);
        res.send(result);

        var comment = group.comments[group.comments.length - 1];
        var message = comment.author.name + ' says: ' + comment.comment.substr(0, 100);
        if (comment.comment.length > 100) message += '...';
        push.pushMessage(group.topicID, message);
      });
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

      GroupModel.populate(group, [ 'owner', 'people', 'comments.author' ], function (err, result) {
        if (err) return next(err);
        res.send(result);

        var user = _.findWhere(result.people, { _id: req.params.userID });
        push.subscribe(result.topicID, user.id);
      });
    });
  });
};

exports.leave = function (req, res, next) {
  GroupModel.findById(req.params.id, function (err, group) {
    if (err) return next(err);

    group.people.remove(req.params.userID);

    if (group.people.length === 0) {
      push.deleteTopic(group.topicID);
      group.remove( function (err) {
        if (err) return next(err);
        res.send({});
      });
      return;
    }

    group.save( function (err, group) {
      if (err) return next(err);

      GroupModel.populate(group, [ 'owner', 'people', 'comments.author' ], function (err, result) {
        if (err) return next(err);
        res.send(result);

        var user = _.findWhere(group.people, { _id: req.params.userID });
        push.unsubscribe(group.topicID, user.id);
      });
    });
  });
};

