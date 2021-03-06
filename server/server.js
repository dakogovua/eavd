

const express = require('express');
const bodyParser = require("body-parser");


const morgan = require('morgan');

const app = express();

const cors = require('cors');
app.use(cors());





app.set('port', 3000);
const urlencodedParser = bodyParser.urlencoded({extended: false});

  // Listen port 3000 for requests
  app.listen(app.get('port'), () => {
    console.log(`[OK] Server is running on localhost:${app.get('port')}`);
 });

 app.use(express.json());
 //app.use(express.urlencoded({extended: false}));
 app.use(morgan('dev'));

 app.get("/",  function (request, response) {
  if(!request.body) return response.sendStatus(400);
  console.log(request.body);
  response.send(`[OK] Server is running on localhost:${app.get('port')}`);
});

var semclosepost = require('./semaphore/semclose')
app.use('/actions/semclose', semclosepost);

let withdraw =  require('./withdraw/routes');
app.use('/actions/withdraw', withdraw);

let notes =  require('./notes/routes');
app.use('/actions/notes', notes);

var today = require('./timedate/timedate')

app.use(function(err, req, res, next) {
  console.error('err.stack', err.stack);
  let date = today.date();
  let time = today.time();

  resp_mess = {
    type : "error",
    title : `Непонятная ошибка ${err.stack}`,
    table : '',
    text : `[["Что-то пошло не так по состоянию на ${date}, ${time} "]]`,
    class: 'kossfullwidth'
  }
  res.send(JSON.stringify(resp_mess));
  res.end();

  // res.status(500).send('Something broke!');
});

