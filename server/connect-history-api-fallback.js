var url = require('url');

exports = module.exports = function historyApiFallback(options) {
  options = options || {};
  var logger = getLogger(options);

  return function* (next) {
    var req = this.request
    var res = this.response
    var headers = req.headers;
    if (req.method !== 'GET') {
      logger(
        'Not rewriting',
        req.method,
        req.url,
        'because the method is not GET.'
        );
      return yield next;
    } else if (!headers || typeof headers.accept !== 'string') {
      logger(
        'Not rewriting',
        req.method,
        req.url,
        'because the client did not send an HTTP accept header.'
        );
      return yield next;
    } else if (headers.accept.indexOf('application/json') === 0) {
      logger(
        'Not rewriting',
        req.method,
        req.url,
        'because the client prefers JSON.'
        );
      return yield next;
    } else if (!acceptsHtml(headers.accept)) {
      logger(
        'Not rewriting',
        req.method,
        req.url,
        'because the client does not accept HTML.'
        );
      return yield next;
    }

    var parsedUrl = url.parse(req.url);
    var rewriteTarget;

    //重定向到登录页
    if (req.url === '/') {
      req.url = '/login.html';
      return yield next;
    }

    options.rewrites = options.rewrites || [];
    for (var i = 0; i < options.rewrites.length; i++) {
      var rewrite = options.rewrites[i];
      var match = parsedUrl.pathname.match(rewrite.from);
      if (match !== null) {
        rewriteTarget = evaluateRewriteRule(parsedUrl, match, rewrite.to);
        logger('Rewriting', req.method, req.url, 'to', rewriteTarget);
        req.url = rewriteTarget;
        return yield next;
      }
    }

    if (parsedUrl.pathname.indexOf('.') !== -1) {
      logger(
        'Not rewriting',
        req.method,
        req.url,
        'because the path includes a dot (.) character.'
        );
      return yield next;
    }

    rewriteTarget = options.index || '/index.html';
    logger('Rewriting', req.method, req.url, 'to', rewriteTarget);
    req.url = rewriteTarget;
    yield next;
  };
};

function evaluateRewriteRule(parsedUrl, match, rule) {
  if (typeof rule === 'string') {
    return rule;
  } else if (typeof rule !== 'function') {
    throw new Error('Rewrite rule can only be of type string of function.');
  }

  return rule({
    parsedUrl: parsedUrl,
    match: match
  });
}

function acceptsHtml(header) {
  return header.indexOf('text/html') !== -1 || header.indexOf('*/*') !== -1;
}

function getLogger(options) {
  if (options && options.logger) {
    return options.logger;
  } else if (options && options.verbose) {
    return console.log.bind(console);
  }
  return function () { };
}