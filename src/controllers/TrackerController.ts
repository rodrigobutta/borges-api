import { NextFunction, Request, Response } from 'express';
import BadRequestException from '../exceptions/BadRequestException';
import InternalError from '../exceptions/InternalError';
import { getTrackerCurrentLocation, trackerBeacon, trackerCheckin } from '../lib/tracker';
import { TrackerLocation } from '../models/TrackerLocation';

class TrackerController {
  async post(request: Request, response: Response, next: NextFunction) {
    try {
      const { authProfileId } = request;
      const { trackerId } = request.body;

      if (!trackerId) {
        throw new BadRequestException('trackerId needed');
      }

      const tracker = await trackerCheckin(trackerId, authProfileId);
      return response.status(200).send(tracker);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async beacon(request: Request, response: Response, next: NextFunction) {
    try {
      const { trackerId } = request.params;
      const { batteryLevel } = request.body;

      await trackerBeacon(trackerId, batteryLevel);
      return response.status(200).send({ beacon: 'ok' });
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async track(request: Request, response: Response, next: NextFunction) {
    try {
      const { trackerId } = request.params;
      const { lat, lng } = request.body;

      const location = await TrackerLocation.create({
        lat,
        lng,
        trackerId,
      });
      return response.status(200).send(location);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async getCurrentLocation(request: Request, response: Response, next: NextFunction) {
    try {
      const { trackerId } = request.params;
      if (!trackerId) {
        throw new BadRequestException('trackerId needed');
      }

      const location = await getTrackerCurrentLocation(trackerId);
      return response.status(200).send(location);
    } catch (error) {
      return next(new InternalError(error));
    }
  }
}

export default TrackerController;
