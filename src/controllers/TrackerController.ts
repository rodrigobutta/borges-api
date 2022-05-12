import { NextFunction, Request, Response } from 'express';
import InternalError from '../exceptions/InternalError';
import { Track } from '../models/Track';
import { Tracker } from '../models/Tracker';

class TrackerController {
  async post(request: Request, response: Response, next: NextFunction) {
    try {
      const { authProfileId } = request;
      const { trackerId = null } = request.body;

      const tracker = await Tracker.create({
        ...(trackerId && { id: trackerId }),
        profileId: authProfileId,
      });
      return response.status(200).send(tracker);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async track(request: Request, response: Response, next: NextFunction) {
    try {
      const { trackerId } = request.params;
      const { lat, lng } = request.body;

      const location = await Track.create({
        lat,
        lng,
        trackerId,
      });
      return response.status(200).send(location);
    } catch (error) {
      return next(new InternalError(error));
    }
  }
}

export default TrackerController;
