/**
 * Generic master lookup utility
 *
 * @param {Object} masters - full master data object
 * @param {String} masterKey - "departments", "cities", "jobGrade", etc.
 * @param {String} id - ID to search
 * @param {String} idKey - ID field name in that master
 * @returns {Object|null}
 */
export const getMasterById = (
  masters,
  masterKey,
  id,
  idKey = "id"
) => {
  if (!masters || !masterKey || !id) {
    return null;
  }

  const list = masters[masterKey];   
  if (!Array.isArray(list)) {
    return null;
  }

  const found = list.find(item => item[idKey] === id);
  return found || null;
};
