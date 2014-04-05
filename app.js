
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

app.get('/api/v1/user/:id', user.read);
app.post('/api/v1/user', user.create);
app.put('/api/v1/user/:id', user.update);

app.get('/api/v1/groups', group.read);
app.post('/api/v1/groups', group.create);
//app.put('/api/v1/groups/:id/comment', group.comment);
//app.put(/api/v1'/groups/:id/join', group.join);
//app.put('/api/v1/groups/:id/leave', group.leave);
//app.delete('/api/v1/groups/:id', group.delete);

mongoose.connect('mongodb://localhost/gather', { replset: { socketOptions: { keepAlive: 1 } } });

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
