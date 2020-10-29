var express = require('express');
var finish = express.Router();
let today = require('../timedate/timedate')
const oracledb = require('oracledb');
//console.log('module', module)

const  connect =  require('../oracle/connect');
//console.log(connect.connection())

var connection
var table;

function middleware(){
  return async function(req, res, next){
    connection = await connect.connection();
    next()
  }
}


finish.post('/', middleware(), async (request, response) => {
    try {
        let date = today.date();
        let time = today.time();
    
    
        if (!request.body) return response.sendStatus(400);
        console.log('request.body finish', request.body, date, time);
    
        let finOrgan = request.body[0];
        let sql_withdraw;
    
        switch (finOrgan) {
          case 'ЦФР':
            sql_withdraw = `
              BEGIN
               helper.p_cfr_5_withdraw; 
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
                  helper.p_galaxy_notes_6_ins; 
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
                text : `[Что-то пошло не так по состоянию на ${date}, ${time} ]`
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
            helper.p_galaxy_notes_2_check(:cursor); 
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
          title : `Результирующая таблица log отзывов. ${date}, ${time}`,
          table: table,
          text : JSON.stringify(arr),
          class: 'kossfullwidth'
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
        connection.close();
        console.log('finaly finish');
      }
})

module.exports = finish;