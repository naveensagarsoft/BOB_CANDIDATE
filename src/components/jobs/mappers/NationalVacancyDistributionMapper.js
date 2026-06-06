export const mapNationalVacancyDistributions = (
  nationalDistributions,
  reservationCategories,
  disabilities
) => {
  if (!Array.isArray(nationalDistributions)) return null;

  const result = {
    total: 0,
    categories: {},
    disability: {}
  };

  nationalDistributions.forEach(item => {
    result.total += item.vacancyCount || 0;

    if (item.reservationCategoryId && !item.isDisability) {
      result.categories[item.reservationCategoryId] =
        (result.categories[item.reservationCategoryId] || 0) +
        item.vacancyCount;
    }

    if (item.disabilityCategoryId && item.isDisability) {
      result.disability[item.disabilityCategoryId] =
        (result.disability[item.disabilityCategoryId] || 0) +
        item.vacancyCount;
    }
  });

  return result; // 🔴 NOT an array
};
