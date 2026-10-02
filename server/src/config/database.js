const knex = require('knex');
const knexfile = require('../../knexfile');

const pg = require('pg');
// 1082 is PostgreSQL OID for DATE. Return as string "YYYY-MM-DD" to avoid timezone conversion bugs
pg.types.setTypeParser(1082, (val) => val);

const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];

const db = knex(config);

module.exports = db;
