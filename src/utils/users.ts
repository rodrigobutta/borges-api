import { CONSUMER_ACCOUNT_ID, KEYCLOAK_GROUP_DEALER_NAME, PANEL_ACCOUNT_ID } from '../constants';
import { Op } from 'sequelize';
import { Profile } from '../models/Profile';
import { Account } from '../models/Account';
import { createAccount, getAccountOrigin, isConsumerAccount, isDealerAccount, isPanelAccount } from '../lib/account';
import { MailgunTemplate, MailgunWrapper } from '../providers/mailgun';
import settings from '../settings';
import InternalError from '../exceptions/InternalError';
import BadRequestException from '../exceptions/BadRequestException';
import { getKeycloakGroupForAccount, addKeycloakUser, setUserEnabled } from '../providers/keycloak';
import CustomerNotFoundException from '../exceptions/CustomerNotFoundException';
import { Customer } from '../models/Customer';
import AuthUserException from '../exceptions/AuthUserException';
import ProfileNotFoundException from '../exceptions/ProfileNotFoundException';
import { AccountGroup } from '../models/AccountGroup';
import { ProfileCapability } from '../models/ProfileCapability';
import { AccountGroupPermission } from '../models/AccountGroupPermission';
import { AccountGroupRole } from '../models/AccountGroupRole';
import { User } from '../interfaces/User';
import { capitalizeString } from './common';
import NotFoundException from '../exceptions/NotFoundException';

export const getUser = async (uuid: string, withProfiles: boolean = false): Promise<User> => {
  if (!uuid) {
    throw new AuthUserException();
  }

  try {
    // let's grab the first profile for solving the dupes of user data in profiles
    const fetchedProfile = await Profile.findOne({
      include: [
        {
          model: Account,
          include: [
            {
              model: AccountGroup,
            },
          ],
        },
        {
          model: Customer,
        },
      ],
      where: {
        uuid,
      },
      raw: true,
      nest: true,
    });

    if (!fetchedProfile) {
      throw new ProfileNotFoundException();
    }

    const user: User = {
      uuid: fetchedProfile.uuid,
      accountId: fetchedProfile.accountId,
      accountGroupRoleId: fetchedProfile.accountGroupRoleId,
      email: fetchedProfile.email,
      customerId: fetchedProfile.customerId,
      firstName: fetchedProfile.firstName,
      lastName: fetchedProfile.lastName,
      authClientName: fetchedProfile.authClientName,
      locale: fetchedProfile.locale,
      customer: fetchedProfile.customer,
      account: fetchedProfile.account,
      accountGroupRole: fetchedProfile.accountGroupRole,
    };

    // this will add profiles information
    if (withProfiles) {
      user.profiles = await getUserProfiles(user.uuid);
    }

    return user;
  } catch (error) {
    console.error('utils users getProfile', error);
    throw new InternalError(error);
  }
};

export const getProfile = async (uuid: string, accountId: number): Promise<Profile> => {
  if (!uuid) {
    throw new AuthUserException();
  }

  try {
    const user = await Profile.findOne({
      attributes: [
        'accountId',
        'authClientName',
        'customerId',
        'email',
        'firstName',
        'id',
        'lastName',
        'locale',
        'uuid',
      ],
      where: {
        uuid,
        accountId,
      },
      include: [
        {
          attributes: ['id', 'name'],
          model: Account,
          include: [
            {
              model: AccountGroup,
            },
          ],
        },
        {
          attributes: ['id', 'code', 'name'],
          model: AccountGroupRole,
        },
        {
          model: Customer,
        },
      ],
      raw: true,
      nest: true,
    });

    if (!user) {
      throw new ProfileNotFoundException();
    }

    return user;
  } catch (error) {
    console.error('utils users getProfile', error);
    throw new InternalError(error);
  }
};

