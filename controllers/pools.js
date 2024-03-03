const mysql = require('mysql2/promise');

const pools = async (uni = 'National') => {
  let pool;

  // const poolNum = await redisResult(uni);
  const poolNum = '0';

  switch (poolNum) {
    case '0':
      pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: process.env.MYSQL_PORT,
      });

      break;
  }
  return pool;
};

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
});

module.exports = {pool, pools};
