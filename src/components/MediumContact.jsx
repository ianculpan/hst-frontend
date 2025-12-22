const MediumContact = ({ contact }) => {
  const customerName = contact.businessAccount
    ? contact.businessName
    : contact.firstName + ' ' + contact.secondName;

  return (
    <div className="">
      <div className="text-base">{customerName}</div>
      <div className="text-sm">{contact.address1}</div>
      <div className="text-sm">{contact.address2}</div>
      <div className="text-sm">{contact.address3}</div>
      <div className="text-sm">{contact.postTown}</div>
      <div className="text-sm">{contact.county}</div>
      <div className="text-sm">{contact.postCode}</div>
    </div>
  );
};

export default MediumContact;
