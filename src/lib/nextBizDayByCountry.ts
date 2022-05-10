const luxBizDays = require('luxon-business-days');

const brazilFederalDaysMatcher = function (dtInput: any) {
  const cleanTimeDate = luxBizDays.DateTime.fromObject({
    //Removing hours, minutes, seconds, and ms
    // year: dtInput.getFullYear(), month: dtInput.getMonth(), day: dtInput.getDay()

    year: dtInput.year,
    month: dtInput.month,
    day: dtInput.day,
  });

  // Fixed Dates, every year same date.

  const newYearDate = luxBizDays.DateTime.fromObject({ month: 1, day: 1 }); // New Year - Fixed Date
  const tridantesDate = luxBizDays.DateTime.fromObject({ month: 4, day: 21 }); // Tridante Date - Fixed Date
  const workerDayDate = luxBizDays.DateTime.fromObject({ month: 5, day: 1 }); // Workers Day - Fixed Date
  // const assumOfMDate  = luxBizDays.DateTime.fromObject({month:8, day: 15}) // Assumption of Mary Removed notInExcelShared
  const indepDayDate = luxBizDays.DateTime.fromObject({ month: 9, day: 7 }); // Independence Day - Fixed Date
  const nossaSenDate = luxBizDays.DateTime.fromObject({ month: 10, day: 12 }); // Nossa Senhora - Fixed Date
  const FinadosDate = luxBizDays.DateTime.fromObject({ month: 11, day: 2 }); // Day of Dead - Fixed Date
  const procOfRepDate = luxBizDays.DateTime.fromObject({ month: 11, day: 15 }); // Proclamation of Republic - Fixed Date
  const christmasDate = luxBizDays.DateTime.fromObject({ month: 12, day: 25 }); // Christmas - Fixed Date

  // Variable Dates (Depending on Moon Calendar)

  var todayIsvariableHolidayDateFlag = false;

  const variableHolidayDates = [
    '2021-02-15',
    '2021-02-16',
    '2021-04-02',
    '2021-06-03',
    '2022-02-28',
    '2022-03-01',
    '2022-04-15',
    '2022-06-16',
    '2023-02-20',
    '2023-02-21',
    '2023-04-07',
    '2023-06-08',
    '2024-02-12',
    '2024-02-13',
    '2024-03-29',
    '2024-05-30',
    '2025-03-03',
    '2025-03-04',
    '2025-04-18',
    '2025-06-19',
    '2026-02-16',
    '2026-02-17',
    '2026-04-03',
    '2026-06-04',
    '2027-02-08',
    '2027-02-09',
    '2027-03-26',
    '2027-05-27',
    '2028-02-28',
    '2028-02-29',
    '2028-04-14',
    '2028-06-15',
    '2029-02-12',
    '2029-02-13',
    '2029-03-30',
    '2029-05-31',
    '2030-03-04',
    '2030-03-05',
    '2030-04-19',
    '2030-06-20',
    '2031-02-24',
    '2031-02-25',
    '2031-04-11',
    '2032-02-09',
    '2032-02-10',
    '2032-03-26',
    '2032-05-27',
    '2033-02-28',
    '2033-03-01',
    '2033-04-15',
    '2033-06-16',
    '2034-02-20',
    '2034-02-21',
    '2034-04-07',
    '2034-06-08',
    '2034-09-07',
    '2035-02-05',
    '2035-02-06',
    '2035-03-23',
    '2035-05-24',
    '2036-02-25',
    '2036-02-26',
    '2036-04-11',
    '2036-06-12',
    '2037-02-16',
    '2037-02-17',
    '2037-04-03',
    '2037-06-04',
    '2038-03-08',
    '2038-03-09',
    '2038-04-23',
    '2038-06-24',
    '2039-02-21',
    '2039-02-22',
    '2039-04-08',
    '2039-06-09',
    '2040-02-13',
    '2040-02-14',
    '2040-03-30',
    '2040-05-31',
    '2041-03-04',
    '2041-03-05',
    '2041-04-19',
    '2041-06-20',
  ];

  if (cleanTimeDate.year > 2041) {
    throw 'Warning, need to add future holidays';
  } else if (variableHolidayDates.includes(cleanTimeDate.toFormat('yyyy-MM-dd').toString())) {
    todayIsvariableHolidayDateFlag = true;
  }

  // Need to add Holy Week and Carnaval
  // Need to add Corpus Christi

  return (
    +cleanTimeDate === +newYearDate ||
    +cleanTimeDate === +tridantesDate ||
    +cleanTimeDate === +workerDayDate ||
    +cleanTimeDate === +christmasDate ||
    +cleanTimeDate === +indepDayDate ||
    +cleanTimeDate === +nossaSenDate ||
    +cleanTimeDate === +FinadosDate ||
    +cleanTimeDate === +procOfRepDate ||
    todayIsvariableHolidayDateFlag
  );
};

export default (date: any, country: string = 'BR') => {
  // This function receives a JSDate pulled from the database with sequelize.
  // Only working for Brazil. Can be extended to other countries if needed.

  const dateToCheck = luxBizDays.DateTime.fromJSDate(date);

  if (country === 'BR') {
    dateToCheck.setupBusiness({ holidayMatchers: [brazilFederalDaysMatcher] });
    const auxDate = dateToCheck.minus({ days: 1 }); // minus(1) since plusBusiness finds the <<next>> Biz Day.
    const nextBiz = auxDate.plusBusiness().toFormat('yyyy-MM-dd');
    return nextBiz;
  } else {
    throw 'Wrong Country Tag: ' + country;
  }
};
