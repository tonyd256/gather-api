
var request = require('superagent');
var expect = require('expect.js');
var mongoose = require('mongoose');
var UserModel = require('../models/user');
var GroupModel = require('../models/group');

describe('Groups', function () {
  var user;
  var otherUser;
  var group;

  before( function (done) {
    mongoose.connect('mongodb://localhost/gather');
    var model = new UserModel({
      name: 'Test User',
      deviceID: 'd9h374fho38f7gq4'
    });

    model.save( function (err, result) {
      if (err) throw err;
      user = JSON.parse(JSON.stringify(result.toJSON()));
      done();
    });
  });

  after( function (done) {
    UserModel.remove({ _id: user._id }, function (err) {
      if (err) console.log(err);
      UserModel.remove({ _id: otherUser._id }, function (err) {
        if (err) console.log(err);
        mongoose.disconnect( function () {
          done();
        });
      });
    });
  });

  describe('POST', function () {
    it('should create and return an new group', function (done) {
      group = {
        owner: user._id,
        type: "run",
        time: new Date().toISOString(),
        latitude: 42.35843,
        longitude: -71.05977
      };

      request.post('http://localhost:3000/api/v1/groups')
      .send(group)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .end(function (err, res) {
        if (err) throw err;

        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.body._id).to.exist;
        expect(res.body.owner._id).to.equal(user._id);
        expect(res.body.people).to.be.an('array');
        expect(res.body.people[0]._id).to.equal(user._id);
        expect(res.body.comments).to.be.an('array');
        expect(res.body.coordinate).to.be.an('array');
        expect(res.body.coordinate.length).to.equal(2);
        expect(res.body.coordinate[0]).to.equal(group.latitude);
        expect(res.body.coordinate[1]).to.equal(group.longitude);

        group = res.body;
        done();
      });
    });
  });

  describe('GET', function () {
    it('should return all groups in a bounding box', function (done) {
      request.get('http://localhost:3000/api/v1/groups?latitude=42.35843&longitude=-71.05977&radius=.05', function (res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.not.equal(0);
        expect(res.body[0]._id).to.equal(group._id);
        done();
      });
    });

    it('should not return groups out of range', function (done) {
      request.get('http://localhost:3000/api/v1/groups?latitude=42.25843&longitude=-71.15977&radius=.05', function (res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.equal(0);
        done();
      });
    });
  });

  describe('Comment POST', function () {
    it('should add the comment to the group and return the group', function (done) {
      var comment = {
        author: user._id,
        comment: 'Cool story bro.'
      };
      
      request.post('http://localhost:3000/api/v1/groups/' + group._id + '/comment')
      .send(comment)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .end(function (err, res) {
        if (err) throw err;

        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.body.comments).to.be.an('array');
        expect(res.body.comments.length).to.equal(1);
        expect(res.body.comments[0]._id).to.exist;
        expect(res.body.comments[0].author._id).to.equal(user._id);
        expect(res.body.comments[0].comment).to.equal(comment.comment);
        done();
      });
    });
  });

  describe('User Join', function () {
    before( function (done) {
      var model = new UserModel({
        name: 'Other User',
        deviceID: 'd9q347rhfq87hq7fh'
      });

      model.save( function (err, result) {
        if (err) throw err;
        otherUser = JSON.parse(JSON.stringify(result.toJSON()));
        done();
      });
    });

    it('should add the user to the group and return the group', function (done) {
      request.get('http://localhost:3000/api/v1/groups/' + group._id + '/join/' + otherUser._id, function (res) {
        expect(res).to.exist;
        expect(res.body.people).to.be.an('array');
        expect(res.body.people.length).to.equal(2);
        expect(res.body.people[1]._id).to.equal(otherUser._id);
        done();
      });
    });
  });

  describe('User Leave', function () {
    it('should remove the user from the group and return the group', function (done) {
      request.get('http://localhost:3000/api/v1/groups/' + group._id + '/leave/' + otherUser._id, function (res) {
        expect(res).to.exist;
        expect(res.body.people).to.be.an('array');
        expect(res.body.people.length).to.equal(1);
        expect(res.body.people[0]._id).to.equal(user._id);
        done();
      });
    });
  });

  describe('Last User Leaves', function () {
    it('should delete the group and return an empty object', function (done) {
      request.get('http://localhost:3000/api/v1/groups/' + group._id + '/leave/' + user._id, function (res) {
        expect(res).to.exist;
        expect(res.body).to.be.an('object');
        expect(Object.keys(res.body).length).to.equal(0);
        done();
      });
    });
  });
});

