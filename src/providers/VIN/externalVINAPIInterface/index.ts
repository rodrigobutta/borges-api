import fetch from 'node-fetch';
//const VIN = "VF34C5FU8DS005148";
//const VIN = "3FADP4FJ1DM132889";
const precision = 0;
const format = 'json';
const apiKey = '281a35dcea6d7e2a751b7b726236c4bc';
const host = 'http://api.automo24.com/api';

// module.exports = async (VIN:string) => {
export async function VinApi(VIN: string) {
  let rta, api;

  api = `${host}/${apiKey}/${VIN}/${precision}/${format}`;
  rta = await fetch(api);
  rta = await rta.json();
  return rta;
}
