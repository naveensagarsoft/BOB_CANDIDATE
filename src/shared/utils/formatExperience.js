export const formatExperience = (months = 0) => {
  if (!months || months <= 0) return "0 Years";

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  const yearText =
    years > 0
      ? `${years} ${years === 1 ? "Year" : "Years"}`
      : "";

  const monthText =
    remainingMonths > 0
      ? `${remainingMonths} ${remainingMonths === 1 ? "Month" : "Months"}`
      : "";

  return [yearText, monthText].filter(Boolean).join(" ");
};


// =========================
// EDUCATION EXPERIENCE HELPERS
// =========================
export const mapEduExperience = (expObj, educationLevels = []) => {
  if (!expObj) return [];

  return Object.entries(expObj).map(([eduId, months]) => {
    const edu = educationLevels.find(
      e => e.education_level_id?.trim() === eduId?.trim()
    );

    return {
      education: edu?.education_level_name || "Unknown",
      experience: formatExperience(months)
    };
  });
};

export const formatEduExperienceText = (data = []) => {
  if (!data.length) return "";

  return data
    .map(item => `${item.education} : ${item.experience}`)
    .join(" / ");
};