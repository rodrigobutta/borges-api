import { Tracker } from '../models/Tracker';
import { TrackerActivity } from '../models/TrackerActivity';
import { Profile } from '../models/Profile';
import { Account } from '../models/Account';
import InternalError from '../exceptions/InternalError';
import NotFoundException from '../exceptions/NotFoundException';
import { TrackerLocation } from '../models/TrackerLocation';

export const trackerCheckin: any = async (trackerId: number | null, profileId?: number | null) => {
  try {
    const now = new Date();

    const tracker = await Tracker.upsert({
      // ...(trackerId && { id: trackerId }),
      checkinAt: now,
      beaconAt: now,
      trackerId,
      profileId,
    });

    return tracker;
  } catch (error) {
    throw new InternalError(error);
  }
};

export const trackerBeacon: any = async (trackerId: number | null, batteryLevel: number | null) => {
  try {
    const now = new Date();

    console.log(batteryLevel);

    await createActivity(trackerId, {
      trackerActivityTypeId: 100,
      data: {
        ...(batteryLevel && { batteryLevel }),
      },
    });

    await Tracker.update(
      {
        beaconAt: now,
        ...(batteryLevel && { batteryLevel }),
      },
      {
        where: {
          id: trackerId,
        },
      },
    );

    return true;
  } catch (error) {
    throw new InternalError(error);
  }
};

export const trackerGetById: any = async (id: number) => {
  const tracker = await Tracker.findByPk(id, {
    include: [
      {
        model: Profile,
        include: [
          {
            model: Account,
          },
        ],
      },
    ],
    raw: true,
    nest: true,
  });
  if (!tracker) {
    throw new NotFoundException();
  }

  const activity = await trackerGetActivity(id);

  const lastActivity = activity && activity.length > 0 ? activity[0] : undefined;

  const output = { ...tracker, lastActivity };

  return output;
};

export const trackerGetActivity: any = async (trackerId: string) => {
  const activity = await TrackerActivity.findAll({
    where: { trackerId },
    include: [
      {
        model: Profile,
      },
      {
        model: Account,
      },
    ],
    order: [['createdAt', 'DESC']],
    nest: true,
    raw: true,
  });

  const curatedActivity = activity.map(a => {
    return {
      ...a,
      // data: {
      //   ...a.data,
      //   ...(a.data?.validations && { validationResume: resumeValidations(a.data?.validations) }),
      //   ...(a.data?.migratedRaw && { raw: JSON.parse(a.data?.migratedRaw) }),
      // },
    };
  });

  return curatedActivity;
};

export const createActivity: any = async (
  trackerId: string,
  {
    trackerActivityTypeId,
    data = null,
    profileId = null,
    accountId = null,
  }: {
    trackerActivityTypeId?: number;
    data?: any | null;
    profileId?: number | null;
    accountId?: number | null;
  },
): Promise<boolean> => {
  try {
    await TrackerActivity.create({
      trackerId,
      trackerActivityTypeId,
      ...(profileId && { userId: profileId }),
      ...(accountId && { accountId }),
      data,
    });
  } catch (error) {
    throw new InternalError(error);
  }

  return true;
};

export const getTrackerCurrentLocation: any = async (trackerId: string) => {
  const location = await TrackerLocation.findOne({
    attributes: ['lat', 'lng'],
    where: { trackerId },
    order: [['id', 'DESC']],
    raw: true,
  });

  return location;
};
