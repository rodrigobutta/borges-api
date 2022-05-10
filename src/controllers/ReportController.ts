import { NextFunction, Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { Quote } from '../models/Quote';

class ReportController {
  async favoritesReport(request: Request, response: Response, _next: NextFunction) {
    const { authAccountId } = request;

    const body = await Quote.sequelize?.query(
      `
      select count(clr.id) as count, i.vehicleBrandName as brand, i.id, i.vehicleModelName as model 
      from consumerLoanRequests clr
      inner join inventories i on clr.inventoryId = i.id
      where i.accountId = ${authAccountId}
      group by i.id
      order by count desc limit 3;`,
      {
        type: QueryTypes.SELECT,
      },
    );
    response.status(200).send(body);
  }
}

export default ReportController;
