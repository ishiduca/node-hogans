'use strict'
var http      = require('http')
var url       = require('url')
var render    = require('../index')
var dashboard = render(__dirname + '/dashboard.html')

var port = process.env.PORT || 3000

http.createServer(function (req, res) {
    dashboard(url.parse(req.url, !0).query).once('error', onError).pipe(res)

    function onError (err) {
        res.statusCode = 500
        res.end(String(err))
        console.error(err)
    }
}).listen(port, onListen)

function onListen () {
    console.log('[server start to listen on port %s]', port)
    console.log('[process.pid]', process.pid)
}
