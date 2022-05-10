import axios from 'axios';
import querystring from 'querystring';
import settings from '../../settings';
import KeycloakAuthException from '../../exceptions/KeycloakAuthException';
import KeycloakException from '../../exceptions/KeycloakException';
import KeycloakValidationException from '../../exceptions/KeycloakValidationException';
import { checkIfValidUUID } from '../../utils/common';
import {
  PANEL_ACCOUNT_ID,
  KEYCLOAK_GROUP_PANEL_NAME,
  CONSUMER_ACCOUNT_ID,
  KEYCLOAK_GROUP_DEALER_NAME,
  KEYCLOAK_GROUP_PANEL_ID,
  KEYCLOAK_GROUP_DEALER_ID,
} from '../../constants';
// import KeycloakNotFoundException from '../../exceptions/KeycloakNotFoundException';

const getToken = async () => {
  const kcSettings = settings.auth.keycloak;
  const keycloakAuthEndpoint = `${kcSettings.host}/auth/realms/${kcSettings.realm}/protocol/openid-connect/token`;

  try {
    const keycloakAuthResponse = await axios.post(
      keycloakAuthEndpoint,
      querystring.stringify({
        grant_type: kcSettings.grantType,
        client_id: kcSettings.client,
        client_secret: kcSettings.secret,
        username: kcSettings.username,
        password: kcSettings.password,
        scope: kcSettings.scope,
      }),
    );

    if (!keycloakAuthResponse.data.access_token) {
      throw new KeycloakAuthException('No pudimos conectarnos al servicio de gestión de usuarios');
    }

    return keycloakAuthResponse.data.access_token;
  } catch (error: any) {
    console.error('Error Keycloak Lib: getting token:', error);
    throw new KeycloakValidationException(error.response.data.errorMessage, error.response.status);
  }
};

export const addKeycloakUser = async ({
  email,
  firstName,
  lastName,
  attributes = {},
  groups = null,
  authIsPanel = false,
  requestNewPassword = true,
  fixedPassword = null,
}: {
  email: string;
  firstName: string;
  lastName: string;
  attributes: any;
  groups?: string[] | null;
  authIsPanel?: boolean;
  requestNewPassword?: boolean;
  fixedPassword?: string | null;
}) => {
  const { host, realm } = settings.auth.keycloak;
  const kcToken = await getToken();

  const password = fixedPassword || Math.random().toString(20).substr(2, 6);

  try {
    const kcUserResponse = await axios.post(
      `${host}/auth/admin/realms/${realm}/users`,
      {
        username: email,
        email,
        firstName,
        lastName,
        enabled: 'true',
        emailVerified: 'true',
        attributes,
        credentials: [
          {
            type: 'password',
            value: password,
            temporary: requestNewPassword,
          },
        ],
        ...(groups && groups.length > 0 && { groups }),
        ...(requestNewPassword && { requiredActions: ['UPDATE_PASSWORD'] }),
      },
      {
        headers: {
          Authorization: `Bearer ${kcToken}`,
        },
      },
    );

    if (kcUserResponse.status !== 201) {
      throw new KeycloakValidationException(`La creación de usuario en Keycloak no dio la respuesta esperada`);
    }

    //
    const responseHeadersLocation = kcUserResponse.headers.location;
    const pieces = responseHeadersLocation.split(/[\s/]+/);
    const uuid = pieces[pieces.length - 1];

    if (!checkIfValidUUID(uuid)) {
      throw new KeycloakValidationException(`El UUID recuperado de Keycloak no tiene un formato válido`);
    }

    return {
      uuid,
      userCreated: true,
      userRestored: false,
      password,
    };
  } catch (error: any) {
    if (error.response.status !== 500) {
      if (error.response.status === 409) {
        // 409 is a conflict response that the KC user already exists

        let userRestored = false;

        // we'll retrieve that existin user, update it's groups, and reenable it (if needed)
        const existingKcUser: any = await getUserByEmail(email, kcToken);
        if (!existingKcUser) {
          throw new KeycloakException('El usuario de KC ya existía, sin embargo no pudo ser recuperado');
        }

        console.log('getUserByEmail -->', existingKcUser);

        const uuid = existingKcUser.id;

        // if user exists but was disabled, we need to reenable it
        if (existingKcUser.enabled === false) {
          await setUserEnabled(uuid, true, kcToken);
          userRestored = true;
        }

        if (authIsPanel) {
          // update KC user groups depending on the assigned groups in our DB
          // TODO enhace this with a group per user fetch
          if (groups && groups.indexOf(KEYCLOAK_GROUP_DEALER_NAME) >= 0) {
            await addGroupToUser(uuid, KEYCLOAK_GROUP_DEALER_NAME);
          } else {
            await removeGroupFromUser(uuid, KEYCLOAK_GROUP_DEALER_NAME);
          }

          if (groups && groups.indexOf(KEYCLOAK_GROUP_PANEL_NAME) >= 0) {
            await addGroupToUser(uuid, KEYCLOAK_GROUP_PANEL_NAME);
          } else {
            await removeGroupFromUser(uuid, KEYCLOAK_GROUP_PANEL_NAME);
          }
        }

        return {
          uuid,
          userCreated: false,
          userRestored, // this is the only prop that we'll tell if the kc user was disabled so it was restored
        };

        // throw new KeycloakValidationException(
        // 	`El cliente (email: ${email}) ya tiene un usuario generado`,
        // 	error.response.status
        // );
      } else {
        throw new KeycloakValidationException(error.response.data.errorMessage, error.response.status);
      }
    } else {
      console.error('Error Keycloak Lib: creating user:', error);
      throw new KeycloakException();
    }
  }
};

