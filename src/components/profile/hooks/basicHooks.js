import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import profileApi from '../services/profile.api';
import { mapBasicDetailsApiToForm, mapBasicDetailsFormToApi } from '../mappers/BasicMapper';
import masterApi from '../../../services/master.api';
import { toast } from 'react-toastify';
import { isAllowedNameChar, isValidName, validateEndDateAfterStart, validateFile } from '../../../shared/utils/validation';
import { useStepTracking } from './useStepTracking';

const normalizeName = (name = "") =>
	name
		// .toLowerCase()
		.replace(/\s+/g, " ")
		.trim();

const normalizeDate = (date = "") => {
	// Aadhaar OCR: DD/MM/YYYY
	// Form input: YYYY-MM-DD
	if (!date) return "";

	if (date.includes("/")) {
		const [dd, mm, yyyy] = date.split("/");
		return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
	}
	return date;
};

export const useBasicDetails = ({ goNext, goBack, parsedData }) => {
	const [formErrors, setFormErrors] = useState({});
	const { updateStep } = useStepTracking();
	const aadhaarName = useSelector(state => state.idProof.name);
	const aadhaarDob = useSelector(state => state.idProof.dob);

	const user = useSelector((state) => state?.user?.user?.data);
	console.log(user)
	const candidateId = user?.user?.id;
	const email = user?.user?.email;
	const createdBy = user?.user?.id;
	const registrationName = user?.user?.name;
	const communityDoc = useSelector((state) => state.documentTypes?.list?.find(doc => doc.docCode === "COMMUNITY_CERT"));
	const disabilityDoc = useSelector((state) => state.documentTypes?.list?.find(doc => doc.docCode === "DISABILITY"));
	const serviceDoc = useSelector((state) => state.documentTypes?.list?.find(doc => doc.docCode === "SERVICE"));
	const birthDoc = useSelector((state) => state.documentTypes?.list?.find(doc => doc.docCode === "BIRTH_CERT"));
	const tenthDoc = useSelector(state => state.documentTypes?.list?.find(doc => doc.docCode === "TENTH"));
	const [loading, setLoading] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
	const [formData, setFormData] = useState({
		firstName: "",
		middleName: "",
		lastName: "",
		fullNameAadhar: "",
		fullNameSSC: "",
		gender: "",
		dob: "",
		maritalStatus: "",
		nationality: "",
		religion: "",
		category: "",
		caste: "",
		communityCertificate: null,
		casteState: "",
		motherName: "",
		fatherName: "",
		spouseName: "",
		contactNumber: "",
		altNumber: "",
		cibilScore: "",
		socialMediaLink: "",
		dobProofType: "BIRTH_CERT",

		twinSibling: false,
		siblingName: "",
		twinGender: "",

		isDisabledPerson: false,
		disabilities: [],
		scribeRequirement: "",
		disabilityCertificate: null,

		isExService: false,
		serviceEnrollment: "",
		dischargeDate: "",
		servicePeriod: "",
		employmentSecured: "No",
		lowerPostStatus: "No",
		serviceCertificate: null,

		riotVictimFamily: "No",
		servingInGovt: "No",
		minorityCommunity: "No",
		disciplinaryAction: "No",

		language1: "",
		language1Read: false,
		language1Write: false,
		language1Speak: false,

		language2: "",
		language2Read: false,
		language2Write: false,
		language2Speak: false,

		language3: "",
		language3Read: false,
		language3Write: false,
		language3Speak: false,

		registrationNo: ""
	});
	const [masterData, setMasterData] = useState({
		genders: [],
		maritalStatus: [],
		religions: [],
		reservationCategories: [],
		countries: [],
		states: [],
		districts: [],
		cities: [],
		pincodes: [],
		disabilityCategories: [],
		languages: []
	});
	const [candidateProfileId, setCandidateProfileId] = useState(null);

	const [communityFile, setCommunityFile] = useState(null);
	const [existingCommunityDoc, setExistingCommunityDoc] = useState(null);
	const [disabilityFile, setDisabilityFile] = useState(null);
	const [existingDisabilityDoc, setExistingDisabilityDoc] = useState(null);
	const [serviceFile, setServiceFile] = useState(null);
	const [existingServiceDoc, setExistingServiceDoc] = useState(null);
	const [birthFile, setBirthFile] = useState(null);
	const [existingBirthDoc, setExistingBirthDoc] = useState(null);
	const [touched, setTouched] = useState({
		fullNameAadhar: false,
		dob: false
	});
	const [isDobLocked, setIsDobLocked] = useState(false);
	const [dobValidationPending, setDobValidationPending] = useState(null);
	const [dobValidationStatus, setDobValidationStatus] = useState(null);
	const [parsedFields, setParsedFields] = useState({});
	const NAME_FIELDS = new Set([
		"firstName",
		"middleName",
		"lastName",
		"fullNameSSC",
		"motherName",
		"fatherName",
		"spouseName",
		"siblingName",
		"caste"
	]);
	const [communityValidation, setCommunityValidation] = useState(null);
	const [disabilityValidation, setDisabilityValidation] = useState(null);
	const [serviceValidation, setServiceValidation] = useState(null);

	const getAvailableDisabilityTypes = (currentIndex) => {
		const selectedIds = formData.disabilities
			.filter((_, i) => i !== currentIndex)
			.map(d => d.disabilityCategoryId)
			.filter(Boolean);

		return masterData.disabilityCategories.filter(
			d => !selectedIds.includes(d.disabilityCategoryId)
		);
	};

	const getValidationPayload = (validationResult) => {
		if (validationResult === true) {
			return {
				isValidationPending: false,
				pendingChecks: []
			};
		}

		return {
			isValidationPending: true,
			pendingChecks: ["document"]
		};
	};

	useEffect(() => {
		const fetchMasterData = async () => {
			setLoading(true);
			try {
				const res = await masterApi.getMasterData();
				const data = res?.data;
				const sortedStates = (data.states || []).sort((a, b) =>
					a.stateName.localeCompare(b.stateName)
				);
				setMasterData({
					genders: data.genderMasters || [],
					maritalStatus: data.maritalStatusMaster || [],
					religions: data.religionMaster || [],
					reservationCategories: data.reservationCategories || [],
					countries: data.countries || [],
					states: sortedStates || [],
					districts: data.districts || [],
					cities: data.cities || [],
					pincodes: data.pincodes || [],
					disabilityCategories: data.disabilityCategories || [],
					languages: data.languageMasters || []
				});
			} catch (error) {
				console.error("Failed to fetch master data", error);
			} finally {
				setLoading(false);
			}
		};
		fetchMasterData();
	}, []);

	useEffect(() => {
		const fetchBasicDetails = async () => {
			setLoading(true);
			try {
				const res = await profileApi.getBasicDetails();
				const apiData = res?.data;
				setCandidateProfileId(apiData?.candidateProfile?.candidateProfileId || null);
				if (!apiData) return;
				const mappedForm = mapBasicDetailsApiToForm(apiData);
				const normalizedAadhaarDob = aadhaarDob ? normalizeDate(aadhaarDob) : null;

				setFormData(prev => ({
					...prev,
					...mappedForm,
					firstName: prev.firstName || mappedForm.firstName,
					middleName: prev.middleName || mappedForm.middleName,
					lastName: prev.lastName || mappedForm.lastName,
					contactNumber: prev.contactNumber || mappedForm.contactNumber,
					motherName: prev.motherName || mappedForm.motherName,
					fatherName: prev.fatherName || mappedForm.fatherName,
					fullNameAadhar:
						mappedForm.fullNameAadhar ||
						registrationName ||
						"",
					fullNameSSC: mappedForm.fullNameSSC || registrationName,
					// 👇 Use extracted Aadhaar DOB if available, else DB data
					dob: normalizedAadhaarDob || mappedForm.dob,
					dobProofType: mappedForm.dobProofType || prev.dobProofType
				}));
				setIsDirty(false);

				setParsedFields(prev => {
					const updated = { ...prev };

					["firstName", "middleName", "lastName"].forEach(k => {
						if (mappedForm[k] && formData[k] === mappedForm[k]) {
							delete updated[k];
						}
					});

					return updated;
				});

			} catch (error) {
				console.error("Failed to fetch basic details", error);
			} finally {
				setLoading(false);
			}
		};
		fetchBasicDetails();
	}, [candidateId]);

	const parsedClass = (field) => parsedFields[field] ? "border-primary" : "";

	const clearFieldError = (field) => {
		setFormErrors(prev => {
			const updated = { ...prev };
			delete updated[field];
			return updated;
		});
	};

	useEffect(() => {

		setFormData(prev => ({
			...prev,
			fullNameAadhar:
				prev.fullNameAadhar?.trim() ? prev.fullNameAadhar : registrationName
		}));
	}, []);

	useEffect(() => {

		setFormData(prev => ({
			...prev,
			fullNameSSC:
				prev.fullNameSSC?.trim() ? prev.fullNameSSC : registrationName
		}));
	}, []);



	useEffect(() => {
		if (!candidateId || !communityDoc?.docCode) return;
		const fetchCommunity = async () => {
			setLoading(true);
			try {
				const res = await profileApi
					.getDocumentDetailsByCode(communityDoc.docCode);
				setExistingCommunityDoc(res?.data || null);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		fetchCommunity();
	}, [candidateId, communityDoc?.docCode]);

	useEffect(() => {
		if (!candidateId) return;

		const fetchDobDoc = async () => {
			setLoading(true);
			try {
				let docCode = null;

				if (formData.dobProofType === "BIRTH_CERT") {
					docCode = "BIRTH_CERT";
				} else if (formData.dobProofType === "TENTH") {
					docCode = "TENTH";
				}

				if (!docCode) return;

				const res = await profileApi.getDocumentDetailsByCode(docCode);

				setExistingBirthDoc(res?.data || null);
				//   setDobValidationStatus(res.data.isValidationPending);
				if (res?.data) {
					const status = res.data.isValidationPending ? "pending" : "validated";
					setDobValidationStatus(status);
				} else {
					setDobValidationStatus(null);
				}


			} catch (err) {
				console.error("DOB document fetch failed", err);
				setExistingBirthDoc(null);
				setDobValidationStatus(null);
			} finally {
				setLoading(false);
			}
		};

		fetchDobDoc();
	}, [candidateId, formData.dobProofType]);

	useEffect(() => {
		if (!candidateId || !disabilityDoc?.docCode) return;

		const fetchDisability = async () => {
			setLoading(true);
			try {
				const res = await profileApi
					.getDocumentDetailsByCode(disabilityDoc.docCode);
				setExistingDisabilityDoc(res?.data || null);
			} catch (err) {
				console.error("Disability Certificate fetch failed", err);
			} finally {
				setLoading(false);
			}
		};
		fetchDisability();
	}, [candidateId, disabilityDoc?.docCode]);

	useEffect(() => {
		if (!candidateId || !serviceDoc?.docCode) return;

		const fetchService = async () => {
			setLoading(true);
			try {
				const res = await profileApi
					.getDocumentDetailsByCode(serviceDoc.docCode);
				setExistingServiceDoc(res?.data || null);
			} catch (err) {
				console.error("Service Certificate fetch failed", err);
			} finally {
				setLoading(false);
			}
		};
		fetchService();
	}, [candidateId, serviceDoc?.docCode]);

	const selectedCategory = masterData?.reservationCategories?.find(
		c => c.reservationCategoriesId === formData?.category
	);

	const isGeneralCategory = selectedCategory?.categoryCode === "GEN";
	useEffect(() => {
		if (isGeneralCategory) {
			// clear form fields
			setFormData(prev => ({
				...prev,
				casteState: ""
			}));

			// 🔥 DELETE from DB if exists
			if (existingCommunityDoc?.documentId) {
				profileApi.deleteDocument(existingCommunityDoc.documentId)
					.then(() => {
						setExistingCommunityDoc(null);
						setCommunityFile(null);
					})
					.catch(err => {
						console.error("Failed to delete community document", err);
						toast.error("Failed to delete document");
					});
			} else {
				// no DB doc → just clear state
				setCommunityFile(null);
				setExistingCommunityDoc(null);
			}
		}
	}, [isGeneralCategory]);

	const getAvailableLanguages = (excludeIds = []) => {
		return masterData.languages.filter(
			l => !excludeIds.includes(l.languageId)
		);
	};
	useEffect(() => {
		if (
			formData.language1 &&
			formData.language1 === formData.language2
		) {
			setFormData(prev => ({ ...prev, language2: "" }));
		}

		if (
			formData.language1 &&
			formData.language1 === formData.language3
		) {
			setFormData(prev => ({ ...prev, language3: "" }));
		}
	}, [formData.language1]);

	const handleCommunityFileChange = async (e) => {
		const input = e.currentTarget || e.target;
		const file = input.files && input.files[0];
		if (!file) return;

		if (!validateFile({ file, errorPrefix: "Community Certificate" })) {
			input.value = "";
			return;
		}

		setLoading(true);
		try {
			const validateresoponse = await validateDoc("COMMUNITY_CERT", file);
			setCommunityValidation(validateresoponse?.data);

			setCommunityFile(file);
			setIsDirty(true);
			clearFieldError("communityCertificate");
		} finally {
			setLoading(false);
		}
		input.value = "";
	};
	const handleCommunityBrowse = () => {
		document.getElementById("communityCertificateInput").click();
	};

	const handleDisabilityFileChange = async (e) => {
		const input = e.currentTarget || e.target;
		const file = input.files && input.files[0];
		if (!file) return;
		if (!validateFile({ file, errorPrefix: "Disability Certificate" })) {
			input.value = "";
			return;
		}

		setLoading(true);
		try {
			const validateresoponse = await validateDoc("DISABILITY", file);

			setDisabilityValidation(validateresoponse?.data);
			setDisabilityFile(file);
			setIsDirty(true);
		} finally {
			setLoading(false);
		}
		setFormErrors(prev => {
			const updated = { ...prev };
			delete updated.disabilityCertificate;
			return updated;
		});
	};

	const handleDisabilityBrowse = () => {
		document.getElementById("disabilityCertificateInput").click();
	};

	const handleServiceFileChange = async (e) => {
		const input = e.currentTarget || e.target;
		const file = input.files && input.files[0];
		if (!file) return;

		if (!validateFile({ file, errorPrefix: "Service Certificate" })) {
			input.value = "";
			return;
		}

		setLoading(true);
		try {
			const validationResponse = await validateDoc("SERVICE", file);


			setServiceValidation(validationResponse?.data);
			setServiceFile(file);
			setIsDirty(true);

			setFormErrors(prev => {
				const updated = { ...prev };
				delete updated.serviceCertificate;
				return updated;
			});

		} finally {
			setLoading(false);
			input.value = "";
		}
	};

	const handleServiceBrowse = () => {
		document.getElementById("serviceCertificateInput").click();
	};

	const handleBirthFileChange = async (e) => {
		const input = e.currentTarget || e.target;
		const file = input.files && input.files[0];
		if (!file) return;

		if (!validateFile({ file, errorPrefix: "Birth / 10th Certificate" })) {
			input.value = "";
			return;
		}

		setLoading(true);
		try {
			const docCode =
				formData.dobProofType === "BIRTH_CERT"
					? "BIRTH_CERT"
					: "TENTH";

			const documentId =
				formData.dobProofType === "BIRTH_CERT"
					? birthDoc?.documentTypeId
					: tenthDoc?.documentTypeId;

			if (!documentId) {
				input.value = "";
				return;
			}

			const payload = {
				documentId,
				fullNameAsPerCertificate: formData.fullNameSSC?.trim(),
				dateOfBirth: formData.dob
					? formData.dob.split("-").reverse().join("/")
					: ""
			};

			const validationResponse = await profileApi.validateBirthDateProof(
				file,
				payload
			);

			const status = validationResponse?.data?.status;

			if (!status) {
				input.value = "";
				return;
			}

			// ✅ STORE STATUS ONLY — DO NOT BLOCK
			setDobValidationStatus(status);
			setBirthFile(file);
			setIsDirty(true);
			setIsDobLocked(true);
			clearFieldError("birthCertificate");

		} catch (err) {
			console.error("DOB validation failed", err);
		} finally {
			setLoading(false);
			input.value = "";
		}
	};

	const validateDoc = async (documentName, file) => {
		console.log(documentName)
		try {
			const res = await profileApi.ValidateDocument(documentName, file);
			return res;
		} catch (err) {
			return false;
		}
	}

	const handleBirthBrowse = () => {
		document.getElementById("birthCertificateInput")?.click();
	};

	const formatFileSize = (size) => {
		if (!size) return "";
		const kb = size / 1024;
		if (kb < 1024) return kb.toFixed(1) + " KB";
		return (kb / 1024).toFixed(1) + " MB";
	};

	const handleNameKeyDown = (e) => {
		const { key } = e;
		// Allow control/navigation keys
		if (
			key === "Backspace" ||
			key === "Delete" ||
			key === "ArrowLeft" ||
			key === "ArrowRight" ||
			key === "Tab"
		) {
			return;
		}
		// Block everything except letters + space
		if (!isAllowedNameChar(key)) {
			e.preventDefault();
		}
	};

	const handleChange = (e) => {
		const { id, value } = e.target;
		let updatedValue = value;

		if (NAME_FIELDS.has(id)) {
			updatedValue = value; // allow spaces while typing
		}

		setFormData(prev => ({
			...prev,
			[id]: updatedValue
		}));

		setIsDirty(true);

		setParsedFields(prev => {
			if (!prev[id]) return prev;
			const updated = { ...prev };
			delete updated[id];
			return updated;
		});
		setFormErrors(prev => {
			if (!prev[id]) return prev; // no error → do nothing

			const updated = { ...prev };
			delete updated[id];
			return updated;
		});

		if (id === "category") {
			const selectedCategory = masterData?.reservationCategories
				.find(c => c.reservationCategoriesId === value);

			const isGeneral = selectedCategory?.categoryName?.toLowerCase() === "general";

			if (isGeneral) {
				// 🔥 clear file + existing doc
				setCommunityFile(null);
				setExistingCommunityDoc(null);

				// 🔥 clear validation error
				setFormErrors(prev => {
					const updated = { ...prev };
					delete updated.communityCertificate;
					return updated;
				});
			}
		}

		if (id === "contactNumber") {
			if (/^\d{10}$/.test(updatedValue)) {
				setFormErrors(prev => {
					const updated = { ...prev };
					delete updated.contactNumber;
					return updated;
				});
			}
		}

		if (id === "altNumber") {
			if (/^\d{10}$/.test(updatedValue) || updatedValue === "") {
				setFormErrors(prev => {
					const updated = { ...prev };
					delete updated.altNumber;
					return updated;
				});
			}
		}
	};



	const handleDisabilityChange = (index, field, value) => {
		setFormData(prev => ({
			...prev,
			disabilities: prev.disabilities.map((dis, i) =>
				i === index ? { ...dis, [field]: value } : dis
			)
		}));
		setIsDirty(true);

		// 🔥 CLEAR VALIDATION ERROR
		setFormErrors(prev => {
			const updated = { ...prev };

			if (field === "disabilityCategoryId") {
				delete updated[`disabilityType_${index}`];
			}

			if (field === "disabilityPercentage") {
				delete updated[`disabilityPercentage_${index}`];
			}

			return updated;
		});
	};

	const addDisability = () => {
		//	const lastDis = formData.disabilities[formData.disabilities.length - 1];
		const newDis = { disabilityCategoryId: "", disabilityPercentage: "" };
		setFormData(prev => ({
			...prev,
			disabilities: [...prev.disabilities, newDis]
		}));
	};

	const removeDisability = (index) => {
		setFormData(prev => ({
			...prev,
			disabilities: prev.disabilities.filter((_, i) => i !== index)
		}));

		setFormErrors(prev => {
			const updated = { ...prev };
			delete updated[`disabilityType_${index}`];
			delete updated[`disabilityPercentage_${index}`];
			return updated;
		});
	};

	const handleRadio = async (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value
		}));
		setIsDirty(true);

		// If dobProofType radio changed, fetch the corresponding document
		if (name === "dobProofType") {
			try {
				setLoading(true);
				const docCode = value; // "BIRTH_CERT" or "TENTH"
				const response = await profileApi.getDocumentDetailsByCode(docCode);

				if (response?.data) {
					setExistingBirthDoc(response.data);
					setDobValidationStatus(response.data.isValidationPending);
					setBirthFile(null);
				} else {
					setExistingBirthDoc(null);
					setBirthFile(null);
					setDobValidationStatus(null);
				}
			} catch (error) {
				console.error("Failed to fetch document", error);
				setExistingBirthDoc(null);
				setBirthFile(null);
			} finally {
				setLoading(false);
			}
			setDobValidationPending(null);
		}
	};

	const handleCheckbox = (e) => {
		const { id, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[id]: checked
		}));
		setIsDirty(true);
		const match = id.match(/^(language[123])/);
		if (match) {
			const langKey = match[1];

			setFormErrors(prev => {
				const updated = { ...prev };
				delete updated[`${langKey}Proficiency`];
				return updated;
			});
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const errors = {};
		const cleanedFormData = { ...formData };
		NAME_FIELDS.forEach(field => {
			if (cleanedFormData[field]) {
				cleanedFormData[field] = cleanedFormData[field]
					.trim()
					.replace(/\s+/g, " ");
			}
		});

		// Required fields validation
		const requiredFields = [
			'firstName', 'lastName', 'fullNameAadhar', 'fullNameSSC', 'gender',
			'dob', 'cibilScore', 'maritalStatus', 'nationality', 'religion', 'category',
			'caste', 'motherName', 'fatherName', 'contactNumber', 'language1'
		];

		// Check required fields
		requiredFields.forEach(field => {
			if (!cleanedFormData[field]?.toString().trim()) {
				errors[field] = "This field is required";
			}
		});



		const mobile = cleanedFormData.contactNumber?.trim();

		if (mobile) {
			if (!/^\d{10}$/.test(mobile)) {
				errors.contactNumber = "Mobile number must be exactly 10 digits";
			}
		}

		const altMobile = cleanedFormData.altNumber?.trim();

		if (altMobile && !/^\d{10}$/.test(altMobile)) {
			errors.altNumber = "Alternate number must be exactly 10 digits";
		}

		if (isMarried) {
			if (!cleanedFormData.spouseName?.trim()) {
				errors.spouseName = "This field is required";
			}
		}

		// ---------------- NAME VALIDATION ----------------
		const NAME_ERROR = "Only alphabets and spaces are allowed";
		NAME_FIELDS.forEach(field => {
			const value = cleanedFormData[field];
			if (value && !isValidName(value)) {
				errors[field] = NAME_ERROR;
			}
		});

		// ---------------- TWIN SIBLING ----------------
		if (cleanedFormData.twinSibling) {
			if (!cleanedFormData.siblingName?.trim()) {
				errors.siblingName = "Please add twin sibling's name";
			}
			if (!cleanedFormData.twinGender) {
				errors.twinGender = "This field is required";
			}
		}

		// ---------------- DISABILITY ----------------
		if (cleanedFormData.isDisabledPerson) {
			if (cleanedFormData.disabilities.length === 0) {
				errors.disabilities = "This field is required";
			} else {
				cleanedFormData.disabilities.forEach((dis, index) => {
					if (!dis.disabilityCategoryId) {
						errors[`disabilityType_${index}`] = "Please select a disability type";
					}
					if (!dis.disabilityPercentage) {
						errors[`disabilityPercentage_${index}`] =
							"Please enter a disability percentage";
					}
				});
			}

			if (!cleanedFormData.scribeRequirement) {
				errors.scribeRequirement = "This field is required";
			}

			if (!disabilityFile && !existingDisabilityDoc) {
				errors.disabilityCertificate = "This field is required";
			}
		}

		// ---------------- EX-SERVICE ----------------
		if (cleanedFormData.isExService) {
			if (!cleanedFormData.serviceEnrollment) {
				errors.serviceEnrollment = "This field is required";
			}

			if (!cleanedFormData.dischargeDate) {
				errors.dischargeDate = "This field is required";
			}

			if (
				cleanedFormData.serviceEnrollment &&
				cleanedFormData.dischargeDate
			) {
				const { isValid, error } = validateEndDateAfterStart(
					cleanedFormData.serviceEnrollment,
					cleanedFormData.dischargeDate
				);
				if (!isValid) {
					errors.dischargeDate = error;
				}
			}

			if (!serviceFile && !existingServiceDoc) {
				errors.serviceCertificate = "This field is required";
			}
		}

		// ---------------- DOCUMENTS ----------------
		if (!isGeneralCategory && !communityFile && !existingCommunityDoc) {
			errors.communityCertificate = "This field is required";
		}

		if (!birthFile && !existingBirthDoc) {
			errors.birthCertificate = "This field is required";
		}

		const validateLanguageProficiency = (langKey) => {
			const langSelected = cleanedFormData[langKey];
			if (!langSelected) return; // no language selected → no validation

			const read = cleanedFormData[`${langKey}Read`];
			const write = cleanedFormData[`${langKey}Write`];
			const speak = cleanedFormData[`${langKey}Speak`];

			if (!read && !write && !speak) {
				errors[`${langKey}Proficiency`] =
					"Select at least one: Read, Write, or Speak";
			}
		};

		validateLanguageProficiency("language1");
		validateLanguageProficiency("language2");
		validateLanguageProficiency("language3");

		// If there are errors, set them and return
		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			toast.error("Please fill all required fields correctly");

			setTimeout(() => {
				const priorityOrder = [
					"birthCertificate",
					"communityCertificate",
					"disabilityCertificate",
					"serviceCertificate"
				];

				let target = null;

				for (const key of priorityOrder) {
					if (errors[key]) {
						target = document.getElementById(key);
						if (target) break;
					}
				}

				if (!target) {
					const firstKey = Object.keys(errors)[0];
					target = document.getElementById(firstKey);
				}

				if (target) {
					const y =
						target.getBoundingClientRect().top + window.pageYOffset - 150;

					window.scrollTo({
						top: y,
						behavior: "smooth"
					});
				}
			}, 100);

			return;
		}
		// Rest of your form submission logic...
		setLoading(true);
		try {
			const payload = mapBasicDetailsFormToApi({
				formData: cleanedFormData,
				candidateId,
				createdBy,
				candidateProfileId,
				email,
			});

			await profileApi.postBasicDetails(payload);

			// Handle file uploads...
			// ---------------- DOCUMENT UPLOADS ----------------
			const uploadPromises = [];

			// Resolve DOB documentTypeId based on radio selection
			let dobDocumentTypeId = null;

			if (birthFile) {
				if (formData.dobProofType === "BIRTH_CERT") {
					dobDocumentTypeId = birthDoc?.documentTypeId;
				} else if (formData.dobProofType === "TENTH") {
					dobDocumentTypeId = tenthDoc?.documentTypeId;
				}
			}

			// Hard stop if DOB proof type is invalid
			if (birthFile && !dobDocumentTypeId) {
				toast.error("Invalid DOB proof type. Please reselect Birth / 10th certificate.");
				setLoading(false);
				return;
			}

			// Community Certificate
			if (communityFile) {
				const { isValidationPending, pendingChecks } = getValidationPayload(communityValidation);
				uploadPromises.push(
					profileApi.postDocumentDetails(
						communityDoc.documentTypeId,
						communityFile,
						false,
						null,
						isValidationPending,
						pendingChecks
					)
				);
			}

			if (birthFile) {
				let isValidationPending = false;
				let pendingChecks = [];

				if (dobValidationStatus === "validated") {
					isValidationPending = false;
					pendingChecks = [];
				} else if (dobValidationStatus === "pending") {
					isValidationPending = true;
					pendingChecks = ["date of birth"];
				} else if (dobValidationStatus === "rejected") {
					isValidationPending = true;
					pendingChecks = ["document"];
				}

				uploadPromises.push(
					profileApi.postDocumentDetails(
						dobDocumentTypeId,
						birthFile,
						false,
						null,
						isValidationPending,
						pendingChecks
					)
				);
			}

			// Disability Certificate
			if (disabilityFile && formData.isDisabledPerson) {
				const { isValidationPending, pendingChecks } = getValidationPayload(disabilityValidation);
				uploadPromises.push(
					profileApi.postDocumentDetails(
						disabilityDoc.documentTypeId,
						disabilityFile,
						false,
						null,
						isValidationPending,
						pendingChecks
					)
				);
			}

			// Service Certificate
			if (serviceFile && formData.isExService) {
				const { isValidationPending, pendingChecks } = getValidationPayload(serviceValidation);
				uploadPromises.push(
					profileApi.postDocumentDetails(
						serviceDoc.documentTypeId,
						serviceFile,
						false,
						null,
						isValidationPending,
						pendingChecks
					)
				);
			}

			await Promise.all(uploadPromises);

			toast.success("Basic details saved successfully");
			setIsDirty(false);
			updateStep(2); // Step 3 (Basic Details) = index 2
			goNext();
		} catch (err) {
			console.error(err);
			toast.error("Failed to save basic details");
		} finally {
			setLoading(false);
		}
	};

	const calculateServicePeriodInMonths = (start, end) => {
		if (!start || !end) return "";

		const startDate = new Date(start);
		const endDate = new Date(end);

		if (endDate < startDate) return "";

		const MS_PER_DAY = 1000 * 60 * 60 * 24;
		const diffInMs = endDate - startDate;
		const diffInDays = diffInMs / MS_PER_DAY;

		const AVERAGE_DAYS_IN_MONTH = 30.44;
		const months = diffInDays / AVERAGE_DAYS_IN_MONTH;

		return Number(months.toFixed(2)); // e.g. 1.05
	};

	useEffect(() => {
		if (!formData.isExService) {
			// 🔥 Step 1: delete from DB if exists
			if (existingServiceDoc?.documentId) {
				profileApi.deleteDocument(existingServiceDoc.documentId)
					.then(() => {
						setExistingServiceDoc(null);
						setServiceFile(null);
					})
					.catch(err => {
						console.error("Failed to delete service document", err);
						toast.error("Failed to delete document");
					});
			} else {
				// 🔥 Step 2: just clear state
				setServiceFile(null);
				setExistingServiceDoc(null);
			}

			// 🔥 Step 3: reset related fields
			setFormData(prev => ({
				...prev,
				serviceEnrollment: "",
				dischargeDate: "",
				servicePeriod: "",
				employmentSecured: "No",
				lowerPostStatus: "No"
			}));
		}
	}, [formData.isExService]);

	useEffect(() => {
		if (!formData.isExService) {
			setFormData(prev => ({
				...prev,
				serviceEnrollment: "",
				dischargeDate: "",
				servicePeriod: ""
			}));
			return;
		}
		const months = calculateServicePeriodInMonths(
			formData.serviceEnrollment,
			formData.dischargeDate
		);
		setFormData(prev => ({
			...prev,
			servicePeriod: months
		}));
	}, [formData.serviceEnrollment, formData.dischargeDate, formData.isExService]);

	useEffect(() => {
		if (!formData.isDisabledPerson) {
			// 🔥 DELETE from DB if exists
			if (existingDisabilityDoc?.documentId) {
				profileApi.deleteDocument(existingDisabilityDoc.documentId)
					.then(() => {
						setExistingDisabilityDoc(null);
						setDisabilityFile(null);
					})
					.catch(err => {
						console.error("Failed to delete disability document", err);
						toast.error("Failed to delete document");
					});
			} else {
				// no DB doc → just clear state
				setDisabilityFile(null);
				setExistingDisabilityDoc(null);
			}

			// 🔥 CLEAR ALL RELATED DATA (you missed this part)
			setFormData(prev => ({
				...prev,
				disabilities: [],
				scribeRequirement: ""
			}));
		}
	}, [formData.isDisabledPerson]);



	useEffect(() => {
		if (!parsedData?.personal?.name) return;

		const parts = parsedData.personal.name.trim().split(/\s+/);

		const firstName = parts[0] || "";
		const lastName = parts.length > 1 ? parts[parts.length - 1] : "";
		const middleName =
			parts.length > 2 ? parts.slice(1, -1).join(" ") : "";

		setFormData(prev => ({
			...prev,
			firstName: prev.firstName || firstName,
			middleName: prev.middleName || middleName,
			lastName: prev.lastName || lastName
		}));

		setParsedFields(prev => ({
			...prev,
			...(firstName && !prev.firstName ? { firstName: true } : {}),
			...(middleName && !prev.middleName ? { middleName: true } : {}),
			...(lastName && !prev.lastName ? { lastName: true } : {})
		}));
	}, [parsedData]);

	useEffect(() => {
		if (!parsedData) return;
		const parsedPhone =
			parsedData?.personal?.mobile ||
			parsedData?.personal?.phone ||
			"";

		if (!parsedPhone) return;

		const cleanedPhone = parsedPhone.replace(/\D/g, "").slice(-10);

		if (!cleanedPhone) return;

		setFormData(prev => ({
			...prev,
			contactNumber: cleanedPhone
		}));

		setParsedFields(prev => ({
			...prev,
			contactNumber: true
		}));

		if (/^\d{10}$/.test(cleanedPhone)) {
			setFormErrors(prev => {
				const updated = { ...prev };
				delete updated.contactNumber;
				return updated;
			});
		}

	}, [parsedData]);

	useEffect(() => {
		if (!parsedData) return;

		const parsedMother = parsedData?.personal?.motherName || "";
		const parsedFather = parsedData?.personal?.fatherName || "";

		setFormData(prev => ({
			...prev,
			motherName: parsedMother || prev.motherName,
			fatherName: parsedFather || prev.fatherName
		}));

		setParsedFields(prev => ({
			...prev,
			...(parsedMother ? { motherName: true } : {}),
			...(parsedFather ? { fatherName: true } : {})
		}));

		setFormErrors(prev => {
			const updated = { ...prev };
			if (parsedMother) delete updated.motherName;
			if (parsedFather) delete updated.fatherName;
			return updated;
		});

	}, [parsedData]);

	const marriedId = useMemo(
		() => masterData.maritalStatus?.find(m => m.maritalStatus === "Married")?.maritalStatusId,
		[masterData.maritalStatus]
	);

	const hinduReligionId = useMemo(
		() => masterData.religions?.find(r => r.religion === "Hindu")?.religionId,
		[masterData.religions]
	);

	const isMarried = formData.maritalStatus === marriedId;
	const isHindu = formData.religion === hinduReligionId;

	useEffect(() => {
		const shouldLock =
			Boolean(birthFile) ||
			Boolean(existingBirthDoc) ||
			dobValidationPending === true;

		setIsDobLocked(shouldLock);
	}, [birthFile, existingBirthDoc, dobValidationPending]);

	return {
		formData,
		setFormData,
		formErrors,
		setFormErrors,
		masterData,
		candidateProfileId,
		communityFile,
		setCommunityFile,
		existingCommunityDoc,
		setExistingCommunityDoc,
		disabilityFile,
		setDisabilityFile,
		existingDisabilityDoc,
		setExistingDisabilityDoc,
		serviceFile,
		setServiceFile,
		existingServiceDoc,
		setExistingServiceDoc,
		birthFile,
		setBirthFile,
		existingBirthDoc,
		setExistingBirthDoc,
		touched,
		setTouched,
		// isNameMismatch,
		dobValidationStatus,
		setDobValidationStatus,
		isDobLocked,
		setIsDobLocked,
		isBirthDocLocked: isDobLocked,  // ✅ Alias for backward compatibility
		setDobValidationPending,
		// isDobMismatch,
		selectedCategory,
		isGeneralCategory,
		getAvailableLanguages,
		handleCommunityFileChange,
		handleCommunityBrowse,
		handleDisabilityFileChange,
		handleDisabilityBrowse,
		handleServiceFileChange,
		handleServiceBrowse,
		handleBirthFileChange,
		validateDoc,
		handleBirthBrowse,
		formatFileSize,
		handleChange,
		handleDisabilityChange,
		addDisability,
		removeDisability,
		handleRadio,
		handleCheckbox,
		handleSubmit,
		calculateServicePeriodInMonths,
		parsedClass,
		handleNameKeyDown,
		getAvailableDisabilityTypes,
		loading,
		isDirty,
		isMarried,
		isHindu
	};
};