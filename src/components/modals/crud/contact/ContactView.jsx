const ContactView = ({ item }) => {
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

  const displayName = businessContact
    ? businessName
    : `${salutation} ${firstName} ${secondName}`.trim();

  return (
    <div className="rounded-xl bg-indigo-400 text-stone-100 p-4 space-y-2">
      <div className="text-xl bg-indigo-600 rounded-lg px-4 flex items-center justify-between">
        <div className="">{displayName}</div>
        <div className={`px-2 py-1 rounded text-xs ${active ? 'bg-green-600' : 'bg-red-600'}`}>
          {active ? 'Active' : 'Inactive'}
        </div>
      </div>
      <div className="bg-indigo-500 rounded-lg px-4">
        <span className="font-semibold">Account Number:</span> {accountNumber}
      </div>
      {businessContact && (
        <div className="bg-indigo-500 rounded-lg px-4">
          <span className="font-semibold">Business Account:</span> {businessAccount ? 'Yes' : 'No'}
        </div>
      )}
      {contactPhone && (
        <div className="bg-indigo-500 rounded-lg px-4">
          <span className="font-semibold">Phone:</span> {contactPhone}
        </div>
      )}
      <div className="bg-indigo-500 rounded-lg px-4">
        <span className="font-semibold">Address:</span>{' '}
        {[address1, address2, address3, postTown, county, postCode].filter(Boolean).join(', ')}
      </div>
    </div>
  );
};

export default ContactView;
