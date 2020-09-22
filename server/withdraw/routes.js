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

var table;



withdraw.post("/withdraw", async (request, response) => {
  try {
    
    if (!request.body) return response.sendStatus(400);
    console.log('request.body',  date, time, request.body);

    let finOrgan = request.body[0];
   // let sql =``;

    switch (finOrgan) {
      case 'ЦФР':
        table = "IMPORT_UPDATE_COMISIYA_2";
        // sql = `INSERT INTO ${table} 
        //         (ndogovor_id, comment3)
        //   VALUES  (:1, :2 )`;
        break;
      case 'Idea':
        table = "IMPORT_UPDATE_COMISIYA_TEMP";
        // sql = `INSERT INTO ${table} 
        // (ndogovor_id, comment3)
        //   VALUES  (:1, :2 )`;
        break;
      case 'Tas':
        table = "IMPORT_UPDATE_COMISIYA_TEMP";
        // sql = `INSERT INTO ${table} 
        // (ndogovor_id, comment3)
        //   VALUES  (:1, :2 )`;
        break;

      case 'Воля':
        table = 'IMPORT_UPDATE_COMISIYA_TEMP';
        // sql = `INSERT INTO ${table} 
        //           (ndogovor_id, comment3)
        //       VALUES  (:1, :2 )`;
        break;

        case 'Укртелеком':
          table = 'IMPORT_UPDATE_COMISIYA';
          // sql = `INSERT INTO ${table} 
          //         (ndogovor_id, comment3)
          //     VALUES  (:1, :2 )`;
        break;

        case 'Galaxy':
          table = 'import_update_comisiya_temp';
        break;

        default:
          response.send(`Locked! - ${finOrgan} что-то не то`);
          resp_mess = {
            type : "error",
            title : "Locked! - ${finOrgan} что-то не то",
            table : table,
            text : `По состоянию на ${date}, ${time} <br> что-то не то`
          }
          response.send(resp_mess);
    //    await connection.close();
        return;
    }

    let sql = `INSERT INTO ${table} 
      (ndogovor_id, comment3)
     VALUES  (:1, :2 )`;

    // data prepare
    let binds = request.body;
    binds.shift();
    binds.forEach((element) => {
        element.forEach((el, j, theArray) => {
            if (el !== null){
              el=el.replace('\\n', '')
              el = el.trim()
              theArray[j] = el
            }
        });
    });
    
    let ressemaphore = await connection.execute("select * from semaphore");
    for (const item of ressemaphore.rows) { 
      console.log(item.includes(table));
      if (item.includes(table)) {
        resp_mess = {
          type : "error",
          title : "Semaphore заблокирован",
          table : table,
          text : `По состоянию на ${date}, ${time} <br> ${item}`
        }
        response.send(JSON.stringify(resp_mess));
        return; // Stop script
      }
    }
    
    let seminsert = await connection.execute(`INSERT INTO semaphore (table_name, user_name, start_time, path) VALUES ('${table}', 'quasar', '${date} ${time}', 'nodeJS')`);
    await connection.commit();

    const options = {
      batchErrors: true,
    };

    await connection.execute(`Truncate table ${table}`);

    let res = await connection.executeMany(
      sql, binds, options
    );
    
    await connection.commit();

    resp_mess = {
      type : "next_pin",
      title : "Залило рядки",
      table: table,
      text : `По состоянию на ${date}, ${time} <br> 
      Залило рядков - ${res.rowsAffected}`
    }

    // function sleep(ms) {
    //   return new Promise(resolve => setTimeout(resolve, ms));
    // }

    // await sleep(5000);

     
     response.send(resp_mess);
     return; // Stop script

  }
  catch (err) {
    console.error('Whoops! insert 1 ');
    semclose(table);
    console.error(err);
    process.exit(1);
  }
  finally {

    console.log('FINALY1');
  }
});

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

  withdraw.post("/withdraw/pin", async (request, response) => {
    try {
      if (!request.body) return response.sendStatus(400);
      console.log('/withdraw/pin request.body', request.body, date, time);
     
      let finOrgan = request.body[0];
      let table = request.body[1];

      console.log('finOrgan ', finOrgan, 'table ', table);

      let sql_pinator, sql_pin_not_found;
      switch (finOrgan) {
        case 'ЦФР':
          sql_pinator = `
            BEGIN
              DBMS_OUTPUT.ENABLE(NULL);
              helper.p_cfr_All;
            END;`;

            sql_pin_not_found = `
              BEGIN helper.p_cfr_3_not_found(:cursor); 
            END;`;

          break;
        case 'Idea':
          //пробуем пропинить
          sql_pinator = `
            BEGIN
              DBMS_OUTPUT.ENABLE(NULL);
              helper.p_idea_ALL;
            END;
          `;

          sql_pin_not_found = `
          BEGIN helper.p_idea_5_check(:cursor); 
          END;
          `;

          break;
        case 'Tas':
          sql_pinator = `
          BEGIN
            DBMS_OUTPUT.ENABLE(NULL);
            helper.p_tas_All;
          END;`;

          sql_pin_not_found = `
            BEGIN helper.p_tas_not_found(:cursor); 
          END;`;
          break;

          case 'Укртелеком':
            sql_pinator = `
            BEGIN
              DBMS_OUTPUT.ENABLE(NULL);
              helper.p_ukrtelecom_All;
            END;
            `;

            sql_pin_not_found = `
              BEGIN helper.p_ukrtelecom_not_found(:cursor); 
            END;`;

          break;

          case 'Galaxy':
            sql_pinator = `
            BEGIN
              DBMS_OUTPUT.ENABLE(NULL);
              helper.p_galaxy_All;
            END;
            `;

            sql_pin_not_found = `
              BEGIN helper.p_galaxy_3_not_found(:cursor); 
            END;`;

          break;

        case 'Воля':
          console.log('case ВОЛЯ')
          sql_pinator = `
            BEGIN
              DBMS_OUTPUT.ENABLE(NULL);
              helper.p_volia_fake_pin;
            END;`;

            sql_pin_not_found  = `
            BEGIN helper.p_volia_check(:cursor); END;
            `;

          break;
          
          default:
            //response.send(`Nxt Locked! - ${finOrgan} что-то не то`);
            resp_mess = {
              type : "error",
              title : `Непонятная ошибка ${finOrgan}, ${table}`,
              table : table,
              text : `Что-то пошло не так по состоянию на ${date}, ${time} `
            }
            response.send(JSON.stringify(resp_mess));
            response.end();
            semclose(table);
          return;
      }

  
    sql_pinatorres = await connection.execute(sql_pinator); // эта штука делает пинование и возвращает результат


      let result;
      let DBMS_OUTPUT = 'err';
      let i = 0
      do {
        //получаем результат
        result = await connection.execute(
          `BEGIN
             DBMS_OUTPUT.GET_LINE(:ln, :st);
           END;`,
          { ln: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767 },
            st: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } });
        
          console.log('result.outBinds.ln', 'st', result.outBinds.st , 'ln', result.outBinds.ln);
            if (result.outBinds.st === 0){
              DBMS_OUTPUT = result.outBinds.ln;           
            }

      } while (result.outBinds.st === 0);
      
      console.log('DBMS_OUTPUT', DBMS_OUTPUT)

      if  (DBMS_OUTPUT != 0){
        // выдает список того что не пропинилось, выводим что не удалось
        const result = await connection.execute(
          sql_pin_not_found,
            {
                cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
            }
          );

        const resultSet = result.outBinds.cursor;
        let row;
        let arr=[];
          while ((row = await resultSet.getRow())) {
            console.log(row);
            arr.push(row);
          }
        
        // always close the ResultSet
        await resultSet.close();

        resp_mess = {
          type : "next_check",
          title : "Not found",
          table: finOrgan,
          text : JSON.stringify(arr)
        }

      }

      if  (DBMS_OUTPUT == 0){
        //отправляем сообщение, что всё оке. 

        resp_mess = {
                type : "next_check",
                title : `Всё пропинилось, на ${date}, ${time}`,
                table : finOrgan,
                text : `Нажмите OK чтобы отозвать`
              }
      }

      
      response.send(JSON.stringify(resp_mess));

  semclose(table);

    }
    catch (err) {
      console.error('Whoops PIN!');
      console.error(err);
      process.exit(1);
    }
    finally {
  
      console.log('FINALY pin');
    }

});

