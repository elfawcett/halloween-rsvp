
/**
 * Development hosting server
 */

var
  express = require('express')
, http    = require('http')
, path    = require('path')
;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.logger('dev'));
  app.use(express.static(path.join(__dirname, 'src')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
