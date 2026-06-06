import { addDays, intervalToDuration, parseISO } from "date-fns";

// const getMonthsOfExp = (fromDate, toDate, isPresentlyWorking) => {
//   if (!fromDate) return 0;

//   const start = parseISO(fromDate);
//   const end = isPresentlyWorking ? new Date() : (toDate ? parseISO(toDate) : null);

//   if (!end) return 0;

//   const duration = intervalToDuration({ start, end });

//   return (duration.years || 0) * 12 + (duration.months || 0);
// };

const getMonthsOfExp = (fromDate, toDate, isPresentlyWorking) => {
  if (!fromDate) return 0;

  const start = parseISO(fromDate);
  const rawEnd = isPresentlyWorking ? new Date() : (toDate ? parseISO(toDate) : null);

  if (!rawEnd) return 0;

  const end = addDays(rawEnd, 1); // include last day
  const duration = intervalToDuration({ start, end });

  return (duration.years || 0) * 12 + (duration.months || 0);
};

export const mapExperienceDetailsFormToApi = (item, candidateId) => ({
  organizationName: item.organization,
  role: item.role,
  postHeld: item.postHeld,
  fromDate: item.from,
  toDate: item.working === "Yes" ? null : item.to,
  isPresentlyWorking: item.working,
  workDescription: item.description,
  currentCtc: item.currentCTC,
  // monthsOfExp: Math.floor(item.experience / 30),
  monthsOfExp: getMonthsOfExp(
    item.from,
    item.to,
    item.working === true || item.working === "Yes"
  ),
  candidateId,
  createdBy: candidateId, // assuming same user
  isActive: true,
});

// mappers/ExperienceMapper.js
export const mapExperienceApiToUi = (apiItem) => {
  const exp = apiItem.workExperience;
  const doc = apiItem.documentStore;

  const from = exp.fromDate;
  const to = exp.toDate;

  let experienceDays = 0;
  if (from) {
    const start = new Date(from);
    const end = exp.isPresentlyWorking ? new Date() : (to ? new Date(to) : null);
    if (end) {
      experienceDays = Math.floor((end - start) / (1000 * 60 * 60 * 24) + 1);
    }
  }

  return {
    // 🔑 backend IDs (you WILL need these later)
    workExperienceId: exp.workExperienceId,
    documentId: doc?.documentId,
    documentStoreId: doc?.id,

    // experience fields (UI-friendly)
    organization: exp.organizationName,
    role: exp.role,
    postHeld: exp.postHeld,
    from,
    to,
    working: exp.isPresentlyWorking ? "Yes" : "No",
    description: exp.workDescription,
    currentCTC: exp.currentCtc,

    // derived
    experience: experienceDays,
    monthsOfExp: exp.monthsOfExp,

    // certificate info (critical)
    certificate: doc
      ? {
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        displayName: doc.displayName,
      }
      : null,
  };
};
