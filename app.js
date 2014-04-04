
var express = require('express');
var http = require('http');
var path = require('path');

var user = require('routes/user');
var group = require('routes/group');

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

app.post('/user', user.create);
app.put('/user/:id', user.update);

app.get('/groups', group.read);
app.post('/groups', group.create);
app.put('/groups/:id/comment', group.comment);
app.put('/groups/:id/join', group.join);
app.put('/groups/:id/leave', group.leave);
app.delete('/groups/:id', group.delete);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
