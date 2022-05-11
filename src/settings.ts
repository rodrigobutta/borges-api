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
    // publicKey  (Keycloak)
    // https://auth.aracargroup.com/auth/realms/aracar/protocol/openid-connect/certs
    //  "use": "sig",
    // > x5c []
    // add -----BEGIN CERTIFICATE-----
    // https://www.janua.fr/keycloak-access-token-verification-example/
    // https://stackoverflow.com/questions/48274251/keycloak-access-token-validation-end-point
    // publicKey: process.env.ARACAR_API_JWT_PUBLIC_KEY || '',
    publicKey: `-----BEGIN CERTIFICATE-----
MIIClzCCAX8CBgGAryLpnTANBgkqhkiG9w0BAQsFADAPMQ0wCwYDVQQDDARUZXN0MB4XDTIyMDUxMDE4MDA0MloXDTMyMDUxMDE4MDIyMlowDzENMAsGA1UEAwwEVGVzdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKD0tEXVf0QHQcdWfoYfCnQwfG6DwnAut2KQP7aaAZ0mvkleWj1Bm3wMGMatNDScY28Yxtf+HPd3bWBxglRKYOzTQADpyL6hNC3dQV/kZHS3IdpxigHmBuAUEWMVm4VaLDjJ3XqWuQI6Ag21J3dJGyFPAX0ilKfklJRnxjd0szcUPYuXE3OqncepJXyOyW54/y9FzvdvHD7jyoCwdNCSt4q5NAqFw/lPFyus0whdbMTk3icUNmiKlSmp3OPPT0RqHR6a9/V5vkMuaZsN058ipUVbvRZG2e6gzID8YBZe8XRoGlLncaVZbqNqSyXZmmIJ5fOSoyuVsm6yjN9BY0/69ysCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAXKUYSpOHrk3Vcv69NZNrFlb0M24rtnGPTZU/eEaD6AKXe5GJfnCgHfQjD8g7gHgDQvOONBw+md6tziQkfSNz9YUpGDBk1B9y5UkDJSRFrJI5/b+wlB+pCqBDFyb5x1/u0HdyXYI8hwrKHdFY1bUKOawXHGjsBYwmc3/W68O/kBPRBvhJeTocRP1TSXkp3PymWDInIHKwQAeX1DLP+n0vyyA6UfBviHCr1ChwScLbqWNDrfKTMSB65TH/+MKkebwpQM3cG8GSsr5d1138orwzoNrTewXKZ/KGXBV6OlC1G/whx9NBLBhYXpt+Kbl3s2J+923i1+HdrH3IXU7kse34dA==
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
