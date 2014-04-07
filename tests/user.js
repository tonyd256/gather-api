
var request = require('superagent');
var expect = require('expect.js');
var mongoose = require('mongoose');
var UserModel = require('../models/user');

describe('User', function () {
  var user;

  before( function (done) {
    mongoose.connect('mongodb://localhost/gather');
    user = {
      name: 'Test User',
      deviceID: 'herf74ho38fgo48g3478t'
    };
    done();
  });
  
  after( function (done) {
    UserModel.remove({ _id: user._id }, function (err) {
      if (err) console.log(err);
      mongoose.disconnect( function () {
        done();
      });
    });
  });

  describe('POST', function () {
    it('should create and return a user', function (done) {
      request.post('http://localhost:3000/api/v1/user')
      .send(user)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .end(function (err, res) {
        if (err) throw err;

        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.body).to.exist;
        expect(res.body._id).to.exist;
        expect(res.body.name).to.equal(user.name);
        expect(res.body.deviceID).to.equal(user.deviceID);
        expect(res.body.pushEnabled).to.equal(false);
        user = res.body;
        done();
      });
    });
  });

  describe('PUT', function () {
    it('should update and return a user', function (done) {
      request.put('http://localhost:3000/api/v1/user/' + user._id)
      .send({ name: 'Test 2' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .end( function (err, res) {
        if (err) throw err;

        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.body).to.exist;
        expect(res.body.name).to.equal('Test 2');
        done();
      });
    });
  });

  describe('GET', function () {
    it('should return a user with a given deviceID', function (done) {
      request.get('http://localhost:3000/api/v1/user/' + user.deviceID, function (res) {
        expect(res).to.exist;
        expect(res.status).to.equal(200);
        expect(res.body._id).to.equal(user._id);
        done();
      });
    });
  });
});

