module.exports = function (table, response, connection, date, time) {
    this.table = table;
    this.response = response;
    this.connection = connection;
    this.date = date
    this.time = time
    this.fullName = async function () { 
        let ressemaphore = await connection.execute("select * from semaphore");
        for (const item of ressemaphore.rows) { 
          console.log(item.includes(table));
          let itemjson = JSON.stringify(item)
          if (item.includes(table)) {
            resp_mess = {
              type : "error",
              title : "Semaphore заблокирован",
              table : this.table,
              text : `[["По состоянию на", "${this.date}", "${this.time}" ], ${itemjson}]`,
              class: 'kossfullwidth'
            }
             this.response.send(JSON.stringify(resp_mess));
            return 'error'; // Stop script
          }
        }
        
        let seminsert = await connection.execute(`INSERT INTO semaphore (table_name, user_name, start_time, path) VALUES ('${table}', 'quasar', '${date} ${time}', 'nodeJS')`);
        await connection.commit();
       // return this.firstName + ' ' + this.lastName;
    }
}