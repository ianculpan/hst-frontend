import React from 'react';
import ActionMenu from './ActionMenu';
import { useModal } from './modals/ModalContext.jsx';
import StockView from './modals/crud/stock/StockView.jsx';
import { getProductTypeLabel, getProductTypeBadgeClasses } from '../helpers/data/productTypes.js';
//import StockEdit from './modals/crud/stock/StockEdit.jsx';
//import StockDelete from './modals/crud/stock/StockDelete.jsx';

const StockCard = ({ item, onPurchase }) => {
  const { openModal } = useModal();
  const { closeModal } = useModal();

  const viewModal = () => {
    openModal(<StockView item={item} closeModal={closeModal} />);
  };

  const actions = [
    {
      label: 'View Details',
      icon: '👁️',
      onClick: viewModal,
      description: 'See stock and movements',
    },
    {
      label: 'Purchase',
      icon: '🛒',
      onClick: () => onPurchase(item.product),
      className: 'text-green-600 hover:bg-green-50',
      description: 'Add to stock',
    },
  ];

  return (
    <div className="rounded-xl card p-4 space-y-2">
      <div className="text-xl card-title rounded-lg px-4 flex items-center justify-between">
        <div className="truncate">{item.product?.sku}</div>
        {item.product?.type && (
          <div
            className={`px-2 py-1 rounded text-xs ${getProductTypeBadgeClasses(item.product.type)}`}
          >
            {getProductTypeLabel(item.product.type)}
          </div>
        )}
        <ActionMenu actions={actions} />
      </div>

      <div className="card-text rounded-lg px-4 line-clamp-2">
        <span className="font-semibold">Description:</span> {item.product?.description}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="card-text rounded-lg px-4">
          <span className="font-semibold">UOI:</span> {item.product?.uoi}
        </div>
        <div className="card-text rounded-lg px-4">
          <span className="font-semibold">Tax:</span> {item.product?.taxRate}%
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="card-text rounded-lg px-4 text-sm">
          <span className="font-semibold">Sale:</span> £
          {parseFloat(item.product?.salePrice || 0).toFixed(2)}
        </div>
        <div className="card-text rounded-lg px-4 text-sm">
          <span className="font-semibold">Discount:</span> £
          {parseFloat(item.product?.discountPrice || 0).toFixed(2)}
        </div>
        <div className="card-text rounded-lg px-4 text-sm">
          <span className="font-semibold">Min:</span> £
          {parseFloat(item.product?.minSalePrice || 0).toFixed(2)}
        </div>
      </div>

      <div className="card-text rounded-lg px-4">
        <span className="font-semibold">Location:</span> {item.location}
      </div>

      <div className="card-text rounded-lg px-4">
        <span className="font-semibold">Quantity:</span> {parseFloat(item.quantity || 0).toFixed(2)}
      </div>
    </div>
  );
};

export default StockCard;
