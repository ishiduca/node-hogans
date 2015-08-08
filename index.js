var fs      = require('fs')
var hogan   = require('hogan.js')
var through = require('through2')
var mime    = require('mime')

module.exports = function (filePath) {
    return function (params) {
        var contentType = mime.lookup(filePath) + '; charset=utf-8'
        var buf         = []
        var statusCode  = 200
        var headers     = {}

        var ws  = through.obj(function (chnk, enc, done) {
            buf.push(chnk)
            done()
        }, function (done) {
            var raw = Buffer.isBuffer(buf[0]) ? String(Buffer.concat(buf)) : buf.join('')
            var body
            try {
                body = hogan.compile(raw).render(params)
            } catch (err) {
                return done(err)
            }

            headers['content-type']   = contentType
            headers['content-length'] = Buffer.byteLength(body)

            if (this.dst) {
                this.dst.statusCode = statusCode
                if (this.dst.setHeader) {
                    for (var p in headers) {
                        if (headers.hasOwnProperty(p)) this.dst.setHeader(p, headers[p])
                    }
                }
            }

            this.push(body)
            done()
        })

        var ctor = through.ctor()
        ws.pipe = function (response) {
            this.dst = response
            ctor.prototype.pipe.apply(this, arguments)
        }

        return fs.createReadStream(filePath).once('error', onError).pipe(ws)

        function onError (err) { ws.emit('error', err) }
    }
}
