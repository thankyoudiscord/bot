module.exports = {
  ...require('gts/.prettierrc.json'),
  importOrder: ['<THIRD_PARTY_MODULES>', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
