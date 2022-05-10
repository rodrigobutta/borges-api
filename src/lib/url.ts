import settings from '../settings';

export const getApiUrl = () =>
  settings.port
    ? `${settings.protocol}://${settings.hostname}:${settings.port}`
    : `${settings.protocol}://${settings.hostname}`;