export const getUserProfiles = async (uuid: string) => {
  const profiles = await Profile.findAll({
    attributes: ['id'],
    include: [
      {
        attributes: ['id', 'name'],
        model: Account,
        include: [
          {
            attributes: ['id', 'code', 'name'],
            model: AccountGroup,
          },
        ],
      },
      {
        attributes: ['id', 'code', 'name'],
        model: AccountGroupRole,
      },
    ],
    where: {
      uuid,
    },
    raw: true,
    nest: true,
  });

  const mappedProfiles = await Promise.all(
    profiles.map(async profile => {
      const capabilities = await getProfileCapabilities(profile.id);
      return {
        id: profile.id,
        accountId: profile.account.id,
        name: profile.account.name,
        origin: getAccountOrigin(profile.account),
        group: profile.account.accountGroup,
        role: profile.accountGroupRole,
        capabilities,
      };
    }),
  );

  return mappedProfiles;
};

export const getProfileCapabilities = async (profileId: number) => {
  const capabilitiesForProfile = await ProfileCapability.findAll({
    attributes: ['accountGroupPermission.id', 'accountGroupPermission.code', 'accountGroupPermission.name'],
    include: [
      {
        attributes: [],
        model: AccountGroupPermission,
      },
    ],
    where: {
      profileId,
    },
    raw: true,
    nest: true,
  });

  return capabilitiesForProfile;
};

export const sendDealerUserWelcomeMail = async (
  user: Profile,
  password?: string,
  kcCreated = false,
  account: Account | null = null,
) => {
  const { uuid, accountId, email, firstName } = user;

  console.log('sendDealerUserWelcomeMail', kcCreated, password);

  const welcomeLink = `${
    settings.urls.dealersWeb
  }/register/welcome?usr=${uuid}&acc=${accountId}&eml=${encodeURIComponent(email)}`;

  const template = new MailgunTemplate();
  template.subject = '{{name}}, bem vindo à conta {{accountName}} em Borges';

  template.body = kcCreated
    ? `<h1>Estes são seus dados para você inserir pela primeira vez</h1><h2>Usuário: {{email}}</h2><h2>Senha: {{password}}</h2><h3>Você pode entrar clicando <a href="{{link}}">aqui</a></h3><p>Uma vez inserido, o sistema solicitará que você escolha uma nova senha que só você saberá.</p>`
    : `<h1>Seu usuário agora tem acesso à conta {{accountName}}</h1><h3>Entre clicando <a href="{{link}}">aqui</a></h3>`;

  const mailer = new MailgunWrapper();
  mailer.fromEmail = 'noreply@borges.com';
  mailer.fromTitle = 'Borges';
  mailer.init();

  if (template && template instanceof MailgunTemplate) {
    try {
      const mailData = {
        name: firstName,
        email,
        password,
        link: welcomeLink,
        accountName: account && account.name,
      };

      console.log('MAIL SEND', email, mailData);

      await mailer.sendFromTemplate(email, template, mailData).catch(error => {
        console.error('DEALER MAIL SEND', email, error);
      });
    } catch (error) {
      console.log(error);
      throw new InternalError(error);
    }
  }
};

export const sendPanelUserWelcomeMail = async (user: Profile, password?: string, kcCreated = false) => {
  const { uuid, email, firstName } = user;

  const welcomeLink = `${settings.urls.panelWeb}?usr=${uuid}&&eml=${encodeURIComponent(email)}`;

  const template = new MailgunTemplate();
  template.subject = '{{name}}, bem vindo ao painel Borges';

  template.body = kcCreated
    ? `<h1>Estes são seus dados para você inserir pela primeira vez</h1><h2>Usuário: {{email}}</h2><h2>Senha: {{password}}</h2><h3>Você pode entrar clicando <a href="{{link}}">aqui</a></h3><p>Uma vez inserido, o sistema solicitará que você escolha uma nova senha que só você saberá.</p>`
    : `<h1>Agora você pode acessar o painel Borges clicando <a href="{{link}}">aqui</a></h3>`;

  const mailer = new MailgunWrapper();
  mailer.fromEmail = 'noreply@borges.com';
  mailer.fromTitle = 'Borges';
  mailer.init();

  if (template && template instanceof MailgunTemplate) {
    try {
      const mailData = {
        name: firstName,
        email,
        password,
        link: welcomeLink,
        accountName: user.account.name,
      };

      console.log('PANEL MAIL SEND', email, mailData);

      await mailer.sendFromTemplate(email, template, mailData).catch(error => {
        console.error('MAIL SEND', email, error);
      });
    } catch (error) {
      console.log(error);
      throw new InternalError(error);
    }
  }
};

