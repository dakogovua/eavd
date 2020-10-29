var express = require('express');
var pin = express.Router();
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


pin.post('/', middleware(), async (request, response) => {
    try {
        let date = today.date();
        let time = today.time();
    
  
        if (!request.body) return response.sendStatus(400);
        console.log('/withdraw/pin request.body', request.body, date, time);
       
        let finOrgan = request.body[0];
        table = request.body[1];
  
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
            BEGIN helper.p_idea_4_not_found(:cursor); 
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
                text : `[Что-то пошло не так по состоянию на ${date}, ${time} ]`
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
              if(row != null){
                arr.push(row);
              }
  
            }
          
          // always close the ResultSet
          await resultSet.close();
  
          resp_mess = {
            type : "next_check",
            title : "Not found - не нашло, наверное уже отозвано",
            table: table,
            text : JSON.stringify(arr),
            class: 'kossfullwidth'
          }
  
        }
  
        if  (DBMS_OUTPUT == 0){
          //отправляем сообщение, что всё оке. 
  
          resp_mess = {
                  type : "next_check",
                  title : `Всё пропинилось, на ${date}, ${time}`,
                  table : table,
                  text : `[["Нажмите OK чтобы отозвать"]]`
                }
        }
  
        
        response.send(JSON.stringify(resp_mess));
  
   // semclose(table);
  
      }
      catch (err) {
        let date = today.date();
        let time = today.time();
    
  
        resp_mess = {
          type : "error",
          title : `Error! ${err}, на ${date}, ${time}`,
          table : table,
          text : `[["Error! Whoops PIN!"]]`
        }
         await response.send(JSON.stringify(resp_mess));
        console.error('Whoops PIN!');
        console.error(err);
        process.exit(1);
      }
      finally {
        connection.close();
        console.log('FINALY pin');
      }
    });

    module.exports = pin;