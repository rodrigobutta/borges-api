const axios = require('axios');

export const getCEP = async (cep: number) => await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