export const sendConsumerUserWelcomeMailFromDealer = async (user: Profile, account: Account) => {
  const { uuid, email, firstName } = user;

  const welcomeLink = `${settings.urls.consumerWeb}?usr=${uuid}&&eml=${encodeURIComponent(email)}&&fromAcc=${
    account.id
  }`;

  const template = new MailgunTemplate();
  template.subject = '{{name}}, {{accountName}} te invitó a Borges';

  template.body = `<h1>Acceder <a href="{{link}}">acá</a></h3> para continuar desde tu casa junto a {{accountName}}`;

  const mailer = new MailgunWrapper();
  mailer.fromEmail = 'noreply@borges.com';
  mailer.fromTitle = 'Borges';
  mailer.init();

  if (template && template instanceof MailgunTemplate) {
    try {
      const mailData = {
        name: firstName,
        email,
        link: welcomeLink,
        accountName: account.name,
      };

      console.log('CONSUMER DEALER MAIL SEND', email, mailData);

      await mailer.sendFromTemplate(email, template, mailData).catch(error => {
        console.error('MAIL SEND', email, error);
      });
    } catch (error) {
      console.log(error);
      throw new InternalError(error);
    }
  }
};

export const sendConsumerUserWelcomeMail = async (user: Profile, password?: string, kcCreated = false) => {
  const { uuid, email, firstName } = user;

  const welcomeLink = `${settings.urls.consumerWeb}?usr=${uuid}&&eml=${encodeURIComponent(email)}`;

  const template = new MailgunTemplate();
  template.subject = '{{name}}, ya podés entrar a tu Borges';

  template.body = kcCreated
    ? `<h1>Estos son tus datos para que ingreses por primera vez</h1><h2>Usuario: {{email}}</h2><h2>Contraseña: {{password}}</h2><h3>Podés ingresar haciendo click <a href="{{link}}">acá</a></h3><p>Una vez ingresado, el sistema te pedirá que escojas una contraseña nueva que sólo vos vas a conocer.</p>`
    : `<h1>Ya podés acceder al panel de Borges haciendo click <a href="{{link}}">acá</a></h3>`;

  const mailer = new MailgunWrapper();
  mailer.fromEmail = 'noreply@borges.com';
  mailer.fromTitle = 'Borges';
  mailer.init();

  if (template && template instanceof MailgunTemplate) {
    try {
      const mailData = {
        name: firstName,
        email,
        password,
        link: welcomeLink,
        accountName: user.account.name,
      };

      console.log('MAIL SEND', email, mailData);

      await mailer.sendFromTemplate(email, template, mailData).catch(error => {
        console.error('CONSUMER MAIL SEND', email, error);
      });
    } catch (error) {
      console.log(error);
      throw new InternalError(error);
    }
  }
};