export const setUserEnabled = async (uuid: string, enabled: boolean = true, prevKcToken = null) => {
  const { host, realm } = settings.auth.keycloak;
  const kcToken = prevKcToken || (await getToken());

  const payload = {
    enabled,
  };

  try {
    await axios.put(`${host}/auth/admin/realms/${realm}/users/${uuid}`, payload, {
      headers: {
        Authorization: `Bearer ${kcToken}`,
      },
    });
  } catch (error: any) {
    console.error('Error Keycloak Lib: disabling user:', error);
    throw new KeycloakException(error);
  }

  return {
    uuid,
    enabled,
  };
};

export const removeGroupFromUser = async (uuid: string, groupName: string, prevKcToken = null) => {
  const { host, realm } = settings.auth.keycloak;

  const kcToken = prevKcToken || (await getToken());

  const groupId =
    groupName === KEYCLOAK_GROUP_PANEL_NAME
      ? KEYCLOAK_GROUP_PANEL_ID
      : groupName === KEYCLOAK_GROUP_DEALER_NAME
      ? KEYCLOAK_GROUP_DEALER_ID
      : null;

  if (!groupId) {
    throw new KeycloakException(`removeGroupFromUser: Group ID not found for ${groupName}`);
  }

  try {
    const url = `${host}/auth/admin/realms/${realm}/users/${uuid}/groups/${groupId}`;
    await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${kcToken}`,
      },
    });
  } catch (error: any) {
    console.error('Error Keycloak Lib: removeGroupFromUser:', error);
    throw new KeycloakException(error);
  }

  return true;
};

export const addGroupToUser = async (uuid: string, groupName: string, prevKcToken = null) => {
  const { host, realm } = settings.auth.keycloak;

  const kcToken = prevKcToken || (await getToken());

  const groupId =
    groupName === KEYCLOAK_GROUP_PANEL_NAME
      ? KEYCLOAK_GROUP_PANEL_ID
      : groupName === KEYCLOAK_GROUP_DEALER_NAME
      ? KEYCLOAK_GROUP_DEALER_ID
      : null;

  if (!groupId) {
    throw new KeycloakException(`addGroupToUser: Group ID not found for ${groupName}`);
  }

  try {
    const url = `${host}/auth/admin/realms/${realm}/users/${uuid}/groups/${groupId}`;
    await axios.put(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${kcToken}`,
        },
      },
    );
  } catch (error: any) {
    console.error('Error Keycloak Lib: addGroupToUser:', error);
    throw new KeycloakException(error);
  }

  return true;
};

// not being used for now
export const listUsers = async ({
  search,
  offset = 0,
  itemsPerPage = 100,
}: {
  search?: string | null;
  offset?: number;
  itemsPerPage?: number;
}) => {
  const { host, realm } = settings.auth.keycloak;
  const kcToken = await getToken();

  let params: any = {
    exact: false,
    enabled: true,
    max: itemsPerPage,
    first: offset,
  };

  if (search) {
    const searchString = search.trim();
    params = {
      ...params,
      search: searchString,
    };
  }

  let kcUsers = null;
  try {
    kcUsers = await axios.get(`${host}/auth/admin/realms/${realm}/users`, {
      headers: {
        Authorization: `Bearer ${kcToken}`,
      },
      params,
    });

    const users = kcUsers.data.map((user: any) => user);

    // PANEL 0bc3363c-1de1-4d41-8438-feb6e8c8bd19
    // DEALER d7d1a2b4-663e-4268-9345-8eeec98df02f
    const groupId = '0bc3363c-1de1-4d41-8438-feb6e8c8bd19';

    // let kcGroups = null;
    const kcGroups = await axios.get(`${host}/auth/admin/realms/${realm}/groups/${groupId}/members`, {
      headers: {
        Authorization: `Bearer ${kcToken}`,
      },
      params,
    });

    const groups = kcGroups.data; //.map((user: any) => user);

    return {
      groups,
      users,
    };
  } catch (error: any) {
    console.error('Error Keycloak Lib: listing users:', error);
    throw new KeycloakException(error);
  }
};

export const getUserByEmail = async (email: string, prevKcToken = null) => {
  const { host, realm } = settings.auth.keycloak;

  const kcToken = prevKcToken || (await getToken());

  let params: any = {
    email,
  };

  let kcUser = null;
  try {
    kcUser = await axios.get(`${host}/auth/admin/realms/${realm}/users`, {
      headers: {
        Authorization: `Bearer ${kcToken}`,
      },
      params,
    });
  } catch (error: any) {
    console.error('Error Keycloak Lib: listing users:', error);
    throw new KeycloakException(error);
  }

  if (kcUser.status === 404) {
    return null;
  }

  const user = kcUser && kcUser.data?.find((u: any) => (u.email as string).toLowerCase === email.toLowerCase);

  return user || null;
};

export const getKeycloakGroupForAccount = (accountId: number) =>
  accountId === PANEL_ACCOUNT_ID
    ? KEYCLOAK_GROUP_PANEL_NAME
    : accountId !== CONSUMER_ACCOUNT_ID
    ? KEYCLOAK_GROUP_DEALER_NAME
    : null;
