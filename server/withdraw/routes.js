const express = require('express');
const withdraw = express.Router();


const oracledb = require('oracledb');

var mail = require('../mail');
const e = require('express');
//const Mail = require('nodemailer/lib/mailer');

var mailOptions = {
  from: 'k.konstantynov@eadr.com.ua',
  to: 'k.konstantynov@eadr.com.ua',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};


const configDir = 'D:\\ora client 12 full 64\\client\\bin';
const connstr = '(DESCRIPTION = (ADDRESS_LIST = (ADDRESS = (PROTOCOL = TCP)(HOST = 10.0.100.101)(PORT = 1521)))(CONNECT_DATA = (SID=CD)))';
const config = {
  user: "IMPORT_USER",
  password: "sT7hk9Lm",
  connectString: connstr
};

//Коннектимся к бд.
var pool;
var connection;
(async () => {
   pool = await oracledb.createPool(config);
   connection = await oracledb.getConnection()
})();

  var resp_mess = {
      type : "",
      title : "",
      table: "",
      text : ""
    }


withdraw.post("/withdraw", async (request, response) => {
  try {
    
    if (!request.body) return response.sendStatus(400);
    console.log('request.body',  date, time, request.body);

    // let semaphore = false;

    let finOrgan = request.body[0];
    // finOrgan = 'Воля'; //For test purposes only
    let table = '';
    let sql =``;

    //    table = "IMPORT_UPDATE_COMISIYA_2" //For test purposes only
    switch (finOrgan) {
      case 'ЦФР':
        table = "IMPORT_UPDATE_COMISIYA_2";
        break;
      case 'Idea':
        table = "IMPORT_UPDATE_COMISIYA_TEMP"
        break;
      case 'Tas':
        // code block
        break;
      case 'Воля':
        // var sql = "select t.deal_id , t.comment2 from import_update_comisiya_temp t";
        table = 'IMPORT_UPDATE_COMISIYA_TEMP';
        //готовим sql запрос 
        sql = `INSERT INTO ${table} 
                  (ndogovor_id, comment3)
              VALUES  (:1, :2 )`;
        break;
        
        default:
          response.send(`Locked! - ${finOrgan} что-то не то`);
          await connection.close();
        return;
    }

    
    
    // data prepare
    let binds = request.body;
    binds.shift();
    binds.forEach((element) => {
        // console.log('i',i);

        element.forEach((el, j, theArray) => {
            el=el.replace('\\n', '')
            el = el.trim()
            theArray[j] = el
           // console.log('el', el, 'i', i, 'j', j)
        });
    });

    // console.log('binds', binds)
    
    let ressemaphore = await connection.execute("select * from semaphore");
    for (const item of ressemaphore.rows) { 
      console.log(item.includes(table));
      if (item.includes(table)) {
        // semaphore = true;
        resp_mess = {
          type : "error",
          title : "Semaphore заблокирован",
          table : table,
          text : `По состоянию на ${date}, ${time} <br> ${item}`
        }
       // console.log('response', response)
        //response.send(`Locked! - ${date}, ${time} ${item}`);
        response.send(JSON.stringify(resp_mess));
        await connection.close();
        return; // Stop script
      }
    }
    
    let seminsert = await connection.execute(`INSERT INTO semaphore (table_name, user_name, start_time, path) VALUES ('${table}', 'quasar', '${date} ${time}', 'nodeJS')`);
    await connection.commit();
    
   // return; //Stop
    
    const options = {
      //autoCommit: true,
      batchErrors: true,
    };

    await connection.execute(`Truncate table ${table}`);

    let res = await connection.executeMany(
      sql, binds, options
    );
    
    await connection.commit();

    // console.log('res', res.rowsAffected);
    
    resp_mess = {
      type : "success",
      title : "Залило рядков:",
      table: table,
      text : `По состоянию на ${date}, ${time} <br> 
      Залило рядков - ${res.rowsAffected}`
    }
    
    response.send(resp_mess);
    
    // function sleep(ms) {
    //   return new Promise(resolve => setTimeout(resolve, ms));
    // }

    // await sleep(5000);

    

    // await connection.close();

  }
  catch (err) {
    console.error('Whoops!');
    console.error(err);
    process.exit(1);
  }
  finally {

    console.log('FINALY');
  }
});

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

  withdraw.post("/withdraw/next", async (request, response) => {
    try {
      if (!request.body) return response.sendStatus(400);
      console.log('request.body', request.body);
      let finOrgan = request.body[0];

      let table = request.body[1];

      console.log('finOrgan', finOrgan, 'table', table);

      let sql2;
      switch (finOrgan) {
        case 'ЦФР':
          sql2 = ``;
          break;
        case 'Idea':
          sql2 = `
          BEGIN
            helper.idea_2_pin;
          END;
          `;
          break;
        case 'Tas':
          sql2 = ``;
          break;
        case 'Воля':
          sql2 = `
            BEGIN
              helper.volia_2_pin;
            END;`;
          break;
          
          default:
            //response.send(`Nxt Locked! - ${finOrgan} что-то не то`);

            resp_mess = {
              type : "error",
              title : `Непонятная ошибка ${finOrgan}, ${table}`,
              table : table,
              text : `Что-то пошло не так по состоянию на ${date}, ${time} `
            }
            
            semclose(table);
            
          return;
      }

      sql2res = await connection.execute(sql2);
      console.log('sql2res', sql2res);

      semclose(table);

    }
    catch (err) {
      console.error('Whoops!');
      console.error(err);
      process.exit(1);
    }
    finally {
  
      console.log('FINALY next');
    }

});



module.exports = withdraw;


/*
if(request.body[0] == 'GoNext'){
     // let ressql2 = await connection.execute(sql2);
      
      console.log('GoNext request.body', date, time, request.body, sql2);
      resp_mess = {
        type : "error",
        title : "Вам нужно связаться с пользователем, кто блокирует работу",
        text : `Актуально на ${date}, ${time} `
      }
     // console.log('response', response)
      //response.send(`Locked! - ${date}, ${time} ${item}`);
      response.send(JSON.stringify(resp_mess));
      return;
    }



        {mailtext} = JSON.stringify(request.body);
    mailOptions.text = mailtext
    //console.log('mailOptions', mailOptions);
    await mail(mailOptions);
    return;

*/

const  semclose = async(table) =>{
  let semidelete = await connection.execute(`Delete from semaphore 
  where semaphore.table_name = '${table}'
  and semaphore.path = 'nodeJS'`);
  
  console.log('semideletebefore_commit', semidelete)
let semcommit =  await connection.commit();
  console.log('after_commit', semidelete, 'semcommit', semcommit)
  

  await connection.close();
}