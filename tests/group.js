
var request = require('superagent');
var expect = require('expect.js');
var mongoose = require('mongoose');
var UserModel = require('../models/user');

describe('Groups', function () {
  var user;

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
      console.log(err);
      mongoose.disconnect( function () {
        done();
      });
    });
  });

  describe('POST', function () {
    it('should create and return an new group', function (done) {
      var group = {
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
        expect(res.body.owner).to.equal(user._id);
        expect(res.body.people).to.be.an('array');
        expect(res.body.people[0]).to.equal(user._id);
        expect(res.body.comments).to.be.an('array');
        expect(res.body.coordinate).to.be.an('array');
        expect(res.body.coordinate.length).to.equal(2);
        expect(res.body.coordinate[0]).to.equal(group.latitude);
        expect(res.body.coordinate[1]).to.equal(group.longitude);
        done();
      });
    });
  });

  describe('GET', function () {
    it('should return all groups in a bounding box', function (done) {
      request.get('http://localhost:3000/api/v1/groups?latitude=41.15843&longitude=-70.05977&radius=.5', function (res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.not.equal(0);
        console.log(res.body);
        done();
      });
    });
  });
});
