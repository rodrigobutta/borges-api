const settings = {
  locale: 'pt-BR',
  debugMode: process.env.BORGES_API_DEBUG_MODE || 0,
  debugModeSql: 0,
  protocol: process.env.BORGES_API_PROTOCOL || 'http',
  hostname: process.env.BORGES_API_HOSTNAME || 'localhost',
  port: process.env.BORGES_API_PORT || null,
  cors: {
    allowedOrigins:
      process.env.BORGES_API_CORS_ORIGINS ||
      'http://local.borges.com:3000,http://local.borges.com:8080,http://local.borges.com:19006,http://local.borges.com:3001,http://local.borges.com,http://uy.dealers.test.borges.com,https://uy.dealers.test.borges.com,http://uy.dealers.borges.com,https://uy.dealers.borges.com,http://uy.panel.test.borges.com,https://uy.panel.test.borges.com,http://uy.panel.borges.com,https://uy.panel.borges.com',
  },
  auth: {
    publicKey: `-----BEGIN CERTIFICATE-----
hmmmmm
-----END CERTIFICATE-----`,
    algorithm: process.env.BORGES_API_JWT_ALGORITHM || 'RS256',
    keycloak: {
      host: process.env.BORGES_KEYCLOAK_HOST || 'https://auth.borges.com',
      realm: process.env.BORGES_KEYCLOAK_REALM || 'borges',
      client: process.env.BORGES_KEYCLOAK_CLIENT_ID || 'borges-api-client',
      secret: process.env.BORGES_KEYCLOAK_CLIEN_SECRET || '',
      scope: process.env.BORGES_KEYCLOAK_SCOPE || 'openid',
      username: process.env.BORGES_KEYCLOAK_USERNAME || '',
      password: process.env.BORGES_KEYCLOAK_PASSWORD || '',
      grantType: process.env.BORGES_KEYCLOAK_GRANTTYPE || 'password',
    },
  },
  mysql: {
    HOST: process.env.BORGES_MYSQL_HOST || '',
    PORT: process.env.BORGES_MYSQL_PORT ? parseInt(process.env.BORGES_MYSQL_PORT) : 3306,
    NAME: process.env.BORGES_MYSQL_NAME || '',
    USERNAME: process.env.BORGES_MYSQL_USERNAME || '',
    PASSWORD: process.env.BORGES_MYSQL_PASSWORD || '',
  },
  jwtSecret: process.env.BORGES_JWT_SECRET || '',
  s3: {
    BUCKET: process.env.BORGES_API_S3_BUCKET || 'mainbucket',
    ACCESS_KEY: process.env.BORGES_API_S3_ACCESS_KEY,
    ACCESS_SECRET_KEY: process.env.BORGES_API_S3_ACCESS_SECRET_KEY,
    REGION: process.env.BORGES_API_S3_REGION,
  },
  mailgun: {
    PRIVATE_API_KEY: process.env.BORGES_API_MAILGUN_PRIVATE_API_KEY,
    PUBLIC_VALIDATION_KEY: process.env.BORGES_API_MAILGUN_PUBLIC_VALIDATION_KEY,
    DOMAIN: process.env.BORGES_API_MAILGUN_DOMAIN,
  },
  urls: {
    dealersWeb: process.env.BORGES_API_URL_DEALERS_WEB || 'https://br.dealers.dev.borges.com',
    panelWeb: process.env.BORGES_API_URL_PANEL_WEB || 'https://br.panel.dev.borges.com',
    consumerWeb: process.env.BORGES_API_URL_CONSUMER_WEB || 'https://br.consumer.dev.borges.com',
  },
};

export default settings;
