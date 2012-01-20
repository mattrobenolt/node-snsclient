var express = require('express')
  , app = express.createServer()
  , SNSClient = require('../');

var auth = {
    region: 'us-east-1'
  , account: 'xxx'
  , topic: 'topic-name'
}
var client = SNSClient(auth, function(message) {
    console.log(message);
});

app.post('/receive', client);

app.listen(~~process.argv[2] || 9000);
