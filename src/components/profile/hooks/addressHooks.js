import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import masterApi from "../../../services/master.api";
import profileApi from "../services/profile.api";
import { mapAddressApiToForm, mapAddressFormToApi } from "../mappers/AddressMapper";
import { toast } from "react-toastify";

const EMPTY_ADDRESS = {
  line1: "",
  line2: "",
  city: "",
  district: "",
  state: "",
  pincode: ""
};

export const useAddressDetails = ({ goNext }) => {
  const user = useSelector(state => state?.user?.user?.data);
  const candidateId = user?.user?.id;

  const [corrAddress, setCorrAddress] = useState(EMPTY_ADDRESS);
  const [permAddress, setPermAddress] = useState(EMPTY_ADDRESS);
  const [sameAsCorrespondence, setSameAsCorrespondence] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [formErrors, setFormErrors] = useState({
    corrAddress: {},
    permAddress: {}
  });

  const [masters, setMasters] = useState({
    states: [],
    districts: [],
    cities: [],
    pincodes: []
  });

  /* -------------------- MASTER DATA -------------------- */
  useEffect(() => {
    const loadMasters = async () => {
      try {
        const res = await masterApi.getMasterData();
        const data = res?.data || {};
        setMasters({
          states: data.states || [],
          districts: data.districts || [],
          cities: data.cities || [],
          pincodes: data.pincodes || []
        });
      } catch (e) {
        console.error(e);
      }
    };
    loadMasters();
  }, []);

  /* -------------------- FETCH ADDRESS -------------------- */
  useEffect(() => {
    if (!candidateId) return;

    const fetchAddress = async () => {
      try {
        const res = await profileApi.getAddressDetails();
        const mapped = mapAddressApiToForm(res?.data);
        setCorrAddress(mapped.corrAddress);
        setPermAddress(mapped.permAddress);
        setSameAsCorrespondence(mapped.sameAsCorrespondence);
        setIsDirty(false);
      } catch (e) {
        console.error(e);
      }
    };

    fetchAddress();
  }, [candidateId]);

  /* -------------------- SYNC PERM ADDRESS -------------------- */
  useEffect(() => {
    if (sameAsCorrespondence) {
      setPermAddress({ ...corrAddress });
    }
  }, [sameAsCorrespondence, corrAddress]);

  /* -------------------- FILTERED OPTIONS -------------------- */
  const getSortedDistricts = (stateId) => {
    return masters.districts
      .filter(d => d.stateId === stateId)
      .slice()
      .sort((a, b) => a.districtName.localeCompare(b.districtName));
  };

  const filteredDistricts = useMemo(
    () => getSortedDistricts(corrAddress.state),
    [masters.districts, corrAddress.state]
  );

  const filteredCities = useMemo(
    () => masters.cities.filter(c => c.districtId === corrAddress.district),
    [masters.cities, corrAddress.district]
  );

  const filteredPincodes = useMemo(
    () => masters.pincodes.filter(p => p.cityId === corrAddress.city),
    [masters.pincodes, corrAddress.city]
  );

  const permFilteredDistricts = useMemo(
    () => getSortedDistricts(permAddress.state),
    [masters.districts, permAddress.state]
  );

  const permFilteredCities = useMemo(
    () => masters.cities.filter(c => c.districtId === permAddress.district),
    [masters.cities, permAddress.district]
  );

  const permFilteredPincodes = useMemo(
    () => masters.pincodes.filter(p => p.cityId === permAddress.city),
    [masters.pincodes, permAddress.city]
  );

  /* -------------------- HANDLERS -------------------- */
  const clearError = (type, field) => {
    setFormErrors(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: undefined }
    }));
  };

  const updateAddress = (setter, type) => e => {
    const { id, value } = e.target;

    // ✅ Hard restrict pincode to 6 digits only
    if (id === "pincode") {
      const numericValue = value.replace(/\D/g, "").slice(0, 6);
      clearError(type, id);
      setter(prev => ({ ...prev, [id]: numericValue }));
      setIsDirty(true);
      return;
    }

    if (id === "city") {
      let filtered = value
        .replace(/[^A-Za-z&\-\s]/g, "") // allow only alphabets, &, -, space
        .replace(/\s{2,}/g, " ") // prevent multiple spaces
        .replace(/^\s+/g, ""); // prevent leading spaces

      clearError(type, id);

      setter(prev => ({
        ...prev,
        [id]: filtered.trimStart()
      }));

      setIsDirty(true);
      return;
    }

    clearError(type, id);

    setter(prev => {
      let updated = { ...prev, [id]: value };

      if (id === "state") updated = { ...updated, district: "", city: "", pincode: "" };
      if (id === "district") updated = { ...updated, city: "", pincode: "" };
      // if (id === "city") updated = { ...updated, pincode: "" };

      return updated;
    });

    setIsDirty(true);
  };

  const handleSameAsToggle = checked => {
    setSameAsCorrespondence(checked);
    setIsDirty(true);

    if (checked) {
      setPermAddress({ ...corrAddress });
      setFormErrors(prev => ({ ...prev, permAddress: {} }));
    } else {
      setPermAddress(EMPTY_ADDRESS);
      setFormErrors(prev => ({ ...prev, permAddress: {} }));
    }
  };

  /* -------------------- VALIDATION -------------------- */
  const validate = () => {
    const errors = { corrAddress: {}, permAddress: {} };
    let valid = true;

    const check = (addr, type) => {
      Object.keys(EMPTY_ADDRESS).forEach(k => {
        if (!addr[k]?.toString().trim()) {
          errors[type][k] = "This field is required";
          valid = false;
        }
      });
    };

    check(corrAddress, "corrAddress");
    if (!sameAsCorrespondence) check(permAddress, "permAddress");

    setFormErrors(errors);
    return valid;
  };

  const sortedStates = useMemo(() => {
    return [...masters.states].sort((a, b) =>
      a.stateName.localeCompare(b.stateName)
    );
  }, [masters.states]);

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async e => {
  e.preventDefault();

  const isValid = validate();

  if (!isValid) {
    toast.error("Please fill all required fields correctly");
    return;
  }

  try {
    const payload = mapAddressFormToApi({
      corrAddress,
      permAddress: sameAsCorrespondence ? corrAddress : permAddress,
      sameAsCorrespondence,
      candidateId
    });

    await profileApi.postAddressDetails(payload);
    toast.success("Address details saved successfully");
    setIsDirty(false);
    goNext();
  } catch (e) {
    console.error(e);
    toast.error("Failed to save address details");
  }
};

  return {
    corrAddress,
    permAddress,
    sameAsCorrespondence,
    masters,
    filteredDistricts,
    filteredCities,
    filteredPincodes,
    permFilteredDistricts,
    permFilteredCities,
    permFilteredPincodes,
    formErrors,
    isDirty,
    sortedStates,
    handleCorrChange: updateAddress(setCorrAddress, "corrAddress"),
    handlePermChange: updateAddress(setPermAddress, "permAddress"),
    handleSameAsToggle,
    handleSubmit
  };
};
