import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { errorHandler, routeNotFoundHandler } from './middlewares/errorHandler';
import routes from './routes';
import { sequelize } from './providers/sequelize';
import settings from './settings';
import { KeycloakJWT, KeycloakGroup } from './types/keycloak';
import { Profile } from './models/Profile';
import { Lead } from './models/Lead';
import { getApiUrl } from './lib/url';
import { Client } from './models/Client';

// TODO tried to move to types/custom.d.ts but build errors there
declare global {
  namespace Express {
    interface Request {
      auth?: KeycloakJWT;

      // Depends on the match that was made between the Keycloak user and the API users table
      authProfile?: Profile;
      authProfileId?: number | null;
      authAccountId: number;
      authUserUUID?: string;

      // Depends on the match that was made between the Keycloak user and the API leads table (chained with users table)
      authLead?: Lead;
      authLeadId?: number | null;
      authCustomerId?: number | null;

      // Depends on the Keycloak client that was used to authenticate
      authGroup: KeycloakGroup;

      authClient?: Client | null;

      // Depends on the assigned group or roles to the Keycloak user
      authIsPanel: boolean;
      authIsDealer: boolean;
      authIsConsumer: boolean;
    }
  }
}

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(express.raw({ limit: '50mb' }));
// app.use(express.json());
app.use(fileUpload());
app.disable('x-powered-by');
// app.use(morgan('dev'));

app.get('/', (_, res) => {
  res.send(`<p>Borges API</p>`);
});

routes(app);

app.use(routeNotFoundHandler);
app.use(errorHandler);

async function assertDatabaseConnectionOk() {
  console.log(`Connecting to \x1b[36m${settings.mysql.NAME}@${settings.mysql.HOST}\x1b[0m...`);
  try {
    await sequelize.authenticate();
    console.log('\x1b[42mDatabase OK!\x1b[0m');
  } catch (error: any) {
    console.log('Unable to connect to the database:', error.message);
    process.exit(1);
  }
}

const { protocol, hostname, port } = settings;
const listen = { protocol, hostname, port };

const args = process.argv.slice(2);
args.forEach(arg => {
  const [parameter, value] = arg.split('=');
  if (parameter.toLowerCase() === '--protocol') listen.protocol = value;
  if (parameter.toLowerCase() === '--port') listen.port = value;
  if (parameter.toLowerCase() === '--hostname') listen.hostname = value;
});

// Start
app.listen(listen.port, async () => {
  await assertDatabaseConnectionOk();
  // await sequelize.sync({force: false});
  // connectLogsDb();
  console.log(`Server started on \x1b[4m${getApiUrl()}\x1b[0m.`);
});
