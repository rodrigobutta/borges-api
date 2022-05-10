import { Express } from 'express';

import authMiddleware from './middlewares/authMiddleware';
import VarsController from './controllers/VarsController';
import AuthController from './controllers/AuthController';
import LeadController from './controllers/LeadController';
import GuestController from './controllers/GuestController';
import CustomerController from './controllers/CustomerController';
import FileController from './controllers/FileController';
import InventoryController from './controllers/InventoryController';
import TestController from './controllers/TestController';
import AccountController from './controllers/AccountController';
import ProfileController from './controllers/ProfileController';
import LocationController from './controllers/LocationController';
import LoanApplicationController from './controllers/LoanApplicationController';
import SignDocumentController from './controllers/SignDocumentController';
import QRController from './controllers/QRController';
import UtilsController from './controllers/UtilsController';
import BatchController from './controllers/BatchController';

const routes = (app: Express) => {
  const accountController = new AccountController();
  const authController = new AuthController();

  const customerController = new CustomerController();
  const fileController = new FileController();
  const guestController = new GuestController();
  const inventoryController = new InventoryController();
  const signDocumentController = new SignDocumentController();
  const qrController = new QRController();
  const leadController = new LeadController();
  const loanApplicationController = new LoanApplicationController();
  const locationController = new LocationController();

  const testController = new TestController();
  const profileController = new ProfileController();
  const varsController = new VarsController();
  const utilsController = new UtilsController();
  const batchController = new BatchController();

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

  // VARS
  app.get('/vars', varsController.all);
  app.get('/vars/version', varsController.version);
  app.get('/vars/constants', varsController.constants);
  app.get('/vars/currencyExchange', varsController.currencyExchange);
  app.get('/vars/routes', varsController.routes);
  app.get('/vars/check', varsController.check);
  app.get('/vars/git', varsController.git);
  app.get('/vars/env', varsController.env);
  app.get('/vars/package', varsController.package);
  app.get('/vars/inventoryStatus', varsController.inventoryStatus);
  app.get('/vars/inventoryType', varsController.inventoryType);
  app.get('/vars/inventoryActivityType', varsController.inventoryActivityType);
  app.get('/vars/vehicleGeneralConditions', varsController.vehicleGeneralCondition);
  app.get('/vars/leadActivityType', varsController.leadActivityType);
  app.get('/vars/leadStatus', varsController.leadStatus);
  app.get('/vars/quoteStatus', varsController.quoteStatus);
  app.get('/vars/applicationStatus', varsController.applicationStatus);
  app.get('/vars/scheduleType', varsController.scheduleType);
  app.get('/vars/scheduleStatus', varsController.scheduleStatus);
  app.get('/vars/scheduleActivityType', varsController.scheduleActivityType);
  app.get('/vars/dealerCommissionTable', varsController.dealerCommissionTable);

  // TESTS
  app.post('/test/mail/send', testController.mailSend);
  app.post('/test/mail/template', testController.mailSendTemplate);

  app.post('/guest/lead', guestController.newLead);

  // PUBLIC & ONBOARDING
  app.get('/public/search/:id', inventoryController.publicSearchxId); // TODO I added an public route for guest searches until it has a token
  app.post('/public/search', inventoryController.publicSearch); // TODO I added an public route for guest searches until it has a token
  app.post('/public/contact', profileController.sendContact); // TODO I added an public route for guest searches until it has a token

  // AUTH
  app.get('/auth/jwt', authMiddleware, authController.getJwt);
  app.get('/auth/', authMiddleware, authController.getAuthProfile);
  app.get('/auth/user', authMiddleware, authController.getAuthProfile); // ALIAS UP
  app.get('/auth/profile', authMiddleware, authController.getAuthProfile); // ALIAS UP
  app.get('/auth/login/jwt', authMiddleware, authController.consumerLogin); // it's a login but with the jwt info
  app.get('/auth/consumer/login', authMiddleware, authController.consumerLogin); // ALIAS UP
  app.post('/auth/pair/jwt/customer', authMiddleware, authController.consumerPair);
  app.post('/auth/consumer/pair', authMiddleware, authController.consumerPair); // ALIAS UP

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

  // APPLICATION STATUS
  app.get('/application-status', authMiddleware, loanApplicationController.listStatus); // TODO route name

  // LEADS
  // TODO move to plural
  app.post('/leads', authMiddleware, leadController.create);
  app.post('/leads/customer-by-citizen-number', authMiddleware, leadController.findByCitizenNumber);

  app.get('/lead', authMiddleware, leadController.list);
  app.get('/lead/:id', authMiddleware, leadController.get);
  app.get('/leads/:id/loan-applications', authMiddleware, loanApplicationController.findByLeadId);
  app.get('/lead/:id/requests', authMiddleware, leadController.getQuotesByLeadId); // TODO remove after clients deprecation notification
  app.get('/lead/:id/quotes', authMiddleware, leadController.getQuotesByLeadId);
  app.post('/lead/:id/search-inventory', authMiddleware, leadController.searchInventory); // TODO this should be a GET
  app.post('/lead/quote/stock', authMiddleware, leadController.createStockQuote);
  app.post('/leads/:leadId/interaction', authMiddleware, leadController.addInteraction);
  // app.post("/lead/quote/virtual", authMiddleware, leadController.createVirtualQuote);
  // app.post("/lead/quote/simulation", authMiddleware, leadController.createSimulationQuote);

  // CUSTOMERS
  app.get('/customers', authMiddleware, customerController.findAll);
  app.get('/customers/:id', authMiddleware, customerController.getById);
  app.patch('/customers/:customerId', authMiddleware, customerController.patch);
  app.post('/customers/find-by-name', authMiddleware, customerController.findByName);
  // TODO move to plural
  app.get('/customer', authMiddleware, customerController.get);
  app.get('/customer/activity', authMiddleware, customerController.getActivity);
  app.get('/customer/requests', authMiddleware, customerController.getQuotes); // TODO remove after clients deprecation notification
  app.get('/customer/quotes', authMiddleware, customerController.getQuotes);
  app.get('/customer/analysis/logs', authMiddleware, customerController.getAnalysisLogs);
  app.get('/customer/inventory', authMiddleware, customerController.getInventory);
  app.post('/customer/inventory', authMiddleware, customerController.createInventory);
  app.post('/customer/quote/stock', authMiddleware, customerController.createStockQuote);
  app.post('/customer/quote/ml-stock', authMiddleware, customerController.createMLStockQuote);
  app.post('/customer/quote/virtual', authMiddleware, customerController.createVirtualQuote);
  app.post('/customer/quote/simulation', authMiddleware, customerController.createSimulationQuote);

  app.get('/customer/:customerId', authMiddleware, customerController.get);
  app.get('/customer/:customerId/requests', authMiddleware, customerController.getQuotes); // TODO remove after clients deprecation notification
  app.get('/customer/:customerId/quotes', authMiddleware, customerController.getQuotes);
  app.get('/customer/:customerId/activity', authMiddleware, customerController.getActivity);
  app.get('/customer/:customerId/analysis/logs', authMiddleware, customerController.getAnalysisLogs);
  app.get('/customer/:customerId/analysis/score', authMiddleware, customerController.getAnalysisScore);
  app.get('/customer/:customerId/inventory', authMiddleware, customerController.getInventory);
  app.post('/customer/:customerId/search-inventory', authMiddleware, inventoryController.search); // TODO this should be a GET
  app.post('/customer/:customerId/inventory', authMiddleware, customerController.createInventory);
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
  app.get('/accounts/sales-person-borges', authMiddleware, accountController.getSalesPersonBorges);
  app.post('/accounts/search', authMiddleware, accountController.search);
  app.patch('/accounts/:id', authMiddleware, accountController.update);
  app.get('/accounts/:id', authMiddleware, accountController.getById);
  app.get('/accounts/:id/account-files', authMiddleware, accountController.getFiles);
  app.post('/accounts/:id/account-files', authMiddleware, accountController.addFile);

  //Leads
  app.get('/leads', authMiddleware, leadController.list);

  app.get('/customer-card/:customerId', authMiddleware, customerController.generateCard);
  app.get('/isCustomerByEmail/:customerEmail', authMiddleware, customerController.isCustomerByEmail);

  //Sign Documents
  app.get('/signed-documents/:documentId', authMiddleware, signDocumentController.view);
  app.post('/signed-documents', authMiddleware, signDocumentController.sign);

  //Loan applications
  app.get('/loan-applications', authMiddleware, loanApplicationController.search);
  app.get('/loan-applications/:id', authMiddleware, loanApplicationController.get);
  app.get('/loan-applications/:loanApplicationId/activity', authMiddleware, loanApplicationController.getActivity);
  app.get(
    '/loan-applications/:loanApplicationId/logs/provider',
    authMiddleware,
    loanApplicationController.providerLogs,
  );
  app.post('/loan-applications', authMiddleware, loanApplicationController.create);
  app.patch('/loan-applications/:id', authMiddleware, loanApplicationController.save); // TODO old
  app.post('/loan-applications/:id/upload', authMiddleware, loanApplicationController.addFile);
  app.post('/loan-applications/:id/create-revision', authMiddleware, loanApplicationController.createRevision);
  app.patch('/loan-applications/:id/reply-revision', authMiddleware, loanApplicationController.replyRevision); // Panel
  app.post(
    '/loan-applications/:id/provider/submit-application',
    authMiddleware,
    loanApplicationController.providerSubmitApplication,
  );
  app.post('/qit-webhook', loanApplicationController.providerQitechUpdateApplication); // Alias made before. The one that is being called by QiTECH
  app.post(
    '/loan-applications/provider/qitech/update-application',
    loanApplicationController.providerQitechUpdateApplication,
  );

  //QR
  app.post('/qrs', authMiddleware, qrController.post);

  // UTILS

  app.post('/utils/recalculate-borges-price', authMiddleware, utilsController.recalculateBorgesPrice);

  app.post('/batch/migrate/user/dealer', authMiddleware, batchController.migrateDealerUser);
};

export default routes;
