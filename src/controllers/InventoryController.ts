import { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';
import { pick } from 'lodash';
import { VEHICLE_CONDITIONS } from '../constants';
import InventoryNotFoundException from '../exceptions/InventoryNotFoundException';
import LocationNotFoundException from '../exceptions/LocationNotFoundException';
import InventoryException from '../exceptions/InventoryException';
import ProfileNotFoundException from '../exceptions/ProfileNotFoundException';

import { Account } from '../models/Account';
import { Color } from '../models/Color';
import { Inventory } from '../models/Inventory';
import { InventoryFile } from '../models/InventoryFile';
import { InventoryStatus } from '../models/InventoryStatus';
import { InventoryType } from '../models/InventoryType';
import { InventoryRevisions } from '../models/InventoryRevisions';
import { Location } from '../models/Location';
import { getWhereInventory } from '../utils/inventoryUtils';
import { getInventoryById, getModelProvider } from '../lib/inventory';
import { addSchedule } from '../lib/schedule';
import InternalError from '../exceptions/InternalError';
import { addLeadActivity } from '../lib/leadActivity';
import { INVENTORY_STATUS } from '../constants';
import { borgesPricer } from '../utils/borgesPricer';
import { GridQueryParser } from '../helpers';
import { InventoryComment } from '../models/InventoryComment';

import {
  getBrands,
  getModels,
  getYearsModels,
  getReferenceCodes,
  CODIGO_TIPO_VEICULO,
  // getDescription,
  // TIPO_CONSULTA,
} from '../providers/fipe/index';
import InventoryArgumentMissingException from '../exceptions/InventoryArgumentMissingException';
import ColorFetchException from '../exceptions/ColorFetchException';
import InventoryCommentException from '../exceptions/InventoryCommentException';
import InventoryCommentArgumentMissingException from '../exceptions/InventoryCommentArgumentMissingException';
import { Profile } from '../models/Profile';
import { createSort } from '../utils/common';

function getWhere(filters: any, initialFilter: any = {}) {
  let where = initialFilter;
  if (filters) {
    for (const key in pick(filters, ['inventoryId', 'userId', 'comment'])) {
      if (filters.hasOwnProperty(key) && filters[key]) {
        where[key] = { [Op.substring]: filters[key] };
      }
    }
  }
  return where;
}
const INVENTORY_FIELDS: string[] = [
  'id',
  'accountId',
  'year',
  'assemblyYear',
  'saleValuation',
  'licensePlate',
  'mileage',
  'inactive',
  'sold',
  'type',
  'vehicleConditionId',
  'vehicleConditionName',
  'vehicleBrandName',
  'vehicleFamilyName',
  'vehicleModelName',
  'vehicleMadeInName',
  'vehicleFuelName',
  'vehicleYear',
  'vehiclePriceAmount',
  'vehiclePriceCurrency',
  'borgesPrice',
  'imageCover',
  'imageExteriorFront',
  'imageExteriorBack',
  'imageExteriorLeft',
  'imageExteriorRight',
  'imageInteriorFront',
  'imageInteriorBack',
  'imageInteriorDashboard',
  'imageInteriorTrunk',
  'imageOther1',
  'imageOther2',
  'imageOther3',
];

class InventoryController {
  async list(request: Request, response: Response, next: NextFunction) {
    const { qt } = request.query;

    if (qt === 'select') {
      let where = {
        accountId: request.authAccountId,
      };

      try {
        const inventories = await Inventory.findAll({
          where: where,
          attributes: ['id', 'vehicleModelName', 'licensePlate'],
        });

        return response.status(200).send(inventories);
      } catch (error) {
        console.log(error);
        return next(new InternalError(error));
      }
    } else {
      const { authAccountId, authIsDealer } = request;
      const { sort, limit, page, filters } = GridQueryParser.parse(request.query);

      const { id, customerId } = request.params;

      const where = getWhereInventory({
        filters: filters,
        pCustomerId: parseInt(id ?? customerId),
        isDealer: authIsDealer,
        authAccountId: authAccountId,
      });

      const results = await Inventory.findAndCountAll({
        attributes: INVENTORY_FIELDS,
        include: [
          {
            model: Account,
          },
          {
            model: Location,
          },
          {
            model: InventoryFile, // TODO remove after all images and docs are stored in new format
          },
          {
            model: InventoryType,
          },
          {
            model: InventoryStatus,
          },
        ],
        where: where,
        offset: page ? (Number(page) - 1) * Number(limit) : undefined,
        limit: Number(limit),
        raw: true,
        nest: true,
        order: createSort(sort),
      });

      return response.status(200).json(results);
    }
  }

  async get(request: Request, response: Response, next: NextFunction) {
    const { inventoryId } = request.params;

    try {
      const inventory = await getInventoryById(inventoryId);

      const comments = await InventoryComment.findAll({
        where: {
          inventoryId: inventory.id,
        },
        include: [
          {
            model: Profile,
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return response.json({
        ...inventory,
        inventoryComments: comments,
      });
    } catch (error) {
      console.log(error);
      return next(new InternalError(error));
    }
  }

  async create(request: Request, response: Response, next: NextFunction) {
    if (request.authIsPanel) {
      // TODO an inventory creation from panel has to recover
      // TODO dealers accountID from body.
      return next(new InternalError('Feature not implemented'));
    }

    try {
      const { authAccountId, authProfileId, authCustomerId, body } = request;

      if (!body.locationId) {
        return next(new LocationNotFoundException('Location can not be null'));
      }

      // TODO MVP, borgesPricer works based on ThirdParty base price. In case of UY, autodata sends vechiclePriceAmount. We can calculate borgesPrice if that value is present. An internal API would be great to handle the interaction with other 3rd party value providers.

      const newInventory: Inventory = {
        ...body,
        accountId: authAccountId,
        userId: authProfileId,
        customerId: authCustomerId,
        statusId: 1, //TODO remove foreignkey. Deprecated
        inventoryStatusId: INVENTORY_STATUS['published'],
      };

      // // force USD
      // if (
      //   newInventory.vehiclePriceCurrency &&
      //   newInventory.vehiclePriceCurrency.toUpperCase() !== CURRENCIES["USD"]
      // ) {
      //   const priceInUSD = await convert(
      //     newInventory.vehiclePriceCurrency,
      //     CURRENCIES["USD"],
      //     newInventory.vehiclePriceAmount
      //   );
      //   if (priceInUSD) {
      //     newInventory.vehiclePriceAmount = priceInUSD;
      //     newInventory.vehiclePriceCurrency = CURRENCIES["USD"];
      //   }
      // }

      const borgesPrice = await borgesPricer({ inventory: newInventory });
      newInventory.borgesPrice = borgesPrice;

      const record = await Inventory.create(newInventory);
      return response.json(record);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async patch(request: Request, response: Response, next: NextFunction) {
    const { authProfileId } = request;
    if (!authProfileId) {
      return next(new ProfileNotFoundException());
    }

    const { id } = request.params;

    // only update present fields in the body that are the ones available to update
    const updatingFields = pick(request.body, [
      'accountId',
      'licensePlate',
      'registrationNumber',
      'vehicleResidenceLocation',
      'makerCountry',
      'year',
      'assemblyYear',
      'saleValuation',
      'mileage',
      'brand',
      'color',
      'model',
      'type',
      'vin',
      'registrationNumber',
      'inactive',
      'sold',
      'new',
      'inventoryStatusId',
      'vehicleConditionId',
      'vehicleConditionName',
      'vehicleClasificationId',
      'vehicleClasificationName',
      'vehicleDescription',
      'vehicleBrandId',
      'vehicleBrandName',
      'vehicleFamilyId',
      'vehicleFamilyName',
      'vehicleModelId',
      'vehicleModelName',
      'vehicleMadeInId',
      'vehicleMadeInName',
      'vehicleFuelId',
      'vehicleFuelName',
      'vehicleYear',
      'vehiclePriceAmount',
      'vehiclePriceCurrency',
      'vehicleParameters',
      'statusId',
      'locationId',
      'imageCover',
      'imageExteriorFront',
      'floorPlanStatus',
      'bancarizadorStatus',
      'imageExteriorBack',
      'imageExteriorLeft',
      'imageExteriorRight',
      'imageInteriorFront',
      'imageInteriorBack',
      'imageInteriorDashboard',
      'imageInteriorTrunk',
      'imageOther1',
      'imageOther2',
      'imageOther3',
      'certificatePlate',
      'certificateVerification',
      'inventoryFiles',
      'inventoryRevision',
      'vehicleGeneralConditionId',
      'comments',
    ]);

    try {
      await Inventory.update(
        {
          ...updatingFields,
        },
        {
          where: {
            id: id,
          },
        },
      );

      if (updatingFields.inventoryRevision) {
        await InventoryRevisions.create({
          inventoryId: id,
          backofficeUserId: authProfileId,
          message: updatingFields.inventoryRevision,
        });
      }

      if (updatingFields.comments && updatingFields.comments.length > 0) {
        const listComments: string[] = updatingFields.comments;
        for (let i = 0; i < listComments.length; i++) {
          const comment = listComments[i];

          await InventoryComment.create({
            comment: comment,
            userId: authProfileId,
            inventoryId: id,
          });
        }
      }

      const updatedInventory = await Inventory.findByPk(id, {
        include: [
          {
            model: InventoryRevisions,
          },
          {
            model: InventoryComment,
            include: [
              {
                model: Profile,
              },
            ],
            order: [['createdAt', 'DESC']],
          },
        ],
      });
      if (updatedInventory) {
        const borgesPrice = await borgesPricer({ inventory: updatedInventory });
        updatedInventory.borgesPrice = borgesPrice;
        await Inventory.update(
          {
            borgesPrice,
          },
          {
            where: {
              id: id,
            },
          },
        );
      }

      return response.status(200).json(updatedInventory);
    } catch (error) {
      console.log(error);
      return next(new InventoryException());
    }
  }

  async visit(request: Request, response: Response, next: NextFunction) {
    const { inventoryId } = request.params;

    const { authProfileId, authAccountId, authCustomerId, authLeadId } = request;
    if (!authProfileId) {
      return next(new ProfileNotFoundException());
    }

    try {
      const schedule = await addSchedule({
        inventoryId,
        userId: authProfileId,
        accountId: authAccountId,
        customerId: authCustomerId,
        leadId: authLeadId,
        typeCode: 'vehicle-visit',
      });

      await addLeadActivity({
        accountId: authAccountId,
        typeCode: 'user-requests-visit',
        profileId: authProfileId,
        data: {
          inventoryId,
        },
        client: request.authClient,
      });

      return response.status(200).send({
        message: 'Schedule added',
        object: schedule,
      });
    } catch (error) {
      console.log(error);
      return next(new InternalError(error));
    }
  }

  async search(request: Request, response: Response) {
    const { authAccountId, authIsDealer } = request;
    const { sort, limit, page, filters } = GridQueryParser.parse(request.query);

    const { id, customerId } = request.params;
    // const { page, filters, s } = request.body;
    const { state, city } = filters as any;

    // const { authAccountId, authIsDealer} = request;

    let whereLocation: any = {};

    if (state) {
      whereLocation['state'] = state;
    }
    if (city) {
      whereLocation['city'] = city;
    }

    // TODO add searchable@inventoryStatus criteria
    // conditions.set("id",
    // )

    const where = getWhereInventory({
      filters: filters,
      pCustomerId: parseInt(id ?? customerId),
      isDealer: authIsDealer,
      authAccountId: authAccountId,
    });
    const results = await Inventory.findAndCountAll({
      attributes: INVENTORY_FIELDS,
      include: [
        {
          model: Account,
        },
        {
          model: Location,
          where: whereLocation,
        },
        {
          model: InventoryFile, // TODO remove after all images and docs are stored in new format
        },
        {
          model: InventoryType,
        },
        {
          model: InventoryStatus,
          where: {
            searchable: 1,
          },
        },
      ],
      where: where,
      offset: page ? (Number(page) - 1) * Number(limit) : undefined,
      limit: Number(limit),
      raw: true,
      nest: true,
      order: createSort(sort),
    });

    // const mlResults = await getMercadolibreResults(filters);
    // const output = {
    //   ...results,
    //   mlCount: mlResults.length,
    //   mlRows: mlResults,
    // };

    // const mlResults = await getMercadolibreResults(filters)
    // const output = {
    //   ...results,
    //   mlCount: mlResults.length,
    //   mlRows : mlResults
    // }

    return response.status(200).json(results);
  }

  async getConditions(_request: Request, response: Response, next: NextFunction) {
    const conditions = VEHICLE_CONDITIONS;
    try {
      return response.status(200).json(conditions);
    } catch (error: any) {
      console.log('Erro na obtenção das condições dos veículos');
      return next(new InventoryException());
    }
  }

  async getBrands(request: Request, response: Response) {
    request ?? request;
    try {
      const referenceCodes = await getReferenceCodes(); //TODO design a semistable way to store reference code

      const brands = await getBrands(referenceCodes.data[0].Codigo, CODIGO_TIPO_VEICULO);

      return response.status(200).send(brands.data);
    } catch (error: any) {
      console.log('Erro ao obter marcas: ', error);
    }
  }

  async getYears(req: Request, res: Response, next: NextFunction) {
    const { id, modelId } = req.params;
    if (!id) {
      return next(new InventoryArgumentMissingException('Falha id de Marca'));
    }
    if (!modelId) {
      return next(new InventoryArgumentMissingException('Falha id de Modelo'));
    }

    try {
      const codes = await getReferenceCodes();
      const lastCode = codes.data[0].Codigo;

      const years = await getYearsModels({
        codigoTabelaReferencia: lastCode,
        codigoTipoVeiculo: CODIGO_TIPO_VEICULO,
        codigoMarca: id,
        codigoModelo: modelId,
      });

      const body = years.data.map((x: any) => {
        const year = x.Value.split('-')[0];
        const fuel = x.Label.split(' ')[1];
        return {
          Value: x.Value,
          Label: (year === '32000' ? '0KM' : year) + ' ' + fuel,
        };
      });

      return res.status(200).send(body);
    } catch (error) {
      console.log('Erro em getYearModels: ', error);
      return next(new InventoryException());
    }
  }

  async getDescription(request: Request, response: Response, next: NextFunction) {
    const { id, modelId, yearId } = request.params;
    if (!id) {
      return next(new InventoryArgumentMissingException('Falha id de Marca'));
    }
    if (!modelId) {
      return next(new InventoryArgumentMissingException('Falha id de Modelo'));
    }
    if (!yearId) {
      return next(new InventoryArgumentMissingException('Falha id de Ano'));
    }

    const split = yearId.split('-');

    try {
      // const referenceCodes: any = await getReferenceCodes();
      // const codigoTabelaReferencia = referenceCodes.data[0].Codigo;
      // const description = await getDescription({
      //   codigoTabelaReferencia: codigoTabelaReferencia,
      //   codigoTipoVeiculo: CODIGO_TIPO_VEICULO,
      //   codigoMarca: id,
      //   codigoModelo: modelId,
      //   anoModelo: split[0],
      //   codigoTipoCombustivel: split[1],
      //   tipoConsulta: TIPO_CONSULTA,
      // });
      // if (description.data.erro) {
      //   return next(new InventoryException(description.data));
      // }
      // let data = description.data;
      // const formattedPrice = data.Valor.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
      const resp = await getModelProvider({
        pBrandCode: id,
        pModelCode: modelId,
        pYearCode: split[0],
        pFuelCode: split[1],
      });

      return response.status(200).send(resp);
    } catch (error: any) {
      console.log('Erro em getModels');
    }
  }

  async getModels(request: Request, response: Response, next: NextFunction) {
    const brandId = request.params.id;
    if (!brandId) {
      return next(new InventoryArgumentMissingException());
    }

    try {
      const referenceCodes: any = await getReferenceCodes();
      const codigoTabelaReferencia = referenceCodes.data[0].Codigo;

      const models = await getModels(codigoTabelaReferencia, CODIGO_TIPO_VEICULO, brandId);

      return response.status(200).send(models.data.Modelos);
    } catch (error) {
      console.log('Erro em getModels: ', error);
      return next(new InventoryException());
    }
  }

  async getColors(req: Request, res: Response, next: NextFunction) {
    req.query ?? {}; //Only do this because i can't compile params unused.
    try {
      const body = await Color.findAll({
        include: [],
        raw: true,
        order: [['id', 'asc']],
      });
      return res.status(200).send(body);
    } catch (error: any) {
      console.log('Erro em inventories colors: ', error);
      return next(new ColorFetchException());
    }
  }

  async getById(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;

    try {
      const inventory = await Inventory.findByPk(id, {
        include: [
          {
            model: InventoryFile,
          },
          {
            model: InventoryRevisions,
          },
          {
            model: Location,
          },
          {
            model: InventoryComment,
            include: [
              {
                model: Profile,
              },
            ],
            order: [['createdAt', 'DESC']],
          },
        ],
        nest: true,
      });

      if (!inventory) {
        return next(new InventoryNotFoundException());
      }

      return response.status(200).json(inventory);
    } catch (error) {
      console.log(error);
      return next(new InventoryNotFoundException());
    }
  }

  // PUBLIC SECTION

  async publicSearch(request: Request, response: Response) {
    const { page, filters, sort } = request.body;
    const { authAccountId, authIsDealer } = request;

    const where = getWhereInventory({
      filters: filters,
      isDealer: authIsDealer,
      authAccountId: authAccountId,
    });

    const body = await Inventory.findAndCountAll({
      where,
      attributes: INVENTORY_FIELDS,
      include: [
        {
          model: InventoryFile,
        },
      ],
      offset: page ? (page - 1) * 50 : undefined,
      limit: 50,
      nest: true,
      order: createSort(sort),
    });

    return response.status(200).json(body);
  }

  // *Create Comment
  async createComment(request: Request, response: Response, next: NextFunction) {
    try {
      const { authProfileId, body } = request;

      const record = await InventoryComment.create({
        ...body,
        userId: authProfileId,
      });
      return response.status(200).send(record);
    } catch (e) {
      console.log('error: ', e);
      return next(new InventoryCommentException());
    }
  }

  // *Get comment by primary key
  async getCommentById(request: Request, response: Response, next: NextFunction) {
    const { id = null } = request.params;
    if (!id) {
      return next(new InventoryCommentArgumentMissingException());
    }
    try {
      let record = await InventoryComment.findByPk(id, {
        include: [{ model: Inventory }],
      });
      return response.status(200).send(record);
    } catch (e) {
      console.log('error: ', e);
      return next(new InventoryComment());
    }
  }

  // * Update comment by ID
  async updateComment(request: Request, response: Response, next: NextFunction) {
    const { id = null } = request.params;
    if (!id) {
      return next(new InventoryCommentArgumentMissingException());
    }
    try {
      const updatedId = await InventoryComment.update(request.body, {
        where: { id: id },
      });
      return response.status(200).send({ updatedId });
    } catch (e) {
      console.log('error: ', e);
      return new InventoryCommentException();
    }
  }

  // *Find all comments
  async findAllComment(request: Request, response: Response, next: NextFunction) {
    request ?? request;
    try {
      const body = await InventoryComment.findAll({
        where: {},
        raw: true,
        order: [['id', 'asc']],
      });
      return response.status(200).send(body);
    } catch (e) {
      console.log('error: ', e);
      return next(new InventoryCommentException());
    }
  }

  // *Delete comment by ID
  async deleteComment(request: Request, response: Response, next: NextFunction) {
    const { id = null } = request.params;
    if (!id) {
      return next(new InventoryCommentArgumentMissingException());
    }
    try {
      const rta = await InventoryComment.destroy({
        where: {
          id: id,
        },
      });
      return response.status(200).send(rta);
    } catch (e) {
      console.log('error: ', e);
      return next(new InventoryCommentException());
    }
  }

  // *Find comments with post
  async searchComment(request: Request, response: Response, next: NextFunction) {
    const { sort, page, filters } = request.body;
    let where = getWhere(filters);
    try {
      const body = await InventoryComment.findAndCountAll({
        where,
        include: [
          { model: Inventory },
          // { model: User }
        ],
        offset: page ? (page - 1) * 50 : undefined,
        limit: 50,
        raw: true,
        order: createSort(sort),
      });
      return response.status(200).send(body);
    } catch (e) {
      console.log('error: ', e);
      return next(new InventoryCommentException());
    }
  }

  async getCommentsByInventory(request: Request, response: Response, next: NextFunction) {
    const { id: inventoryId } = request.params;
    const filters = { inventoryId, ...request.query };

    let where = getWhere(filters);
    try {
      const body = await InventoryComment.findAndCountAll({
        where,
        include: [
          { model: Inventory },
          // { model: User }
        ],
        limit: 50,
        raw: true,
        order: [['id', 'DESC']],
        // offset: page ? (page - 1) * 50 : undefined,
        // order: s ? Sequelize.literal(s.split("+").join(" ")) : [["id", "DESC"]],
      });
      return response.status(200).send(body);
    } catch (e) {
      console.log('error: ', e);
      return next(new InventoryCommentException());
    }
  }

  async publicSearchxId(request: Request, response: Response) {
    const { id } = request.params;

    const body = await Inventory.findByPk(id, {
      attributes: INVENTORY_FIELDS,
      include: [
        {
          model: InventoryFile,
        },
      ],
    });

    return response.status(200).json(body);
  }
}

export default InventoryController;
