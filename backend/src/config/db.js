const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DB_DIALECT === 'sqlite' || !process.env.POSTGRES_DB) {
  // Use SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../dev.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? false : false,
  });
} else {
  // Try Postgres
  sequelize = new Sequelize(
    process.env.POSTGRES_DB || 'hiring_bias_db',
    process.env.POSTGRES_USER || 'postgres',
    process.env.POSTGRES_PASSWORD || 'postgres123',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      dialect: 'postgres',
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    }
  );
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database connected (${sequelize.getDialect().toUpperCase()})`);
    const { syncModels } = require('../models');
    await syncModels();
  } catch (err) {
    if (sequelize.getDialect() !== 'sqlite') {
      console.warn('⚠️ PostgreSQL unavailable, falling back to local SQLite database...');
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../../dev.sqlite'),
        logging: false,
      });
      await sequelize.authenticate();
      console.log('✅ SQLite fallback connected');
      const { syncModels } = require('../models');
      await syncModels();
    } else {
      console.error('❌ Database connection failed:', err.message);
      throw err;
    }
  }
};

module.exports = { sequelize, connectDB };