export const createOrUpdateUser = async ({
  email,
  firstName,
  lastName,
  requestedAccounts,
  authIsPanel, // BEAWARE: This parameter will determine if non specified profiles should be disabled or remain untouch
  authAccountId,
}: {
  email: string;
  firstName: string;
  lastName: string;
  requestedAccounts?: number[];
  authIsPanel: boolean;
  authAccountId?: number;
}) => {
  const responseFlags = {
    consumerUserWasCreated: false,
    dealerUserWasCreated: false,
    panelUserWasCreated: false,
  };
  let tmpPassword: string | null = null;

  const accounts: number[] = [];
  if (requestedAccounts && requestedAccounts.length > 0) {
    // if accounts param in body is present, we're coming from a panel request which should have defined the accounts for the user
    requestedAccounts.forEach((a: any) => accounts.push(a));
  } else if (!requestedAccounts && authAccountId && !authIsPanel) {
    // if no account is specified, we assume this is a Dealer's call, so we create the user for that dealer account
    accounts.push(authAccountId);
  } else {
    // by default, let's create an Consumer user
    accounts.push(CONSUMER_ACCOUNT_ID);
  }
  if (!accounts) {
    throw new BadRequestException('No se pudo determinar la cuenta a la que se desa asociar el usuario');
  }

  const groups: string[] = accounts.reduce((acc, accountId) => {
    const g = getKeycloakGroupForAccount(accountId);
    return g ? [...acc, g] : acc;
  }, [] as string[]);

  if (!authIsPanel && accounts.find((a: number) => a === PANEL_ACCOUNT_ID)) {
    throw new BadRequestException('Un usuario sin permisos de Panel no puede crear usuarios de Panel');
  }

  try {
    const { password, uuid, userCreated, userRestored } = await addKeycloakUser({
      email,
      firstName,
      lastName,
      attributes: {
        origin: authIsPanel ? 'panel' : 'dealer',
      },
      groups,
      authIsPanel,
    });

    tmpPassword = password || null;

    let message = '';

    console.log('KC ADD RESPONSE', {
      password,
      uuid,
      userCreated,
      userRestored,
    });

    const profiles = await Profile.findAll({
      attributes: ['id', 'accountId'],
      where: {
        uuid,
      },
      raw: true,
    });

    const currentAccountIds = profiles.map(p => p.accountId);

    // only delete profiles if the call was made form panel, to avoid a dealer update that removes a panel account or so
    let deletedProfiles: any = [];
    if (authIsPanel) {
      deletedProfiles = await Promise.all(
        currentAccountIds.map(async currentAccountId => {
          if (!accounts.find(a => a === currentAccountId)) {
            await Profile.destroy({
              where: {
                uuid,
                accountId: currentAccountId,
              },
            });

            return {
              accountId: currentAccountId,
              deleted: true,
            };
          } else {
            return {
              accountId: currentAccountId,
              deleted: false,
            };
          }
        }),
      );
    }

    const creationsAndMails = await Promise.all(
      accounts.map(async accountId => {
        let mailSent = false;
        let profileRestored = false;

        const account = await Account.findByPk(accountId);

        if (account) {
          // since sequelize findOrCreate doesnt work with paranoid, had to make it manual https://github.com/sequelize/sequelize/issues/2835
          const softDeletedUser = await Profile.findOne({
            where: {
              uuid: uuid,
              accountId,
              deletedAt: {
                [Op.ne]: null,
              },
            },
            raw: true,
            nest: true,
            paranoid: false,
          });

          if (softDeletedUser) {
            await Profile.restore({
              where: {
                uuid,
                accountId,
              },
            });

            profileRestored = true;
          }

          const [user, dbUserCreated] = await Profile.findOrCreate({
            where: {
              uuid,
              accountId,
            },
            defaults: {
              email,
              firstName,
              lastName,
              authClientName: '??',
            },
            raw: true,
            nest: true,
          });

          if (dbUserCreated) {
            // TODO chgeck if RESTORED applies to send mail
            if (isDealerAccount(accountId)) {
              responseFlags.dealerUserWasCreated = true;
              await sendDealerUserWelcomeMail(user, password, userCreated, account);
            }
            if (authIsPanel && isPanelAccount(accountId)) {
              responseFlags.panelUserWasCreated = true;
              await sendPanelUserWelcomeMail(user, password, userCreated);
            }

            if (isConsumerAccount(accountId)) {
              responseFlags.consumerUserWasCreated = true;
              await sendConsumerUserWelcomeMail(user, password, userCreated);
            }

            mailSent = true;
          } else {
            await Profile.update(
              {
                firstName,
                lastName,
              },
              {
                where: {
                  uuid: user.uuid, // Change to ID to only affect the Account profile, but for now let's sync ewvery profile
                },
              },
            );
          }
        }

        return {
          accountId,
          mailSent,
          profileRestored,
        };
      }),
    );

    message = userCreated
      ? 'Usuario criado y atualizado'
      : userRestored
      ? 'Usuario reacivado y atualizado'
      : 'Usuario atualizado';

    return {
      uuid,
      message,
      creationsAndMails,
      userRestored,
      userCreated,
      deletedProfiles,
      ...responseFlags,
      tmpPassword,
    };
  } catch (error) {
    console.log(error);
    throw new InternalError(error);
  }
};

