
var _ = require('underscore');
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
var sns = new AWS.SNS({ apiVersion: '2010-03-31' });

function createEndpoint(deviceToken, callback) {
    var params = {
      PlatformApplicationArn: process.env['SNS_APPLICATION_ARN'],
      Token: deviceToken
    };

    sns.createPlatformEndpoint(params, function (err, data) {
      callback(err, data.EndpointArn);
    });
}

function createTopic(name, callback) {
  sns.createTopic({ Name: name }, function (err, data) {
    if (err) {
      console.error(err);
      return callback();
    }

    callback(data.TopicArn);
  });
}

function subscribe(topicID, pushID) {
  var params = {
    Protocol: 'application',
    TopicArn: topicID,
    Endpoint: pushID
  };

  sns.subscribe(params, function (err, data) {
    if (err) return console.error(err);
  });
}

function unsubscribe(topicID, pushID, nextID) {
  var params = { TopicArn: topicID };
  if (nextID) params.NextToken = nextID;

  sns.listSubscriptionsByTopic(params, function (err, data) {
    if (err) return console.error(err);
    
    var subscription = _.findWhere(data.Subscriptions, { Endpoint: pushID });

    if (!subscription) {
      if (data.NextToken) unsubscribe(topicID, pushID, data.NextToken);
      return;
    }

    sns.unsubscribe({ SubscriptionArn: subscription.SubscriptionArn }, function (err, data) {
      if (err) return console.error(err);
    });
  });
}

function deleteTopic(topicID) {
  sns.deleteTopic({ TopicArn: topicID }, function (err, data) {
    if (err) return console.error(err);
  });
}

function pushMessage(topicID, message) {
  var params = {
    Message: message,
    TopicArn: topicID
  };

  sns.publish(params, function (err, data) {
    if (err) return console.error(err);
  });
}

exports.createEndpoint = createEndpoint;
exports.createTopic = createTopic;
exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;
exports.deleteTopic = deleteTopic;
exports.pushMessage = pushMessage;
