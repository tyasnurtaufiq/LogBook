require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'epres_db'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './src/db/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './src/db/seeds'
    }
  },
  test: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'epres_db'
    },
    pool: {
      min: 1,
      max: 5
    },
    migrations: {
      directory: './src/db/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './src/db/seeds'
    }
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    pool: {
      min: 2,
      max: 20
    },
    migrations: {
      directory: './src/db/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './src/db/seeds'
    }
  }
};
