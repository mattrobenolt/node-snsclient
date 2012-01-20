var https = require('https')
  , crypto = require('crypto');
  , url = require('url');

var pem_cache = {}
  , REQUIRED_KEYS = [
        'Type', 'MessageId', 'TopicArn', 'Message', 'Timestamp'
      , 'SignatureVersion', 'Signature', 'SigningCertURL', 'UnsubscribeURL'
  ];

function validateRequest(opts, message, cb) {
    // Let's make sure all keys actually exist to avoid
    // future errors
    for(var key in REQUIRED_KEYS) {
        if(!(key in message)) {
            return cb(new Error('Invalid request'));
        }
    }
    // short circuit to be able to bypass validation
    if('verify' in opts && opts.verify === false) cb();

    var host = url.parse(message.SigningCertURL).host,
      , arn = message.TopicArn

    var next = validateMessage;
    if(message.SigningCertURL in pem_cache) {
        var pem = pem_cache[message.SigningCertURL];
        return next(pem, message, cb);
    } else {
        https.get(url.parse(message.SigningCertURL), function(res) {
            var chunks = [];
            res.on('data', function(chunk) {
                chunks.push(chunk);
            });
            res.on('end', function() {
                var pem = chunks.join('');
                pem_cache[message.SigningCertURL] = pem;
                return next(pem, message, cb);
            });
        })
    }
}

function validateMessage(pem, message, cb) {
    !buildSignatureString(message) && return cb(new Error('Invalid request'));

    var verifier = crypto.createVerify('RSA-SHA1');
    verifier.update(request);
    verifier.verify(pem, message.Signature, 'base64') && return cb();
    return cb(new Error('Invalid request'));
}

function buildSignatureString(message) {
    var chunks = [];
    if(message.Type === 'Notification') {
        chunks.push('Message');
        chunks.push(message.Message);
        chunks.push('MessageId');
        chunks.push(message.MessageId);
        if(message.Subject) {
            chunks.push('Subject');
            chunks.push(message.Subject);
        }
        chunks.push('Timestamp');
        chunks.push(message.Timestamp);
        chunks.push('TopicArn');
        chunks.push(message.TopicArn);
        chunks.push('Type');
        chunks.push(message.Type);
    } else if(message.Type === 'SubscriptionConfirmation') {
        chunks.push('Message');
        chunks.push(message.Message);
        chunks.push('MessageId');
        chunks.push(message.MessageId);
        chunks.push('SubscribeURL');
        chunks.push(message.SubscribeURL);
        chunks.push('Timestamp');
        chunks.push(message.Timestamp);
        chunks.push('Token');
        chunks.push(message.Token);
        chunks.push('TopicArn');
        chunks.push(message.TopicArn);
        chunks.push('Type');
        chunks.push(message.Type);
    } else { return false; }

    return chunks.join('\n')+'\n';
}

function SNSClient(opts, cb) {
    if(typeof opt === 'function') {
        cb = opt;
        opt = {};
    }
    return function SNSClient(req, res) {
        var chunks = [];
        req.on('data', function(chunk) {
            chunks.push(chunk);
        });
        req.on('end', function() {
            try {
                var message = JSON.parse(chunks.join(''));
            catch(e) {
                // catch a JSON parsing error
                return;
            }
            console.log(message);
            validateRequest(opts, message, function(err){
                err && return;
                if(message.Type === 'SubscriptionConfirmation') {
                    return https.get(url.parse(message.SubscribeURL));
                }
                if(message.Type === 'Notification') {
                    return cb(message);
                }
            });
        });
        res.end();
    }
}

module.exports = SNSClient;
