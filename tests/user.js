
var request = require('superagent');
var expect = require('expect.js');

describe('POST User', function () {
  it('should create and return a user', function (done) {
    var user = {
      name: 'Test User',
      deviceID: 'herf74ho38fgo48g3478t'
    };

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
      done();
    });
  });
});

