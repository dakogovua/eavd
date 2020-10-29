var express = require('express');
var test = express.Router();
let today = require('../timedate/timedate')
const oracledb = require('oracledb');
//console.log('module', module)

const  connect =  require('../oracle/connect');
//console.log(connect.connection())

var connection
var table;

function middleware(){
  return async function(req, res, next){
    console.log('asdasdasdasd')
    connection = await connect.connection();
    next()
  }
}


test.post('/', middleware(), async (request, response) => {
  try {

    console.log('connection test.post ', connection)
   // return;
    
    let date = today.date();
    let time = today.time();
    
   
    

    const sql_finish_iniversal_checker = `
      BEGIN 
        helper.p_universal_checker(:cursor); 
      END;
    `;

    const result = await connection.execute(
      sql_finish_iniversal_checker,
     {
        cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
     }
    );
    
    const resultSet = result.outBinds.cursor;
    let row;
    let arr=[];
    while ((row = await resultSet.getRow())) {
      console.log('row', row);
      arr.push(row);
    }
    // always close the ResultSet
    await resultSet.close();
    resp_mess = {
      type : "next_end",
      title : `Резултирующая таблица log отзывов. ${date}, ${time}`,
      table: table,
      text : JSON.stringify(arr),
      class: 'kossfullwidth'
    }


    response.send(JSON.stringify(resp_mess));
    response.end();
    
    await connection.close();
    return;
    if (!request.body) return response.sendStatus(400);
    console.log('request.body',  date, time, request.body);
    
  
  // {mailtext} = JSON.stringify(request.body);
    mailOptions.text = 'mailtext test'
    //console.log('mailOptions', mailOptions);
    await mail(mailOptions);
      const result2 = await connection.execute(
        `BEGIN helper.mysemaphore(:cursor); END;`,
       {
          // sal: 6000,
          cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
       }
      );
      
      const resultSet2 = result2.outBinds.cursor;
      let row2;
      let arr2=[];
      while ((row2 = await resultSet2.getRow())) {
        console.log(row2);
        arr.push(row2);
      }
      
      // always close the ResultSet
      await resultSet2.close();

      resp_mess = {
        type : "success",
        title : "ok",
        table: table,
        text : JSON.stringify(arr2)
      }

      response.send(JSON.stringify(resp_mess));
      response.end();

   }
    catch (err) {
      console.error('Whoops! test');
      console.error(err);
      semclose(table);
      process.exit(1);
    }
    finally {
      let date = today.date();
      let time = today.time();
      console.log('finaly test', date, time);
    }

})
  

module.exports = test;
