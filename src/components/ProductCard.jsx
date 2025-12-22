import CrudButtons from './CrudButtons';
import { useModal } from './modals/ModalContext.jsx';
import ProductView from './modals/crud/product/ProductView.jsx';
import ProductEdit from './modals/crud/product/ProductEdit.jsx';
import ProductDelete from './modals/crud/product/ProductDelete.jsx';
import { getProductTypeLabel, getProductTypeBadgeClasses } from '../helpers/data/productTypes.js';

const ProductCard = ({ item, onUpdate }) => {
  const {
    _id,
    sku,
    description,
    type,
    uoi,
    salePrice,
    discountPrice,
    minSalePrice,
    taxRate,
    updatedAt,
  } = item;

  const { openModal } = useModal();
  const { closeModal } = useModal();

  const viewModal = () => {
    openModal(<ProductView item={item} />);
  };
  const editModal = () => {
    openModal(<ProductEdit item={item} closeModal={closeModal} onUpdate={onUpdate} />);
  };
  const deleteModal = () => {
    openModal(<ProductDelete item={item} closeModal={closeModal} onUpdate={onUpdate} />);
  };

  const formatPrice = (price) => {
    return price ? `£${parseFloat(price).toFixed(2)}` : 'Not set';
  };

  return (
    <div className="rounded-xl card p-4 space-y-2">
      <div className="text-xl card-title rounded-lg px-4 flex items-center justify-between">
        <div className="truncate">{sku}</div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded text-xs ${getProductTypeBadgeClasses(type)}`}>
            {getProductTypeLabel(type)}
          </div>
          <CrudButtons onView={viewModal} onEdit={editModal} onDelete={deleteModal} />
        </div>
      </div>

      <div className="card-text rounded-lg px-4 line-clamp-2">
        <span className="font-semibold">Description:</span> {description}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="card-text rounded-lg px-4">
          <span className="font-semibold">UOI:</span> {uoi}
        </div>
        <div className="card-text rounded-lg px-4">
          <span className="font-semibold">Tax:</span> {taxRate}%
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-indigo-500 rounded-lg px-4 text-sm">
          <span className="font-semibold">Sale:</span> {formatPrice(salePrice)}
        </div>
        <div className="card-text rounded-lg px-4 text-sm">
          <span className="font-semibold">Discount:</span> {formatPrice(discountPrice)}
        </div>
        <div className="card-text rounded-lg px-4 text-sm">
          <span className="font-semibold">Min:</span> {formatPrice(minSalePrice)}
        </div>
      </div>

      <div className="card-text rounded-lg px-4 text-xs text-center">
        <span className="font-semibold">Updated:</span> {new Date(updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default ProductCard;
