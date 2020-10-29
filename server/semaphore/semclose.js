var express = require('express');
var semclosepost  = express.Router();
let today = require('../timedate/timedate')
const oracledb = require('oracledb');

const  connect =  require('../oracle/connect');

var connection
var table;

function middleware(){
  return async function(req, res, next){
    connection = await connect.connection();
    next()
  }
}

let  semclose = async() =>{
  // const oracledb = require('oracledb');
  // const  connect =  require('../oracle/connect');
 // let  connection = await connect.connection();
  
 // console.log (connection);


  let semidelete = await connection.execute(`Delete from semaphore 
  where user_name = 'quasar'
  -- semaphore.table_name = ''
  and semaphore.path = 'nodeJS'`);
  
//  console.log('semideletebefore_commit', semidelete)
  let semcommit =  await connection.commit();
//  console.log('after_commit', semidelete, 'semcommit', semcommit)
  

  await connection.close();
}

semclosepost.post('/', middleware(), async (request, response) => {
        try {
          
          var table;

          let date = today.date();
          let time = today.time();

          if (!request.body) return response.sendStatus(400);
          console.log('request.body', request.body);

          table = request.body[1];
          
          let resp_mess = {
            type : "ok",
            title : `Семафор почищен на ${date}, ${time}`,
            table : table,
            text : `[["Семафор почищен. Попробуйте повторить."]]`,
            class: 'ok'
          }
          

          //response.send(JSON.stringify('["Семафор почищен"]'));
          await semclose(table);
          await response.send(JSON.stringify(resp_mess));

        }
        catch (err) {
          console.error('Whoops! semclose');
          console.error(err);
          semclose(table);
          process.exit(1);
        }
        finally {
          let date = today.date();
          let time = today.time();
          console.log('finaly semclose', date, time);
        }

    });


    module.exports = semclosepost;