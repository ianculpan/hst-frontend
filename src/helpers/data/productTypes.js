/**
 * Product Types Data Provider
 * Provides product type definitions with labels and color tags
 */

export const productTypes = [
  {
    value: 'NEW',
    label: 'New',
    color: 'bg-blue-600',
    textColor: 'text-white',
  },
  {
    value: 'IN_PROGRESS',
    label: 'In Progress',
    color: 'bg-green-600',
    textColor: 'text-white',
  },
  {
    value: 'INTERNET',
    label: 'Internet',
    color: 'bg-purple-600',
    textColor: 'text-white',
  },
  {
    value: 'DISPOSAL',
    label: 'Disposal',
    color: 'bg-orange-600',
    textColor: 'text-white',
  },
  {
    value: 'HOLD',
    label: 'On Hold',
    color: 'bg-yellow-600',
    textColor: 'text-white',
  },
];

/**
 * Get product type by value
 * @param {string} value - Product type value (e.g., 'PHYSICAL')
 * @returns {Object|null} Product type object or null if not found
 */
export const getProductType = (value) => {
  return productTypes.find((type) => type.value === value) || null;
};

/**
 * Get color class for product type
 * @param {string} value - Product type value
 * @returns {string} Tailwind color class
 */
export const getProductTypeColor = (value) => {
  const type = getProductType(value);
  return type ? type.color : 'bg-gray-600';
};

/**
 * Get text color class for product type
 * @param {string} value - Product type value
 * @returns {string} Tailwind text color class
 */
export const getProductTypeTextColor = (value) => {
  const type = getProductType(value);
  return type ? type.textColor : 'text-white';
};

/**
 * Get label for product type
 * @param {string} value - Product type value
 * @returns {string} Product type label
 */
export const getProductTypeLabel = (value) => {
  const type = getProductType(value);
  return type ? type.label : value;
};

/**
 * Get full color classes for product type badge
 * @param {string} value - Product type value
 * @returns {string} Combined color classes for badge
 */
export const getProductTypeBadgeClasses = (value) => {
  const type = getProductType(value);
  if (!type) return 'bg-gray-600 text-white';
  return `${type.color} ${type.textColor}`;
};
