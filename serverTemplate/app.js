// REQUIRE MODULES
const express =     require('express');
const http =        require('http');
const path =        require('path');
const favicon =     require('serve-favicon');
const morgan =      require('morgan');
const cors =        require('cors');
const cookieParser = require('cookie-parser');
const bodyParser =  require('body-parser');
const app =         express();
const server      = http.createServer(app);
const port        = parseInt(process.env.PORT || 3000);
const message =     require('./api/message');



app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cors({origin: true}))

// ADD (MOUNT) YOUR MIDDLEWARE (ROUTES) HERE
app.use('/api/v1/message', message);

app.use(notFound)
app.use(errorHandler)

server.listen(port)
  .on('error', console.error.bind(console))
  .on('listening', console.log.bind(console, 'Listening on ' + port));

function notFound(req, res, next) {
  res.status(404)
    .send({error: 'Url not found', status: 404, url: req.url})
}

function errorHandler(err, req, res, next) {
  console.error('ERROR', err)
  res.status(500)
    .send({error: err, url: req.url, status: 500})
}
module.exports = app;
