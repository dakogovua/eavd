var express = require('express');
var select = express.Router();
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


select.post('/', middleware(), async (request, response) => {
    try {
        let date = today.date();
        let time = today.time();
    
        if (!request.body) return response.sendStatus(400);
        console.log('request.body select', request.body, date, time);
    
        let finOrgan = request.body[0];
    
        switch (finOrgan) {
          case 'ЦФР':
            sql_select = `
              BEGIN
               helper.p_cfr_4_select(:cursor); 
              END;`;
            break;
    
          case 'Idea':
            sql_select =  `
            BEGIN 
              helper.p_idea_5_select(:cursor); 
            END;`;
            break;
    
          case 'Tas':
            sql_select =  `
            BEGIN 
              helper.p_tas_5_select(:cursor); 
            END;`;
            break;
    
            case 'Укртелеком':
              sql_select =  `
              BEGIN helper.p_ukrtelecom_4_sel(:cursor); 
              END;`;
              break;
    
            case 'Galaxy':
              sql_select =  `
               BEGIN helper.p_galaxy_notes_2_select(:cursor); 
              END;`;
            break;
    
          case 'Воля':
            sql_select =  `
            BEGIN 
              helper.p_volia_select(:cursor); 
            END;`;
            break;
    
            default:
              //response.send(`Nxt Locked! - ${finOrgan} что-то не то`);
              resp_mess = {
                type : "error",
                title : `select. Непонятная ошибка ${finOrgan}, ${table}`,
                table : table,
                text : `[Что-то пошло не так по состоянию на ${date}, ${time} ]`
              }
              response.send(JSON.stringify(resp_mess));
              response.end();
              semclose(table);
            return;
        }
    
        const result = await connection.execute(
          sql_select,
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
          title : `Проверьте заметки. ${date}, ${time}`,
          table: table,
          text : JSON.stringify(arr),
          class: 'kossfullwidth'
        }
    
    
        response.send(JSON.stringify(resp_mess));
        response.end();
    
      }
      catch (err) {
        console.error('Whoops! select');
        console.error(err);
        semclose(table);
        process.exit(1);
      }
      finally {
        connection.close();
        console.log('finaly select');
      }
    })

    module.exports = select;