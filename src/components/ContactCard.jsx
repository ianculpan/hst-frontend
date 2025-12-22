import CrudButtons from './CrudButtons';
import { useModal } from './modals/ModalContext.jsx';
import ContactView from './modals/crud/contact/ContactView.jsx';
import ContactEdit from './modals/crud/contact/ContactEdit.jsx';
import ContactDelete from './modals/crud/contact/ContactDelete.jsx';

const ContactCard = ({ item, onUpdate }) => {
  const {
    accountNumber,
    salutation,
    firstName,
    secondName,
    businessName,
    address1,
    address2,
    address3,
    postTown,
    county,
    postCode,
    contactPhone,
    active,
    businessAccount,
    businessContact,
  } = item;

  const { openModal } = useModal();
  const { closeModal } = useModal();

  const viewModal = () => {
    openModal(<ContactView item={item} />);
  };
  const editModal = () => {
    openModal(<ContactEdit item={item} closeModal={closeModal} onUpdate={onUpdate} />);
  };
  const deleteModal = () => {
    openModal(<ContactDelete item={item} closeModal={closeModal} onUpdate={onUpdate} />);
  };

  const displayName = businessContact
    ? businessName
    : `${salutation} ${firstName} ${secondName}`.trim();

  return (
    <div className="rounded-xl card p-4 space-y-2">
      <div className="text-xl card-title rounded-lg px-4 flex items-center justify-between">
        <div className="truncate">{displayName}</div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded text-xs ${active ? 'bg-green-600' : 'bg-red-600'}`}>
            {active ? 'Active' : 'Inactive'}
          </div>
          <CrudButtons onView={viewModal} onEdit={editModal} onDelete={deleteModal} />
        </div>
      </div>
      <div className="card-text rounded-lg px-4">
        <span className="font-semibold">Account:</span> {accountNumber}
      </div>
      {businessContact && (
        <div className="card-text rounded-lg px-4">
          <span className="font-semibold">Business Account:</span> {businessAccount ? 'Yes' : 'No'}
        </div>
      )}
      {contactPhone && (
        <div className="card-text rounded-lg px-4">
          <span className="font-semibold">Phone:</span> {contactPhone}
        </div>
      )}
      <div className="card-text rounded-lg px-4 line-clamp-2">
        <span className="font-semibold">Address:</span>{' '}
        {[address1, address2, address3, postTown, county, postCode].filter(Boolean).join(', ')}
      </div>
    </div>
  );
};

export default ContactCard;
