[![build status](https://secure.travis-ci.org/mattrobenolt/node-snsclient.png)](http://travis-ci.org/mattrobenolt/node-snsclient)
# Amazon AWS SNS (Simple Notification Service) http(s) endpoint
## Installation
```
$ npm install aws-snsclient
```

## Basic Usage
```javascript
var http = require('http')
  , SNSClient = require('aws-snsclient');

var client = SNSClient(function(message) {
    console.log(message);
});

http.createServer(function(req, res) {
    if(req.method === 'POST' && req.url === '/receive') {
        return client(req, res);
    }
    res.writeHead(404);
    res.end('Not found.');
}).listen(9000);
```
Your client only needs to accept one callback, which accepts an object of the decoded message sent from the SNS topic.

`message` is the raw JSON. You'll probably want access to: `message.Message` to get the actual message that you sent.

## Confirmation Requests

The initial confirmation request sent out by Amazon is automatically confirmed at the same endpoint. No additional effort needed.

## Request Verification

Signatures are automatically verified, but we can optionally verify the correct account id, region, and topics.

### Ignore signature verification (recommended for debugging only)
```javascript
var auth = {
    verify: false
};
var client = SNSClient(auth, function(message) {
    console.log(message);
});
```

### Verify all credentials
```javascript
var auth = {
    region: 'us-east-1'
  , account: 'xxx'
  , topic: 'xxx'
};
var client = SNSClient(auth, function(message) {
    console.log(message);
});
```

## Use with Express
```javascript
var express = require('express')
  , app = express.createServer()
  , SNSClient = require('aws-snsclient');

var auth = {
    region: 'us-east-1'
  , account: 'xxx'
  , topic: 'xxx'
}
var client = SNSClient(auth, function(message) {
    console.log(message);
});

app.post('/receive', client);

app.listen(9000);
```