/**
 * Map interview centres API response to UI-friendly model
 */
export const mapInterviewCentresApi = (apiResponse) => {
  const list = apiResponse.data || [];

  if (!Array.isArray(list)) return [];

  return list.map(item => ({
    id: item.interviewCentreId || "",
    Interview_Centre: item.interviewCentre || "",
  }));
};
