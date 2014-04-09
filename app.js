
if (process.env.NODETIME_ACCOUNT_KEY) {
    require('nodetime').profile({
          accountKey: process.env.NODETIME_ACCOUNT_KEY,
          appName: 'Gather'
        });
}

var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');

var user = require('./routes/user');
var group = require('./routes/group');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.use( function (err, res, req, next) {
  if (!err) return next();
  console.error(err.message);
  console.error(err.stack);
  
  res.send(500, err.message);
});

app.get('/api/v1/user/:id', user.read);
app.post('/api/v1/user', user.create);
app.put('/api/v1/user/:id', user.update);
app.post('/api/v1/user/:id/register', user.register);

app.get('/api/v1/groups', group.read);
app.post('/api/v1/groups', group.create);
app.post('/api/v1/groups/:id/comment', group.comment);
app.get('/api/v1/groups/:id/join/:userID', group.join);
app.get('/api/v1/groups/:id/leave/:userID', group.leave);

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/gather', { replset: { socketOptions: { keepAlive: 1 } } });

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
