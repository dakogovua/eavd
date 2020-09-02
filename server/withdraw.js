const express = require('express');
const withdraw = express.Router();


const oracledb = require('oracledb');


const configDir = 'D:\\ora client 12 full 64\\client\\bin';
const connstr = '(DESCRIPTION = (ADDRESS_LIST = (ADDRESS = (PROTOCOL = TCP)(HOST = 10.0.100.101)(PORT = 1521)))(CONNECT_DATA = (SID=CD)))';
const config = {
  user: "IMPORT_USER",
  password: "sT7hk9Lm",
  connectString: connstr
};

var pool;
var connection;

(async () => {
   pool = await oracledb.createPool(config);
   connection = await oracledb.getConnection()
})();


withdraw.post("/withdraw", async (request, response) => {
  try {
    if (!request.body) return response.sendStatus(400);
    console.log('request.body', connection, date, time, request.body);

    let resp_mess = {
      type : "",
      title : "",
      text : ""
    }

    let semaphore = false;

    let finOrgan = request.body[0];
    finOrgan = 'Воля'; //For test purposes only
    let table = '';
    let sql =``;
    let sql2 =``;
    let sql3 =``;
    //    table = "IMPORT_UPDATE_COMISIYA_2" //For test purposes only
    switch (finOrgan) {
      case 'ЦФР':
        table = "IMPORT_UPDATE_COMISIYA_2"

      case 'Idea':
        table = "IMPORT_UPDATE_COMISIYA_TEMP"
        sql = `INSERT INTO ${table} 
                  (ndogovor_id, comment3)
              VALUES  (:1, :2 )`;

        sql2=`
          select distinct --i.comment1, 
          substr(c.d_number, 1, 20),
          t.stop,
          t.debt_rest,
          i.comment3 REASON, --
          t.business_n,
          t.last_result_id,
          (select r.name
            from suvd.results r
            where r.id = t.last_result_id) res,
          t.debt_dogovor_n,
          substr(cr.name, 1, 20),
          t.creditor_id,
          t.dogovor_id,
          t.archive_flag,
          d.deal_extref,
          t.rs_n,
          c.stop_date
          from suvd.projects               t,
          import_user.Import_Update_Comisiya_Temp i,
          eadr.deal_ext               d,
          suvd.creditor_dogovors      c,
          suvd.creditors              cr
          where cr.id = t.creditor_id
          and ltrim(replace(t.debt_dogovor_n, ' '),0) = ltrim(replace(i.ndogovor_id, ' '),0)
          and t.business_n = d.deal_id
          and c.id = t.dogovor_id
          -- and nvl(c.stop_date, sysdate) > sysdate - 30          
          and c.d_number like '%КАБЕЛЬ%'
          and t.last_result_id <> 1878 --    
          ; --

        `;

        sql3 = `
        `;
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

    let ressemaphore = await connection.execute("select * from semaphore");
    for (const item of ressemaphore.rows) { 
      console.log(item.includes(table));
      if (item.includes(table)) {
        semaphore = true;
        resp_mess = {
          type : "error",
          title : "Semaphore заблокирован",
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


    let binds = request.body;
    binds.shift();
    
    const options = {
      //autoCommit: true,
      batchErrors: true,
      // bindDefs: [
      //   { type: oracledb.DB_TYPE_VARCHAR, maxSize: 20 },
      //   { type: oracledb.DB_TYPE_VARCHAR, maxSize: 20 }
      // ]
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
      text : `По состоянию на ${date}, ${time} <br> 
      Залило рядков - ${res.rowsAffected}`
    }
    
    response.send(resp_mess);
    
    // function sleep(ms) {
    //   return new Promise(resolve => setTimeout(resolve, ms));
    // }

    // await sleep(5000);


    
    
    let semidelete = await connection.execute(`Delete from semaphore 
    where semaphore.table_name = '${table}'
    and semaphore.path = 'nodeJS'`);
    
    await connection.commit();

    await connection.close();

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


module.exports = withdraw;