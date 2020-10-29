    const oracledb = require('oracledb');
    const configDir = 'D:\\ora client 12 full 64\\client\\bin';
    const connstr = '(DESCRIPTION = (ADDRESS_LIST = (ADDRESS = (PROTOCOL = TCP)(HOST = 10.0.100.101)(PORT = 1521)))(CONNECT_DATA = (SID=CD)))';
    const config = {
        user: "IMPORT_USER",
        password: "sT7hk9Lm",
        connectString: connstr
    };
    
    let pool;
    let connect;


let connection = async () => {
    //const connection = async () => {
    pool = await oracledb.createPool(config);
    connect = await oracledb.getConnection();
    //return connect;
    //console.log('connectconnect', connect)
    //global.connection = connect;
    //console.log('global.connection', global.connection)
    //}   
   // console.log(connect)
   // let result = await connect.execute("select * from semaphore");
   // console.log(result);
    return connect;
   };

   module.exports.connection = connection;
