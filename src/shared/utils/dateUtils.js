/**
 * Formats a date to DD-MM-YYYY
 * @param {string | Date | null | undefined} date
 * @returns {string}
 */
export const formatDateDDMMYYYY = (date) => {
  if (!date) return "-";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return d
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-");
};
