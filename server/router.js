const express = require('express');
const router = express.Router();


const oracledb = require('oracledb');


const configDir = 'D:\\ora client 12 full 64\\client\\bin';
const connstr = '(DESCRIPTION = (ADDRESS_LIST = (ADDRESS = (PROTOCOL = TCP)(HOST = 10.0.100.101)(PORT = 1521)))(CONNECT_DATA = (SID=CD)))';
const config = {
  user: "IMPORT_USER",
  password: "sT7hk9Lm",
  connectString: connstr
};


router.post("/withdraw", async function (request, response) {
  try {
    if (!request.body) return response.sendStatus(400);
    console.log('request.body', date, time, request.body);

    let pool = await oracledb.createPool(config);
    let connection = await oracledb.getConnection()
    let semaphore = false;


    let finOrgan = request.body[0];
    finOrgan = 'Воля'; //For test purposes only
    let table = '';
    //    table = "IMPORT_UPDATE_COMISIYA_2" //For test purposes only
    switch (finOrgan) {
      case 'ЦФР':
        table = "IMPORT_UPDATE_COMISIYA_2"

      case 'Idea':
        table = "IMPORT_UPDATE_COMISIYA_TEMP"
        response.send(`${finOrgan} - ${finOrgan}`);
        break;
      case 'Tas':
        // code block
        break;
      case 'Воля':
        // var sql = "select t.deal_id , t.comment2 from import_update_comisiya_temp t";
        table = 'IMPORT_UPDATE_COMISIYA_TEMP';
        //готовим sql запрос 
        var sql =
          `INSERT INTO ${table} 
                  (ndogovor_id, comment3)
              VALUES  (:1, :2 )`;

        break;
      default:
        response.send(`Locked! - ${finOrgan} что-то не то`);
        await connection.close();
        return;
    }

    let ressemaphore = await connection.execute("select * from semaphore");

    for (const item of ressemaphore.rows) {
      console.log(item.includes(table));
      if (item.includes(table)) {
        semaphore = true;
        response.send(`Locked! - ${date}, ${time} ${item}`);
        await connection.close();
        return; // Stop script
      }
    }

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
    //  , (err, res) => {
    //    if (err) {
    //      console.error('executeMany err is', err);
    //    }
    //    else {
    //      console.log("Res is:", res)
    //      console.log('Semaphore executeMany', semaphore)
    //      response.send(`Всё оке! - ${date}, ${time} `);

    //    }
    //  }
    );
    


    await connection.commit();

    console.log('res', res.rowsAffected);
    
    response.send(`Залило рядков! - ${res.rowsAffected}, ${date}, ${time} `);

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


module.exports = router;