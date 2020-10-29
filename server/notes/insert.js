var express = require('express');
var insert = express.Router();
let today = require('../timedate/timedate')
const oracledb = require('oracledb');

const  connect =  require('../oracle/connect');

let semclose = require('../semaphore/semclose');

var connection
var table;

function middleware(){
  return async function(req, res, next){
    connection = await connect.connection();
    next()
  }
}


insert.post('/', middleware(), async (request, response) => {
    try {
        let date = today.date();
        let time = today.time();
    
        if (!request.body) return response.sendStatus(400);
        console.log('request.body',  date, time, request.body);
    
        let finOrgan = request.body[0];
       // let sql =``;
    
        switch (finOrgan) {
          case 'ЦФР':
            table = "IMPORT_UPDATE_COMISIYA_2";
    
            break;
          case 'Idea':
            table = "IMPORT_UPDATE_COMISIYA_TEMP";
            break;
          case 'Tas':
            table = "IMPORT_UPDATE_COMISIYA_TEMP";
            break;
    
          case 'Воля':
            table = 'IMPORT_UPDATE_COMISIYA_TEMP';
            break;
    
            case 'Укртелеком':
              table = 'IMPORT_UPDATE_COMISIYA';
            break;
    
            case 'Galaxy':
              console.log('Galaxy case')
              table = 'import_update_comisiya_temp';
            break;
    
            default:
              response.send(`Locked! - ${finOrgan} что-то не то`);
              resp_mess = {
                type : "error",
                title : "Locked! - ${finOrgan} что-то не то",
                table : table,
                text : `[По состоянию на ${date}, ${time} <br> что-то не то]`
              }
              response.send(resp_mess);
        //    await connection.close();
            return;
        }

        table = table.toUpperCase();
    
        let sql = `INSERT INTO ${table} 
          (deal_id, comment2)
         VALUES  (:1, :2 )`;
    
        // data prepare
        let binds = request.body;
        binds.shift();
        binds.forEach((element) => {
            element.forEach((el, j, theArray) => {
                if (el !== null){
                  el=el.replace('\\n', '')
                  el=el.replace('№', '')
                  el = el.trim()
                  theArray[j] = el
                }
                if (el == ''){
                  el = null;
                }
            });
        });

        var semcheck = require('../semaphore/semcheck');
        var semcheckrun = new person(table, response, connection, date, time);
        if (await semcheckrun.cheksem() == 'error'){
          return;
        }

        
      //   let ressemaphore = await connection.execute("select * from semaphore");
      // //  console.log('ressemaphore', ressemaphore)
      //   for (const item of ressemaphore.rows) { 
      //     console.log(item.includes(table));
      //     let itemjson = JSON.stringify(item)
          

      //     console.log('table', table)
          
      //     if (item.includes(table)) {
      //       resp_mess = {
      //         type : "error",
      //         title : "Semaphore заблокирован",
      //         table : table,
      //         text : `[["По состоянию на", "${date}", "${time}" ], ${itemjson}]`,
      //         class: 'kossfullwidth'
      //       }
      //       response.send(JSON.stringify(resp_mess));
      //       console.log('Semaphore заблокирован')
      //       return; // Stop script
      //     }
      //   }

        
      //   let seminsert = await connection.execute(`INSERT INTO semaphore (table_name, user_name, start_time, path) VALUES ('${table}', 'quasar', '${date} ${time}', 'nodeJS')`);
      //   await connection.commit();
    
        const options = {
          batchErrors: true,
        };
    
        await connection.execute(`Truncate table ${table}`);
    
        let res = await connection.executeMany(
          sql, binds, options
        );
        
        await connection.commit();
    
        resp_mess = {
          type : "next_select",
          title : "Залило рядки",
          table: table,
          text : `[["По состоянию на", "${date}", "${time}", "Залило рядков - ${res.rowsAffected}"]]`,
          // text : `По состоянию на ${date}],[ ${time} Залило рядков - ${res.rowsAffected}`
        }
    
        // function sleep(ms) {
        //   return new Promise(resolve => setTimeout(resolve, ms));
        // }
    
        // await sleep(5000);
    
         
         //response.send(resp_mess);
         response.send(JSON.stringify(resp_mess));
         response.end();
    
         return; // Stop script
    
      }
      catch (err) {
        console.error('Whoops! insert notes 1 ');
        semclose(table);
        console.error(err);
        process.exit(1);
      }
      finally {
        connection.close();
        console.log('FINALY1 notes insert');
      }
    });


    module.exports = insert;