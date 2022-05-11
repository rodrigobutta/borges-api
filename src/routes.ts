import { Express } from 'express';

import authMiddleware from './middlewares/authMiddleware';
import AuthController from './controllers/AuthController';
import CustomerController from './controllers/CustomerController';
import FileController from './controllers/FileController';
import TestController from './controllers/TestController';
import AccountController from './controllers/AccountController';
import ProfileController from './controllers/ProfileController';
import LocationController from './controllers/LocationController';
import QRController from './controllers/QRController';
import BatchController from './controllers/BatchController';
import TrackerController from './controllers/TrackerController';

const routes = (app: Express) => {
  const accountController = new AccountController();
  const authController = new AuthController();
  const customerController = new CustomerController();
  const fileController = new FileController();
  const qrController = new QRController();
  const locationController = new LocationController();
  const testController = new TestController();
  const profileController = new ProfileController();
  const batchController = new BatchController();
  const trackerController = new TrackerController();

  app.get('/', (_, res) =>
    res.json({
      test: 'OK',
    }),
  );

  app.get('/health', (_, res) => {
    res.json({
      healthy: true,
    });
  });

  // TESTS
  app.post('/test/mail/send', testController.mailSend);
  app.post('/test/mail/template', testController.mailSendTemplate);

  // PUBLIC & ONBOARDING
  app.post('/public/contact', profileController.sendContact); // TODO I added an public route for guest searches until it has a token

  // AUTH
  app.get('/auth/jwt', authMiddleware, authController.getJwt);
  app.get('/auth/', authMiddleware, authController.getAuthProfile);
  app.get('/auth/user', authMiddleware, authController.getAuthProfile); // ALIAS UP
  app.get('/auth/profile', authMiddleware, authController.getAuthProfile); // ALIAS UP
  app.get('/auth/login/jwt', authMiddleware, authController.consumerLogin); // it's a login but with the jwt info
  app.get('/auth/consumer/login', authMiddleware, authController.consumerLogin); // ALIAS UP

  // USERS & ACCOUNTS

  app.get('/users', authMiddleware, profileController.list);
  app.get('/usersKc', authMiddleware, profileController.listKeycloak); // TODO TMP
  app.get('/profiles/permissions', authMiddleware, profileController.permissions);
  app.get('/users/:uuid', authMiddleware, profileController.getByUUID);
  app.post('/users/:uuid', authMiddleware, profileController.renable);
  app.post('/users', authMiddleware, profileController.post);
  app.patch('/users/:uuid', authMiddleware, profileController.patch);
  app.delete('/users/:uuid', authMiddleware, profileController.delete);
  app.post('/users/consumerInvitationFromDealer', profileController.dealerInvitesConsumerUser);

  app.get('/account', authMiddleware, accountController.list); // TODO plural or singular, cos thats the question
  app.post('/accounts/dealers', accountController.newDealerWithUser);
  app.delete('/accounts/:accountId', authMiddleware, accountController.delete);
  app.get(
    '/account/:accountId/assigned-commission-tables',
    authMiddleware,
    accountController.getAssignedCommissionTables,
  );
  app.patch(
    '/account/:accountId/assigned-commission-tables',
    authMiddleware,
    accountController.patchAssignedCommissionTables,
  );

  // CUSTOMERS
  app.get('/customers', authMiddleware, customerController.findAll);
  app.get('/customers/:id', authMiddleware, customerController.getById);
  app.patch('/customers/:customerId', authMiddleware, customerController.patch);
  app.post('/customers/find-by-name', authMiddleware, customerController.findByName);
  // TODO move to plural
  app.get('/customer', authMiddleware, customerController.get);
  app.get('/customer/:customerId', authMiddleware, customerController.get);
  app.patch('/customer/:customerId', authMiddleware, customerController.patch);

  // FILES
  app.post('/file', authMiddleware, fileController.post);
  app.get('/file/:id', authMiddleware, fileController.get);

  // LOCATIONS
  app.get('/locations', authMiddleware, locationController.search);
  app.get('/locations/:id', authMiddleware, locationController.getById);
  app.post('/locations', authMiddleware, locationController.add);
  app.patch('/locations/:id', authMiddleware, locationController.update);
  app.delete('/locations/:id', authMiddleware, locationController.delete);

  // accounts
  app.get('/accounts', authMiddleware, accountController.list);

  app.post('/accounts/search', authMiddleware, accountController.search);
  app.patch('/accounts/:id', authMiddleware, accountController.update);
  app.get('/accounts/:id', authMiddleware, accountController.getById);
  app.get('/accounts/:id/account-files', authMiddleware, accountController.getFiles);
  app.post('/accounts/:id/account-files', authMiddleware, accountController.addFile);

  //QR
  app.post('/qrs', authMiddleware, qrController.post);

  app.post('/batch/migrate/user/dealer', authMiddleware, batchController.migrateDealerUser);

  app.post('/tracker', trackerController.post);
  app.post('/tracker/:trackerCode/track', trackerController.track);
};

export default routes;
