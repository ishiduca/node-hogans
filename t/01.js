'use strict'
var path     = require('path')
var http     = require('http')
var test     = require('tape')
var through  = require('through2')
var render   = require('../')

var html = path.join(__dirname, 'template.html')
var port = 3001

test('var stream = render(templatePath)(params)', function (t) {
    var temp = render(html)
    var rend = temp({title: 'FOO'})

    rend.once('data', function (data) {
        t.ok(/<h1>FOO<\/h1>/.test(data), data)
        t.end()
    }).once('error', console.error.bind(console))
})

test('render(t)(p).pipe(response)', function (t) {
    var temp = render(html)
    var rend = temp({title: 'FOO'})
    var ws   = through.obj()
    ws.headers = {}
    ws.setHeader = function (key, val) {
        this.headers[key] = val
    }

    ws.once('finish', function () {
        t.ok(ws._readableState.buffer, String(ws._readableState.buffer))
        t.is(ws.statusCode, 200, 'statusCode === 200')
        t.is(ws.headers['content-type'], 'text/html; charset=utf-8'
          , 'ws.headers["content-type"] === "text/html; charset=utf-8"')
        t.is(ws.headers['content-length'], 28
          , 'ws.headers["content-length"] === 28')
        t.end()
    })

    rend.pipe(ws)
})

test('serve', function (t) {
    var temp = render(html)
    var server = http.createServer(function (req, res) {
        temp({title: 'FOO'}).pipe(res)
    })
    .listen(port, function () {
        http.get('http://localhost:' + port, function (res) {
            var b = ''
            res.on('data', function (c) { b += c })
            res.once('end', function () {
                t.is(res.statusCode, 200, 'res.statusCode === 200')
                t.is(res.headers['content-type'], 'text/html; charset=utf-8'
                  , 'res.headers["content-type"] === "text/html; charset=utf-8"')
                t.is(Number(res.headers['content-length']), 28
                  , 'res.headers["content-length"] === 28')
                t.ok(/<h1>FOO<\/h1>/.test(b), String(b))
                t.end()
                server.close()
            })
        })
    })
})