withdraw.post("/withdraw/check", async (request, response) => {
  try {

    if (!request.body) return response.sendStatus(400);
    console.log('request.body check', request.body, date, time);

    let finOrgan = request.body[0];

    switch (finOrgan) {
      case 'ЦФР':
        sql_check = `
          BEGIN
           helper.p_cfr_4_check(:cursor); 
          END;`;
        break;

      case 'Idea':
        sql_check =  `
        BEGIN 
          helper.p_idea_5_check(:cursor); 
        END;`;
        break;

      case 'Tas':
        sql_check =  `
        BEGIN 
          helper.p_tas_5_check(:cursor); 
        END;`;
        break;

        case 'Укртелеком':
          sql_check =  `
          BEGIN helper.p_ukrtelecom_4_sel(:cursor); 
          END;`;
          break;

        case 'Galaxy':
          sql_check =  `
           BEGIN helper.p_galaxy_4_check(:cursor); 
          END;`;
        break;

      case 'Воля':
        sql_check =  `
        BEGIN 
          helper.p_volia_check(:cursor); 
        END;`;
        break;

        default:
          //response.send(`Nxt Locked! - ${finOrgan} что-то не то`);
          resp_mess = {
            type : "error",
            title : `Check. Непонятная ошибка ${finOrgan}, ${table}`,
            table : table,
            text : `Что-то пошло не так по состоянию на ${date}, ${time} `
          }
          response.send(JSON.stringify(resp_mess));
          response.end();
          semclose(table);
        return;
    }

    const result = await connection.execute(
      sql_check,
     {
        cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
     }
    );
    
    const resultSet = result.outBinds.cursor;
    let row;
    let arr=[];
    while ((row = await resultSet.getRow())) {
      console.log(row);
      arr.push(row);
    }
    
    // always close the ResultSet
    await resultSet.close();

    resp_mess = {
      type : "next_finish",
      title : `Проверьте данные перед отзывом в ${date}, ${time}`,
      table: finOrgan,
      text : JSON.stringify(arr)
    }


    response.send(JSON.stringify(resp_mess));
    response.end();

  }
  catch (err) {
    console.error('Whoops! check');
    console.error(err);
    semclose(table);
    process.exit(1);
  }
  finally {

    console.log('finaly check');
  }

})
//////////////////////////// FINISH
withdraw.post("/withdraw/finish", async (request, response) => {
  try {

    if (!request.body) return response.sendStatus(400);
    console.log('request.body', request.body, date, time);

    let finOrgan = request.body[0];
    let sql_withdraw;

    switch (finOrgan) {
      case 'ЦФР':
        sql_withdraw = `
          BEGIN
           helper.p_cfr_4_check(:cursor); 
          END;`;
        break;

      case 'Idea':
        sql_withdraw =  `
        BEGIN 
          helper.p_idea_6_withdraw; 
        END;`;
        break;

      case 'Укртелеком':
        sql_withdraw =  `
          BEGIN 
            helper.p_ukrtelecom_6_packet_withdraw; 
          END;`;
        break;

        case 'Galaxy':
          sql_withdraw =  `
            BEGIN 
              helper.p_galaxy_5_package_withdraw; 
            END;`;
          break;

      case 'Tas':
        sql_withdraw =  `
        BEGIN 
          helper.p_tas_6_withdraw; 
        END;`;
        break;

      case 'Воля':
        sql_withdraw =  `
        BEGIN 
          helper.p_volia_withdraw;
        END;`;
        break;
        
        default:
          //response.send(`Nxt Locked! - ${finOrgan} что-то не то`);
          resp_mess = {
            type : "error",
            title : `Check. Непонятная ошибка ${finOrgan}, ${table}`,
            table : table,
            text : `Что-то пошло не так по состоянию на ${date}, ${time} `
          }
          semclose(table);
        return;
    }
    //запускаем отзыватор
      let res_sql_withdraw = await connection.execute(
        sql_withdraw
      );
    //await connection.commit();

    //После отзыва показываем лог отзывов
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
      console.log(row);
      arr.push(row);
    }
    // always close the ResultSet
    await resultSet.close();
    resp_mess = {
      type : "next_end",
      title : `Резултирующая таблица log отзывов. ${date}, ${time}`,
      table: finOrgan,
      text : JSON.stringify(arr)
    }


    response.send(JSON.stringify(resp_mess));
    response.end();
  }
  catch (err) {
    console.error('Whoops! finish');
    console.error(err);
    semclose(table);
    process.exit(1);
  }
  finally {

    console.log('finaly finish');
  }

})


