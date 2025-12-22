const calculatePricesFromMarkup = (item) => {
  const quantity = parseFloat(item.quantity) || 0;
  const allocated = parseFloat(item.allocatedCost) || 0;
  const unitCost = quantity > 0 ? allocated / quantity : 0;
  const retailPct = parseFloat(item.newProduct.retailMarkupPercent) || 0;
  const discountPct = parseFloat(item.newProduct.discountMarkupPercent) || 0;
  const minPct = parseFloat(item.newProduct.minMarkupPercent) || 0;

  const salePrice = unitCost * (1 + retailPct / 100);
  const discountPrice = unitCost * (1 + discountPct / 100);
  const minSalePrice = unitCost * (1 + minPct / 100);

  return {
    salePrice: salePrice ? salePrice.toFixed(2) : '',
    discountPrice: discountPrice ? discountPrice.toFixed(2) : '',
    minSalePrice: minSalePrice ? minSalePrice.toFixed(2) : '',
  };
};

export default calculatePricesFromMarkup;
