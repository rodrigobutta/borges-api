const axios = require('axios');

export const CODIGO_TIPO_VEICULO = '1';
export const TIPO_CONSULTA = 'tradicional';

export const getReferenceCodes = async () =>
  await axios.post('https://veiculos.fipe.org.br/api/veiculos//ConsultarTabelaDeReferencia');

export const getBrands = async (codigoTabelaReferencia: string, codigoTipoVeiculo: string) =>
  await axios.post('https://veiculos.fipe.org.br/api/veiculos//ConsultarMarcas', {
    codigoTabelaReferencia,
    codigoTipoVeiculo,
  });

export const getModels = async (codigoTabelaReferencia: string, codigoTipoVeiculo: string, codigoMarca: string) =>
  await axios.post('https://veiculos.fipe.org.br/api/veiculos//ConsultarModelos', {
    codigoTabelaReferencia,
    codigoTipoVeiculo,
    codigoMarca,
  });

interface YearsModelsProps {
  codigoTabelaReferencia: string;
  codigoTipoVeiculo: string;
  codigoMarca: string;
  codigoModelo: string;
}
export const getYearsModels = async ({
  codigoTabelaReferencia,
  codigoTipoVeiculo,
  codigoMarca,
  codigoModelo,
}: YearsModelsProps) =>
  await axios.post('https://veiculos.fipe.org.br/api/veiculos//ConsultarAnoModelo', {
    codigoTabelaReferencia,
    codigoTipoVeiculo,
    codigoMarca,
    codigoModelo,
  });

interface DescriptionProps {
  codigoTabelaReferencia: string;
  codigoTipoVeiculo: string;
  codigoMarca: string;
  codigoModelo: string;
  anoModelo: string;
  codigoTipoCombustivel: string;
  tipoConsulta: string;
}
export const getDescription = async ({
  codigoTabelaReferencia,
  codigoTipoVeiculo,
  codigoMarca,
  codigoModelo,
  anoModelo,
  codigoTipoCombustivel,
  tipoConsulta,
}: DescriptionProps) =>
  axios.post('https://veiculos.fipe.org.br/api/veiculos//ConsultarValorComTodosParametros', {
    codigoTabelaReferencia,
    codigoTipoVeiculo,
    codigoMarca,
    codigoModelo,
    anoModelo,
    codigoTipoCombustivel,
    tipoConsulta,
  });
