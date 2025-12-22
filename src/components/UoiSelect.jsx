import React from 'react';

const UoiSelect = ({ value, onChange, required = false }) => {
  return (
    <>
      <label htmlFor="uoi" className="block text-gray-700 font-semibold">
        Unit of Issue (UOI)
      </label>
      <select
        id="uoi"
        name="uoi"
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
      >
        <option value="">Select UOI</option>
        <option value="each">Each</option>
        <option value="kg">Kilogram (kg)</option>
        <option value="g">Gram (g)</option>
        <option value="l">Liter (L)</option>
        <option value="ml">Milliliter (ml)</option>
        <option value="m">Meter (m)</option>
        <option value="cm">Centimeter (cm)</option>
        <option value="box">Box</option>
        <option value="pk2">Pack of 2</option>
        <option value="pk5">Pack of 5</option>
        <option value="pk10">Pack of 10</option>
        <option value="pk20">Pack of 20</option>
        <option value="pk50">Pack of 50</option>
        <option value="pk100">Pack of 100</option>
        <option value="set">Set</option>
        <option value="hour">Hour</option>
        <option value="day">Day</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>
    </>
  );
};

export default UoiSelect;