export const deleteUser = async (uuid: string, authIsPanel?: boolean, accountId?: number) => {
  try {
    const profiles = await getUserProfiles(uuid);
    const otherProfiles = profiles.filter(p => p.accountId !== accountId);
    if (authIsPanel || (!authIsPanel && otherProfiles.length === 0)) {
      await setUserEnabled(uuid, false);
    }

    await Profile.destroy({
      where: {
        uuid,
        ...(!authIsPanel && { accountId }),
      },
    });

    return true;
  } catch (error) {
    console.log(error);
    throw new InternalError(error);
  }
};

export const restoreUser = async (uuid: string, authIsPanel?: boolean, accountId?: number) => {
  try {
    await setUserEnabled(uuid, true);

    // TODO if user restored, there might be some dealer profile that we still didn't want to reactivate
    await Profile.restore({
      where: {
        uuid,
        ...(!authIsPanel && { accountId }),
      },
    });

    return true;
  } catch (error) {
    console.log(error);
    throw new InternalError(error);
  }
};

export const createConsumerUserToExistingCustomer = async ({
  customerId,
  authAccountId,
  fromAccount,
}: {
  customerId: number;
  authAccountId: number;
  fromAccount?: Account | null;
}) => {
  try {
    const customer = await Customer.findOne({
      where: {
        id: customerId,
      },
    });
    if (!customer) {
      throw new CustomerNotFoundException();
    }

    let kcUserCreation = null;
    try {
      kcUserCreation = await createOrUpdateUser({
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        requestedAccounts: [CONSUMER_ACCOUNT_ID],
        authAccountId,
        authIsPanel: false,
      });
    } catch (error) {
      console.log(error);
      throw new InternalError(error);
    }
    const { uuid, tmpPassword, consumerUserWasCreated } = kcUserCreation;

    const user = await getProfile(uuid, CONSUMER_ACCOUNT_ID);

    // assign existing customer to the created user (if it wasn't already assigned)
    if (!user.customerId) {
      await Profile.update(
        {
          customerId,
        },
        {
          where: {
            id: user.id,
          },
        },
      );
    }

    if (consumerUserWasCreated && fromAccount) {
      await sendConsumerUserWelcomeMailFromDealer(user, fromAccount);
    }

    const welcomeLink = `${settings.urls.consumerWeb}?usr=${uuid}&&eml=${encodeURIComponent(customer.email)}${
      fromAccount && '&&fromAcc=' + fromAccount.id
    }`;

    return {
      fromAccount,
      user,
      customer,
      tmpPassword,
      welcomeLink,
    };
  } catch (error) {
    console.log(error);
    throw new InternalError(error);
  }
};

export const createDealerWithUser = async ({
  email,
  firstName,
  lastName,
  companyIDNumber,
  accountName,
  accountCity = '',
  accountState = '',
  accountZipCode = '',
}: {
  email: string;
  firstName: string;
  lastName: string;
  companyIDNumber: string;
  accountName: string;
  accountCity?: string;
  accountState?: string;
  accountZipCode?: string;
}) => {
  // if (!onboardId) {
  // 	throw new BadRequestException('onboardId not present');
  // }

  try {
    const account = await createAccount({
      companyIDNumber: companyIDNumber,
      name: accountName,
      accountGroupId: 1,
      city: accountCity,
      state: accountState,
      zipCode: accountZipCode,
    });

    let userCreationResponse = null;
    // try {
    userCreationResponse = await createOrUpdateUser({
      email,
      firstName,
      lastName,
      requestedAccounts: [account.id],
      authIsPanel: false,
    });
    // } catch (error) {
    // 	console.log(error);
    // 	throw new InternalError(error);
    // }

    const { uuid, tmpPassword } = userCreationResponse;

    const user = await getProfile(uuid, account.id);

    const welcomeLink = `${settings.urls.dealersWeb}/register/welcome?usr=${uuid}&acc=${
      account.id
    }&eml=${encodeURIComponent(email)}`;

    return {
      user,
      account,
      tmpPassword: tmpPassword || '',
      welcomeLink,
    };
  } catch (error) {
    console.log(error);
    throw new InternalError(error);
  }
};

