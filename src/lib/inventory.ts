import InventoryException from '../exceptions/InventoryException';
import { Account } from '../models/Account';
import { Inventory } from '../models/Inventory';
import { InventoryFile } from '../models/InventoryFile';
import { InventoryStatus } from '../models/InventoryStatus';
import { InventoryType } from '../models/InventoryType';
import { Location } from '../models/Location';
import { CODIGO_TIPO_VEICULO, getDescription, getReferenceCodes, TIPO_CONSULTA } from '../providers/fipe';
import { checkIsValidIdOrCode, getStatusIdFromStatusCode } from '../utils/statusUtils';

export const getInventoryById: any = async (inventoryId: number) => {
  const inventory = await Inventory.findOne({
    attributes: [
      'accountId',
      'borgesPrice',
      'assemblyYear',
      'certificatePlate',
      'certificateVerification',
      'color',
      'createdAt',
      'id',
      'imageCover',
      'imageExteriorBack',
      'imageExteriorFront',
      'imageExteriorLeft',
      'imageExteriorRight',
      'imageInteriorBack',
      'imageInteriorDashboard',
      'imageInteriorFront',
      'imageInteriorTrunk',
      'imageOther1',
      'imageOther2',
      'imageOther3',
      'inactive',
      'inventoryStatusId',
      'locationId',
      'licensePlate',
      'mileage',
      'saleValuation',
      'sold',
      'type',
      'updatedAt',
      'vehicleBrandName',
      'vehicleConditionId',
      'vehicleConditionName',
      'vehicleDescription',
      'vehicleFamilyName',
      'vehicleFuelName',
      'vehicleGeneralConditionId',
      'vehicleMadeInName',
      'vehicleModelName',
      'vehiclePriceAmount',
      'vehiclePriceCurrency',
      'vehicleYear',
      'vin',
      'year',
    ],
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
    where: {
      id: inventoryId,
    },
    raw: true,
    nest: true,
  });

  return inventory;
};

export const changeInventoryStatus = async ({
  inventoryId,
  statusId,
  statusCode,
}: {
  inventoryId: number;
  statusId?: number;
  statusCode?: string;
}) => {
  if (!statusId && !statusCode) {
    // if both undefined throw error
    throw new Error('Need to specify statusId or statusCode');
  }
  if (statusId !== undefined) {
    // statusId may be 0, if(statusId) may fail that case
    if (!(await checkIsValidIdOrCode({ model: InventoryStatus, id: statusId }))) {
      throw new Error('statusId provided is not valid');
    }
    await Inventory.update(
      {
        inventoryStatusId: statusId,
      },
      {
        where: {
          id: inventoryId,
        },
      },
    );
  } else if (statusCode) {
    if (!(await checkIsValidIdOrCode({ model: InventoryStatus, code: statusCode }))) {
      throw new Error('statusCode provided is not valid');
    }
    const foundId = await getStatusIdFromStatusCode(InventoryStatus, statusCode);
    if (!foundId) {
      throw new Error('No statusId was found for this statusCode');
    }
    await Inventory.update(
      {
        inventoryStatusId: foundId,
      },
      {
        where: {
          id: inventoryId,
        },
      },
    );
  }
};

export const getModelProvider = async ({
  pBrandCode,
  pModelCode,
  pYearCode,
  pFuelCode,
}: {
  pBrandCode: string;
  pModelCode: string;
  pYearCode: string;
  pFuelCode: string;
}) => {
  const referenceCodes: any = await getReferenceCodes();
  const codigoTabelaReferencia = referenceCodes.data[0].Codigo;
  const description = await getDescription({
    codigoTabelaReferencia: codigoTabelaReferencia,
    codigoTipoVeiculo: CODIGO_TIPO_VEICULO,
    codigoMarca: pBrandCode,
    codigoModelo: pModelCode,
    anoModelo: pYearCode,
    codigoTipoCombustivel: pFuelCode,
    tipoConsulta: TIPO_CONSULTA,
  });
  if (description.data.erro) {
    return new InventoryException(description.data);
  }
  let data = description.data;
  const formattedPrice = data.Valor.replace('R$ ', '').replace(/\./g, '').replace(',', '.');

  return {
    brand: data.Marca,
    fuelName: data.Combustivel,
    fuelId: pFuelCode,
    fipeCode: data.CodigoFipe,
    priceAmount: formattedPrice,
    new: pYearCode === '32000',
    model: data.Modelo,
    year: pYearCode !== '32000' ? pYearCode : new Date().getFullYear(),
  };
};
