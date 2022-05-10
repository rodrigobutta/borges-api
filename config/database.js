module.exports = {
  development: {
    username: process.env.BORGES_API_MYSQL_USERNAME,
    password: process.env.BORGES_API_MYSQL_PASSWORD,
    database: process.env.BORGES_API_MYSQL_NAME,
    host: process.env.BORGES_API_MYSQL_HOST,
    port: process.env.BORGES_API_MYSQL_PORT,
    dialect: 'mysql',
  },
  test: {
    username: process.env.BORGES_API_MYSQL_USERNAME,
    password: process.env.BORGES_API_MYSQL_PASSWORD,
    database: process.env.BORGES_API_MYSQL_NAME,
    host: process.env.BORGES_API_MYSQL_HOST,
    port: process.env.BORGES_API_MYSQL_PORT,
    dialect: 'mysql',
  },
  production: {
    username: process.env.BORGES_API_MYSQL_USERNAME,
    password: process.env.BORGES_API_MYSQL_PASSWORD,
    database: process.env.BORGES_API_MYSQL_NAME,
    host: process.env.BORGES_API_MYSQL_HOST,
    port: process.env.BORGES_API_MYSQL_PORT,
    dialect: 'mysql',
  },
};
