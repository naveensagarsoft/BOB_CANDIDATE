// Map Address Details form -> API Payload
export const mapAddressFormToApi = ({
  corrAddress,
  permAddress,
  sameAsCorrespondence,
  candidateId
}) => {
  return {
    isActive: true,
    candidateId: candidateId,
		candidateProfileId: candidateId,  // TEMP FIX
    // -------- Correspondence Address --------
    addressLine1: corrAddress.line1 || "",
    addressLine2: corrAddress.line2 || "",
    landmark: "",

    stateId: corrAddress.state || "",
    districtId: corrAddress.district || "",   // backend wants string / id hybrid
    city: corrAddress.city || "",
    pincode: corrAddress.pincode || "",

    // -------- Permanent Address --------
    permanentAddressLine1: sameAsCorrespondence
      ? corrAddress.line1
      : permAddress.line1 || "",

    permanentAddressLine2: sameAsCorrespondence
      ? corrAddress.line2
      : permAddress.line2 || "",

    permanentLandmark: "",

    permanentStateId: sameAsCorrespondence
      ? corrAddress.state
      : permAddress.state || "",

    permanentDistrictId: sameAsCorrespondence
      ? corrAddress.district
      : permAddress.district || "",

    permanentCity: sameAsCorrespondence
      ? corrAddress.city
      : permAddress.city || "",

    permanentPincode: sameAsCorrespondence
      ? corrAddress.pincode
      : permAddress.pincode || ""
  };
};

// Map API → Form Data (flat GET response)
export const mapAddressApiToForm = (apiData) => {
  if (!apiData) {
    return {
      corrAddress: {
        line1: "",
        line2: "",
        state: "",
        district: "",
        city: "",
        pincode: ""
      },
      permAddress: {
        line1: "",
        line2: "",
        state: "",
        district: "",
        city: "",
        pincode: ""
      },
      sameAsCorrespondence: false
    };
}

  const corrAddress = {
    line1: apiData.addressLine1 || "",
    line2: apiData.addressLine2 || "",
    state: apiData.stateId || "",
    district: apiData.districtId || "",
    city: apiData.city || "",
    pincode: apiData.pincode || ""
  };

  const permAddress = {
    line1: apiData.permanentAddressLine1 || "",
    line2: apiData.permanentAddressLine2 || "",
    state: apiData.permanentStateId || "",
    district: apiData.permanentDistrictId || "",
    city: apiData.permanentCity || "",
    pincode: apiData.permanentPincode || ""
  };

  // derive instead of trusting backend
  const sameAsCorrespondence =
    corrAddress.line1 === permAddress.line1 &&
    corrAddress.line2 === permAddress.line2 &&
    corrAddress.state === permAddress.state &&
    corrAddress.district === permAddress.district &&
    corrAddress.city === permAddress.city &&
    corrAddress.pincode === permAddress.pincode;

  return {
    corrAddress,
    permAddress,
    sameAsCorrespondence
  };
};
