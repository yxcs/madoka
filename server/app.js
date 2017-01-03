var koa = require('koa')
var serve = require('koa-static')
var helmet = require('koa-helmet')
var logger = require('koa-logger')
var compress = require('koa-compress')
var staticCache = require('koa-static-cache')

var pkg = require('../package.json')
var history = require('./connect-history-api-fallback')

var option = process.env.NODE_ENV === 'production' ? {
  maxAge: 1 * 60 * 60 * 24 * 30,
  gzip: true,
} : null

var app = koa()

var port = process.env.PORT || pkg.config.port;
app.use(helmet.frameguard('deny'))
app.use(helmet.hidePoweredBy({ setTo: 'Madoka 2.3.3' }))
app.use(helmet.noSniff())
app.use(history({
  logger: console.log.bind(console)
}))
app.use(logger())
app.use(staticCache(pkg.paths.dist.base, option))

app.listen(port, function () {
  console.log('listening on port ' + port);
});


