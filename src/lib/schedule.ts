import { SCHEDULE_STATUS, SCHEDULE_TYPE } from '../constants';
import { Schedule } from '../models/Schedule';

export const addSchedule = async ({
  userId,
  accountId,
  leadId = null,
  customerId = null,
  typeCode,
  initialStatusCode,
  inventoryId = null,
}: {
  userId: number;
  accountId: number;
  typeCode: keyof typeof SCHEDULE_TYPE | null;
  initialStatusCode?: keyof typeof SCHEDULE_STATUS | null;
  inventoryId?: string | number | null;
  customerId?: string | number | null;
  leadId?: string | number | null;
}) => {
  const scheduleStatusId =
    initialStatusCode && initialStatusCode in SCHEDULE_STATUS
      ? SCHEDULE_STATUS[initialStatusCode]
      : SCHEDULE_STATUS['requested'];

  let scheduleTypeId = null;
  if (typeCode && typeCode in SCHEDULE_TYPE) {
    scheduleTypeId = SCHEDULE_TYPE[typeCode];
  }
  if (!scheduleTypeId) {
    console.error('Schedule type not found');
    return false;
  }

  const schedule = await Schedule.create({
    userId,
    accountId,
    leadId,
    customerId,
    scheduleStatusId,
    scheduleTypeId,
    ...(inventoryId && { inventoryId }),
  });

  return schedule;
};
