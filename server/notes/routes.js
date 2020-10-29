//import Express from "express";

const express = require('express');
const notes = express.Router();


// var mail = require('../mail/mailconfig');
const e = require('express');
//const Mail = require('nodemailer/lib/mailer');

// var mailOptions = {
//   from: 'k.konstantynov@eadr.com.ua',
//   to: 'k.konstantynov@eadr.com.ua',
//   subject: 'Sending Email using Node.js',
//   text: 'That was easy!'
// };

 const oracledb = require('oracledb');


// 1 - Insert data to table
var insert = require('./insert')
notes.use('/', insert)

// 2 - PINing
// let pin = require('./pin');
// notes.use("/pin", pin)

// 2 - CHECKing
var select = require('./select')
notes.use("/select",select)

var check = require('./check')
notes.use("/check", check)

var finish = require('./finish')
notes.use("/finish", finish)



// 3 - FINISHing
// let finish = require('./finish')
// notes.use("/finish", finish)


// let today = require('../timedate/timedate')
// notes.post("/semclose", async (request, response) => {
//   try {
    
//     var table;

//     let date = today.date();
//     let time = today.time();

//     if (!request.body) return response.sendStatus(400);
//     console.log('request.body', request.body);

//     table = request.body[1];
    
//     let resp_mess = {
//       type : "ok",
//       title : `Семафор почищен на ${date}, ${time}`,
//       table : table,
//       text : `[["Семафор почищен. Попробуйте повторить."]]`,
//       class: 'ok'
//     }
     

//     //response.send(JSON.stringify('["Семафор почищен"]'));
//     await semclose(table);
//     await response.send(JSON.stringify(resp_mess));

//   }
//   catch (err) {
//     console.error('Whoops! semclose');
//     console.error(err);
//     semclose(table);
//     process.exit(1);
//   }
//   finally {
//     let date = today.date();
//     let time = today.time();
//     console.log('finaly semclose', date, time);
//   }
// });

// let  semclose = async() =>{
//   const oracledb = require('oracledb');
//   const  connect =  require('../oracle/connect');
  


//   let  connection = await connect.connection();
  
//   console.log (connection);


//   let semidelete = await connection.execute(`Delete from semaphore 
//   where user_name = 'quasar'
//   -- semaphore.table_name = ''
//   and semaphore.path = 'nodeJS'`);
  
// //  console.log('semideletebefore_commit', semidelete)
//   let semcommit =  await connection.commit();
// //  console.log('after_commit', semidelete, 'semcommit', semcommit)
  

//   await connection.close();
// }

// var test = require('./test');
// notes.use('/test', test);


module.exports = notes;