export const updateUserProfilesRoles = async ({
  uuid,
  accountsGroupRoles,
}: {
  uuid: string;
  accountsGroupRoles: { accountId: number; accountGroupRoleId: number }[];
}) => {
  console.log('accountsGroupRoles', accountsGroupRoles);
  try {
    const res = await Promise.all(
      accountsGroupRoles.map(async ({ accountId, accountGroupRoleId }) => {
        await Profile.update(
          {
            accountGroupRoleId,
          },
          {
            where: {
              uuid,
              accountId,
            },
          },
        );

        return {
          accountId,
          accountGroupRoleId,
          response: 'OK',
        };
      }),
    );

    return res;
  } catch (error) {
    console.log(error);
    throw new InternalError(error);
  }
};

export const updateUserProfilesPermissions = async ({
  uuid,
  accountsGroupPermissions,
}: {
  uuid: string;
  accountsGroupPermissions: { accountId: number; accountGroupPermissions: number[] }[];
}) => {
  let bulkInsert: { profileId: number; accountId: number; accountGroupPermissionId: number }[] = [];

  try {
    const res = await Promise.all(
      accountsGroupPermissions.map(async ({ accountId, accountGroupPermissions }) => {
        const profile = await Profile.findOne({
          where: {
            uuid,
            accountId,
          },
        });
        if (!profile) {
          throw new InternalError('Couldnt find the profile in which the permissions should be updated');
        }

        const bulkInsertForAccount = accountGroupPermissions.map(accountGroupPermissionId => ({
          profileId: profile.id,
          accountId: accountId,
          accountGroupPermissionId,
        }));

        bulkInsert = [...bulkInsert, ...bulkInsertForAccount];

        return {
          accountId,
          accountGroupPermissions,
          response: 'OK',
        };
      }),
    );

    const profilesForUser = await Profile.findAll({
      attributes: ['id'],
      where: {
        uuid,
      },
      raw: true,
    });

    await ProfileCapability.destroy({
      where: {
        profileId: { [Op.in]: profilesForUser.map(({ id }) => id) },
      },
    });

    await ProfileCapability.bulkCreate(bulkInsert);

    return res;
  } catch (error) {
    console.log(error);
    throw new InternalError(error);
  }
};

export const migrateDealerUser = async ({
  email,
  authIsPanel,
  password,
}: {
  email: string;
  authIsPanel: boolean;
  password: string;
  testRun?: boolean;
}) => {
  if (!authIsPanel) {
    throw new BadRequestException('Un usuario sin permisos de Panel no puede migrar usuarios');
  }

  const fetchedProfile = await Profile.findOne({
    where: {
      email,
    },
    raw: true,
  });
  if (!fetchedProfile) {
    throw new NotFoundException(`No se pudo encontrar un profile de donde sacar los datos con el mail ${email}`);
  }

  const firstName = capitalizeString(fetchedProfile.firstName);
  const lastName = capitalizeString(fetchedProfile.lastName);

  try {
    const { uuid, userCreated, userRestored } = await addKeycloakUser({
      email,
      firstName,
      lastName,
      attributes: {
        origin: 'panel',
      },
      groups: [KEYCLOAK_GROUP_DEALER_NAME],
      authIsPanel: true,
      requestNewPassword: false,
      fixedPassword: password,
    });

    console.log('KC ADD RESPONSE', {
      password,
      uuid,
      userCreated,
      userRestored,
    });

    const assignedProfiles = await Profile.findAll({
      attributes: ['id', 'accountId'],
      where: {
        email,
        uuid: null,
      },
      raw: true,
    });

    await Profile.update(
      {
        uuid,
        firstName,
        lastName,
      },
      {
        where: {
          email,
          uuid: null,
        },
      },
    );

    return {
      email,
      firstName,
      lastName,
      uuid,
      userRestored,
      userCreated,
      assignedProfiles,
      password,
    };
  } catch (error) {
    throw new InternalError(error);
  }
};
