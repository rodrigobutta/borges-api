import { NextFunction, Request, Response } from 'express';
import InternalError from '../exceptions/InternalError';
import { Inventory } from '../models/Inventory';
import ForbiddenException from '../exceptions/ForbiddenException';
import { borgesPricer } from '../utils/borgesPricer';

class UtilsController {
  async recalculateBorgesPrice(_request: Request, response: Response, next: NextFunction) {
    if (!_request.authIsPanel) {
      return next(new ForbiddenException());
    }

    let inventories: { count: number; rows: Inventory[] };

    try {
      inventories = await Inventory.findAndCountAll({
        where: {},
      });
    } catch (error) {
      console.log(error);
      return next(new InternalError(error));
    }

    let newPrices: {
      id: number;
      isNew: boolean;
      autodataPrice: number;
      borgesPrice: number;
    }[] = [];
    for (var index = 0; index < inventories.rows.length; index++) {
      let inventoryElement = inventories.rows[index];
      try {
        if (!inventoryElement.mlInventoryId) {
          // Not for mercado libre cars.
          const price = await borgesPricer({ inventory: inventoryElement });
          newPrices.push({
            id: inventoryElement.id,
            isNew: inventoryElement.new,
            autodataPrice: inventoryElement.vehiclePriceAmount,
            borgesPrice: price ? price : 0,
          });
          await Inventory.update(
            {
              borgesPrice: price,
            },
            {
              where: {
                id: inventoryElement.id,
              },
            },
          );
        }
      } catch (error) {
        console.log(error);
        return next(new InternalError(error));
      }
    }

    response.status(200).json({ newPrices });
  }
}

export default UtilsController;
