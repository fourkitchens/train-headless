var express         = require('express'),
    app             = express(),
    traverson       = require('traverson'),
    api             = traverson.json.from('https://api.github.com/');


app.get('/', function(req, res){
  api.newRequest()
    .follow('events_url')
    .withRequestOptions({ headers: { 'User-Agent': 'nodejs' } })
    .getResource(function(err, resource) {
      res.send(resource);
    });
});

app.listen(3000);
