# hogans

## usage

```js
var render    = require('hogans')
var filePath  = __dirname + '/path/to/template.ext'
var dashboard = render(filePath)

var server = http.createServer(function (req, res) {
     dashboard({title: 'Dashboard'}).once('error', onError).pipe(res)

    function onError (err) {
        res.statusCode = 500
        res.end(err.message)
        console.error(err)
    }
}).listen(3000)
```

## example

```
$ PORT=8080 node example/app &

$ curl -sS -v http://localhost:8080?title=Poo
```

## api

### var render = require('hogans')

### var f = render(templatePath)

### var stream = f(data)

## test

npm test

## author

ishiduca@gmail.com

# license

MIT
