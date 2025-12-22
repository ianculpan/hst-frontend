const ProductView = ({ item }) => {
  const {
    sku,
    description,
    type,
    uoi,
    salePrice,
    discountPrice,
    minSalePrice,
    taxRate,
    createdAt,
    updatedAt,
  } = item;

  const formatPrice = (price) => {
    return price ? `£${parseFloat(price).toFixed(2)}` : 'Not set';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStockTotal = (stocks) => {
    if (!Array.isArray(stocks) || stocks.length === 0) return null;
    const total = stocks.reduce((sum, s) => {
      const q = parseFloat(s?.quantity ?? 0);
      return sum + (isNaN(q) ? 0 : q);
    }, 0);
    return total;
  };

  return (
    <div className="rounded-xl bg-indigo-400 text-stone-100 p-4 space-y-2">
      <div className="text-xl bg-indigo-600 rounded-lg px-4 flex items-center justify-between">
        <div className="truncate">{sku}</div>
        <div className="px-2 py-1 rounded text-xs bg-indigo-500">{type}</div>
      </div>

      <div className="bg-indigo-500 rounded-lg px-4">
        <span className="font-semibold">Description:</span> {description}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="bg-indigo-500 rounded-lg px-4">
          <span className="font-semibold">Unit of Issue:</span> {uoi}
        </div>
        <div className="bg-indigo-500 rounded-lg px-4">
          <span className="font-semibold">Tax Rate:</span> {taxRate}%
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="bg-indigo-500 rounded-lg px-4">
          <span className="font-semibold">Stock Total:</span>{' '}
          {getStockTotal(item?.stocks) !== null ? getStockTotal(item.stocks).toFixed(2) : 'Not set'}
        </div>
      </div>

      {Array.isArray(item?.stocks) && item.stocks.length > 0 && (
        <div className="bg-indigo-500 rounded-lg px-4 py-2">
          <div className="font-semibold mb-1">Stock Breakdown</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            {item.stocks.map((s, idx) => (
              <div key={idx} className="bg-indigo-400 rounded px-3 py-1">
                <div className="flex justify-between">
                  <span className="opacity-90">{s.location || 'Location'}</span>
                  <span>
                    {(() => {
                      const q = parseFloat(s?.quantity ?? 0);
                      return isNaN(q) ? '0.00' : q.toFixed(2);
                    })()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-indigo-500 rounded-lg px-4">
          <span className="font-semibold">Sale Price:</span> {formatPrice(salePrice)}
        </div>
        <div className="bg-indigo-500 rounded-lg px-4">
          <span className="font-semibold">Discount Price:</span> {formatPrice(discountPrice)}
        </div>
        <div className="bg-indigo-500 rounded-lg px-4">
          <span className="font-semibold">Min Sale Price:</span> {formatPrice(minSalePrice)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="bg-indigo-500 rounded-lg px-4 text-xs">
          <span className="font-semibold">Created:</span> {formatDate(createdAt)}
        </div>
        <div className="bg-indigo-500 rounded-lg px-4 text-xs">
          <span className="font-semibold">Last Updated:</span> {formatDate(updatedAt)}
        </div>
      </div>
    </div>
  );
};

export default ProductView;
