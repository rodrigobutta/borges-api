import { Account } from '../models/Account';
import { AccountGroupRole } from '../models/AccountGroupRole';
import { Customer } from '../models/Customer';

export interface User {
  uuid: string;
  accountId: number;
  accountGroupRoleId: number;
  email: string;
  customerId: number;
  firstName: string;
  lastName: string;
  authClientName: string;
  locale: string;
  customer?: Customer;
  account?: Account;
  accountGroupRole?: AccountGroupRole;
  // capabilities?: ProfileCapability[];
  profiles?: any | undefined; // should be array of extended profiles
}
