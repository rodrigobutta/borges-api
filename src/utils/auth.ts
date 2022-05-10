import { CONSUMER_ACCOUNT_ID, CONSUMER_API_USER_ID } from '../constants';
import { Profile } from '../models/Profile';

export const getAuthUserId = (user: Profile | null) => {
  if (user && user.id) return user.id;
  return CONSUMER_API_USER_ID;
};

export const getAuthAccountId = (user: Profile | null) => {
  if (user && user.accountId) return user.accountId;
  return CONSUMER_ACCOUNT_ID;
};
