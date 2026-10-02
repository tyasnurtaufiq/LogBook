require('dotenv').config();

const getDatabaseConnection = (isProduction = false) => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
    };
  }

  return {
    host: process.env.DB_HOST || (isProduction ? undefined : '127.0.0.1'),
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || (isProduction ? undefined : 'postgres'),
    password: process.env.DB_PASSWORD || (isProduction ? undefined : 'postgres'),
    database: process.env.DB_NAME || (isProduction ? undefined : 'epres_db'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  };
};

module.exports = {
  development: {
    client: 'pg',
    connection: getDatabaseConnection(false),
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
    connection: getDatabaseConnection(true),
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
