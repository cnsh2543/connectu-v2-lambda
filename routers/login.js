/* eslint-disable no-unused-vars */
/* eslint-disable new-cap */
const Router = require('express').Router();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const {pool} = require('../controllers/pools');

Router.post('/', async (request, response, next) => {
  try {
    const {username, password} = request.body;

    let passwordRetrieved; let uni;

    // const pool = await pools(consoPool);
    // const pool = mysql.createPool({
    //   host: process.env.MYSQL_HOST,
    //   user: process.env.MYSQL_USER,
    //   password: process.env.MYSQL_PASSWORD,
    //   database: process.env.MYSQL_DATABASE,
    //   port: process.env.MYSQL_PORT
    // });

    const [rows] = await pool.query(
        `SELECT passwordhash, university FROM users a LEFT JOIN universities b 
          ON a.universityid = b.universityid 
          WHERE userid = ?
          `,
        [username],
    );

    if (rows.length === 0) {
      return response.status(401).send({error: 'User credentials are wrong'});
    } else {
      passwordRetrieved = rows[0].passwordhash;
      uni = rows[0].university;
    }

    bcrypt.compare(password, passwordRetrieved, function(error, res) {
      if (!res || error) {
        return response
            .status(401)
            .send({error: 'User credentials are wrong'});
      } else {
        const token = jwt.sign(
            {username: username, uni: uni},
            process.env.SECRET,
        );
        return response.status(200).send({token, uni});
      }
    });
  } catch (error) {
    response.status(401).send({error: error.message});
    next(error);
  }
});

Router.get('/authenticate', async (request, response, next) => {
  try {
    const bearerHeader = request.headers['authorization'];

    if (!bearerHeader) {
      return response.status(401).send({error: 'No Bearer token provided'});
    }

    const bearerToken = bearerHeader.split(' ')[1];
    const decodedToken = jwt.verify(bearerToken, process.env.SECRET);
    return response
        .status(200)
        .send({username: decodedToken.username, uni: decodedToken.uni});
  } catch (error) {
    response.status(401).send({error: error.message});
    next(error);
  }
});

module.exports = Router;
