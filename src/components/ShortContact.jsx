const ShortContact = ({ contact }) => {
  const customer = contact.businessAccount
    ? contact.businessName
    : contact.firstName + ' ' + contact.secondName;

  return <div className="text-sm">{customer}</div>;
};

export default ShortContact;
