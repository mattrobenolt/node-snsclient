var http = require('http')
  , SNSClient = require('../');

var auth = {
    region: 'us-east-1'
  , account: 'xxx'
  , topic: 'xxx'
}
var client = SNSClient(auth, function(err, message) {
    if (err) {
        throw err;
    }
    console.log(message);
});

http.createServer(function(req, res) {
    if(req.method === 'POST' && req.url === '/receive') {
        return client(req, res);
    }
    res.writeHead(404);
    res.end('Not found.');
}).listen(~~process.argv[2] || 9000);
