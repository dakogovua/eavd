const oracledb = require('oracledb');
const configDir = 'D:\\ora client 12 full 64\\client\\bin';
const connstr = '(DESCRIPTION = (ADDRESS_LIST = (ADDRESS = (PROTOCOL = TCP)(HOST = 10.0.100.101)(PORT = 1521)))(CONNECT_DATA = (SID=CD)))';
const config = {
                user:           "IMPORT_USER",
                password:       "sT7hk9Lm",
                connectString:  connstr
              };

(async () => {
  let pool = await oracledb.createPool(config);
  let connection = await oracledb.getConnection()
  let semaphore = false;

  let ressemaphore = await connection.execute("select * from semaphore");
  let table = "IMPORT_UPDATE_COMISIYA_2"

      for (const item of ressemaphore.rows) {
        console.log(item.includes(table));
        if(item.includes(table)){
        semaphore = true;
      // response.send(`Locked! - ${item}`);
        return; // Stop script
      } 
    }

    console.log ('semaphore', semaphore)

  await connection.close();

})();












console.log(date + ' ' + time + ' request.body  ' + request.body);

// console.log(request.body[0]); 

// response.send(`${request.body.finorgan} - ${request.body.text}`);

// let pool;
// let connection;

// console.log('config', config)

try {

  (async () => {


   let pool = await oracledb.createPool(config);
   let connection = await oracledb.getConnection()

   //  console.log('connection1',connection)

  let finOrgan = request.body[0];
  let finOrgan = 'Воля';
  let  table = '';

    switch(finOrgan) {
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
            return;
    }
            
            let semaphore = false;
            let ressemaphore = await connection.execute("select * from semaphore");
            
            let getSemaphore = async function(){
                  // console.log('ressemaphore', ressemaphore)
                  for (const item of ressemaphore.rows) {
                         console.log(item.includes(table));
                         if(item.includes(table)){
                         semaphore = true;
                         response.send(`Locked! - ${item}`);
                         return; // Stop script
                    } 
                }
            } 
           getSemaphore();
            

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
                
               
         //   console.log('sql', sql, 'binds', binds, 'options', options)
         

            // await connection.executeMany(
            //   sql, binds, options, (err, res) => {
            //     if (err) {
            //       console.error('executeMany err is', err);
            //     }
            //     else {
            //       console.log("Res is:", res)
            //       console.log('Semaphore executeMany', semaphore)

            //       connection.commit(async (res) => {
            //       console.log('res commit', res)
                  
            //     });

            //     }
            //   }
            // );
              
            async function f() {

              let promise = new Promise((resolve, reject) => {
                resolve(connection.executeMany(sql, binds, options))
                
              });
            
              let result = await promise; // будет ждать, пока промис не выполнится (*)
            
              console.log(result); // "готово!"
            }
            
            f();


//     // conn1.execute("select t.deal_id , t.comment2 from import_update_comisiya_temp t",
//     //             async function(err, result)
//     //               {
//     //                 if (err) { console.error(err); return; }
//     //                 console.log(result.rows);
//     //                 // console.log(result.rows[0]);
//     //                 for (let i in result.rows){
//     //                   console.log('result.rows i', result.rows[i])
//     //                 }
//     //               });

  await connection.close();
  
  })();
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
//})();