//////////////////////TEST
withdraw.post("/withdraw/test", async (request, response) => {
  try {
    console.log('/withdraw/test');
    if (!request.body) return response.sendStatus(400);
    console.log('request.body',  date, time, request.body);

      const result = await connection.execute(
        `BEGIN helper.mysemaphore(:cursor); END;`,
       {
          // sal: 6000,
          cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
       }
      );
      
      const resultSet = result.outBinds.cursor;
      let row;
      let arr=[];
      while ((row = await resultSet.getRow())) {
        console.log(row);
        arr.push(row);
      }
      
      // always close the ResultSet
      await resultSet.close();

      resp_mess = {
        type : "success",
        title : "ok",
        table: "",
        text : JSON.stringify(arr)
      }

      response.send(JSON.stringify(resp_mess));
      response.end();

  }
  catch (err) {
    console.error('Whoops!');
    console.error(err);
    semclose(table);
    process.exit(1);
  }
  finally {

    console.log('finaly test');
  }
});


withdraw.post("/withdraw/semclose", async (request, response) => {
  try {

    if (!request.body) return response.sendStatus(400);
    console.log('request.body', request.body);

    table = request.body[1];
    semclose(table);
  
  }
  catch (err) {
    console.error('Whoops!');
    console.error(err);
    semclose(table);
    process.exit(1);
  }
  finally {
    console.log('finaly semclose');
  }
});
  

module.exports = withdraw;


/*
if(request.body[0] == 'GoNext'){
     // let ressql_pinator = await connection.execute(sql_pinator);
      
      console.log('GoNext request.body', date, time, request.body, sql_pinator);
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
  
//  console.log('semideletebefore_commit', semidelete)
  let semcommit =  await connection.commit();
//  console.log('after_commit', semidelete, 'semcommit', semcommit)
  

 // await connection.close();
}