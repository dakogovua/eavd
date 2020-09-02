var today = new Date();
global.date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
global.time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

const express = require('express');
const bodyParser = require("body-parser");


const morgan = require('morgan');

const app = express();

const cors = require('cors');
app.use(cors());

let withdraw =  require('./withdraw');



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



app.use('/actions', withdraw);
