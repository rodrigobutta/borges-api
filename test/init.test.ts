const assert = require('assert');
// const { fullnamesPrettyPrint, getFullName, isAlphabetic } = require('../src/helpers');

describe('Grab [][]', () => {
  it('grab [][][][]', () => {
    const str = 'accountPermissions_accountId[58]_accounrGroupPermissionId[7]';

    const result = str.match(/\[(.*?)\]/g).map(function (val) {
      return val.replace(/[\[,\]]/g, '');
    });

    assert.strictEqual(result, [3, 6]);
  });
});

// describe('Alphabetic', () => {

//     it('String has only letters', () => {
//         assert.strictEqual(
//             isAlphabetic('Rodrigo'),
//             true
//         );
//     });

// });

// describe('Fullname pretty printing', () => {

//     it('FullName pretty print with multiple names', () => {
//         assert.deepStrictEqual(
//             fullnamesPrettyPrint([{
//                 first: 'Rodrigo',
//                 last: 'Butta'
//             }, {
//                 first: 'Eduardo',
//                 last: 'Butta'
//             }]),
//             ['Butta, Rodrigo', 'Butta, Eduardo']
//         );
//     });

// });
