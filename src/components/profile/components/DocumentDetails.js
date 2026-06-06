import { useEffect, useRef, useState } from 'react';
import UploadField from '../../../shared/components/UploadField';
import { useSelector } from 'react-redux';
import profileApi from '../services/profile.api';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { markProfileCompleted } from '../../../components/auth/store/userSlice';
import { faChevronLeft, faCircleInfo, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import bulbIcon from '../../../assets/bulb-icon.png';
import Loader from '../../../shared/components/Loader';
import { Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import uploadSampleImg from '../../../assets/uploadSampleImg.png';
import photoSample from '../../../assets/photoSample.png';
import signSample from '../../../assets/signSample.jpg';

const DocumentDetails = ({ goBack, setActiveTab }) => {
	const dispatch = useDispatch();
	const [isFresher, setIsFresher] = useState(false);
	const [formErrors, setFormErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [idProofType, setIdProofType] = useState("");
	const [idProofNumber, setIdProofNumber] = useState("");
	const [infoModal, setInfoModal] = useState({
		show: false,
		image: null,
		title: ""
	});

	const openInfoModal = (infoTitle, image) => {
		setInfoModal({
			show: true,
			title: infoTitle,
			image
		});
	};

	const user = useSelector((state) => state?.user?.user?.data);
	const candidateId = user?.user?.id;

	const photoDoc = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "PHOTO") || null
	);
	const signDoc = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "SIGN") || null
	);
	const idProofDoc = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "IDPROOF") || null
	);

	const payslipDoc1 = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "PAYSLIP1") || null
	);
	const payslipDoc2 = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "PAYSLIP2") || null
	);
	const payslipDoc3 = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "PAYSLIP3") || null
	);
	const othersDoc = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "OTHERS") || null
	);
	const PanDoc = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "PANCR") || null
	);
	const PassportDoc = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "PASSPORT") || null
	);
	const DLDoc = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "DRIVING_LICENCE") || null
	);
	const PanDocId = PanDoc.documentTypeId
	const PassportDocId = PassportDoc.documentTypeId
	const DLDocId = DLDoc.documentTypeId

	const uploadFieldsConfig = [
		{ key: "idProof", required: true, docCode: idProofDoc?.docCode, documentId: idProofDoc?.documentTypeId, infoImage: uploadSampleImg, infoTitle: "Example ID Proof", showDigiLockerIcon: true },
		{ key: "photo", label: "Photo", required: true, docCode: photoDoc?.docCode, documentId: photoDoc?.documentTypeId, infoImage: photoSample, infoTitle: "Example Photo" },
		{ key: "signature", label: "Signature", required: true, docCode: signDoc?.docCode, documentId: signDoc?.documentTypeId, infoImage: signSample, infoTitle: "Example Sign" },
		// { key: "birthCert", label: "Birth Certificate", required: true, docCode: birthDoc?.docCode, documentId: birthDoc?.documentTypeId },
		{ key: "salary1", label: "Last 3 Month Salary Slip - Month 1", required: true, docCode: payslipDoc1?.docCode, documentId: payslipDoc1?.documentTypeId },
		{ key: "salary2", label: "Last 3 Month Salary Slip - Month 2", required: true, docCode: payslipDoc2?.docCode, documentId: payslipDoc2?.documentTypeId },
		{ key: "salary3", label: "Last 3 Month Salary Slip - Month 3", required: true, docCode: payslipDoc3?.docCode, documentId: payslipDoc3?.documentTypeId },
		{ key: "other", label: "Others - Name", required: false, customName: true, docCode: othersDoc?.docCode, documentId: othersDoc?.documentTypeId }
	];

	const [files, setFiles] = useState({});
	const [customNames, setCustomNames] = useState({});
	const fileInputRefs = useRef({});

	const payslipDocCodes = [
		payslipDoc1?.docCode,
		payslipDoc2?.docCode,
		payslipDoc3?.docCode
	].filter(Boolean);

	/* ================= FRESHER STATUS (BACKEND ONLY) ================= */
	useEffect(() => {
		const fetchFresherStatus = async () => {
			if (!candidateId) return;

			try {
				const res = await profileApi.getWorkStatus();
				let fresherStatus = false;
				if (
					res?.data === true ||
					res?.data === "true" ||
					res?.data === 1 ||
					res?.data === "1"
				) {
					fresherStatus = true;
				} else if (typeof res?.data === "object" && res.data !== null) {
					if (typeof res.data.isFresher !== "undefined") {
						fresherStatus = Boolean(res.data.isFresher);
					} else if (typeof res.data !== "undefined") {
						fresherStatus = Boolean(res.data);
					}
				}
				setIsFresher(fresherStatus);
			} catch (err) {
				console.error("Failed to fetch work status", err);
				setIsFresher(false);
			}
		};
		fetchFresherStatus();
	}, [candidateId]);

	/* ========== CLEAR PAYSLIPS WHEN FRESHER = TRUE ========== */
	useEffect(() => {
		if (!isFresher) return;

		setFiles(prev => {
			const updated = { ...prev };
			delete updated.salary1;
			delete updated.salary2;
			delete updated.salary3;
			return updated;
		});

		setFormErrors(prev => {
			const updated = { ...prev };
			delete updated.salary1;
			delete updated.salary2;
			delete updated.salary3;
			return updated;
		});
	}, [isFresher]);

	/* ================= FETCH EXISTING DOCUMENTS ================= */
	const fetchDocuments = async () => {
		if (!candidateId) return;

		try {
			setLoading(true);
			const res = await profileApi.getDocumentDetails();
			const docs = (res?.data || []).filter(d => d.documentId !== null);
			const populatedFiles = {};

			for (const field of uploadFieldsConfig) {
				if (!field.documentId && field.key !== "idProof") continue;

				let matchedDocs = [];

				if (field.key === "idProof") {
					const idProofDocIds = [PanDocId, PassportDocId, DLDocId];

					matchedDocs = docs.filter(d =>
						idProofDocIds.includes(d.documentId)
					);
				} else {
					matchedDocs = docs.filter(d => d.documentId === field.documentId);
				}

				if (!matchedDocs.length) continue;

				const latest = matchedDocs.sort(
					(a, b) => new Date(b.createdDate) - new Date(a.createdDate)
				)[0];

				// 🔥 ADD IT RIGHT HERE
				if (field.key === "idProof") {
					setIdProofType(latest.documentId);
					setIdProofNumber(latest.documentNumber || "");
				}

				populatedFiles[field.key] = {
					name: latest.displayName ?? latest.fileName,
					fileName: latest.fileName,
					displayName: latest.displayName,
					url: latest.fileUrl,
					documentTypeId: latest.documentId,
					isFromApi: true
				};
			}

			setFiles(populatedFiles);
		} catch (err) {
			console.error("Failed to fetch documents", err);
		} finally {
			setLoading(false);
		}
	};

	const validateFileWithDocCode = async (docCode, file) => {
		try {
			setLoading(true);

			const res = await profileApi.ValidateDocument(docCode, file);

			if (!res?.data) {
				toast.error("Invalid Certificate");
				return false;
			}

			return true;
		} catch {
			toast.error("Invalid Certificate");
			return false;
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const allDocIdsReady = uploadFieldsConfig.every(
			f => !f.required || f.documentId
		);
		if (!candidateId || !allDocIdsReady) return;
		fetchDocuments();
	}, [
		candidateId,
		photoDoc?.documentTypeId,
		signDoc?.documentTypeId,
		idProofDoc?.documentTypeId,
		payslipDoc1?.documentTypeId,
		payslipDoc2?.documentTypeId,
		payslipDoc3?.documentTypeId
	]);

	const handleBrowse = (key) => {
		fileInputRefs.current[key].click();
	};

	const uploadDocument = async (field, file) => {
		if (!candidateId || !field.documentId) return;

		try {
			const skipValidation =
				["PHOTO", "SIGN", "OTHERS"].includes(field.docCode) ||
				field.customName === true;

			let validationResult = true;

			if (!skipValidation) {
				try {
					setLoading(true);
					const validationRes = await profileApi.ValidateDocument(field.docCode, file);
					validationResult = validationRes?.data === true;
				} catch {
					validationResult = false;
				} finally {
					setLoading(false);
				}
			}

			const isValidationPending = !validationResult;
			const pendingChecks = isValidationPending ? ["document"] : [];

			const isOther = field.docCode === "OTHERS";

			const sanitizedDocumentName = isOther
				? customNames[field.key]?.trim().replace(/\s+/g, "_")
				: undefined;

			setLoading(true);

			await profileApi.postDocumentDetails(
				field.documentId,
				file,
				isOther,
				sanitizedDocumentName,
				isValidationPending,
				pendingChecks
			);
			// ✅ CLEAR ERROR
			setFormErrors(prev => {
				const updated = { ...prev };
				delete updated[field.key];
				return updated;
			});

			return true;
		} catch (err) {
			let message = "Upload failed";

			if (err.response) {
				message = err.response.data?.data || message;
			} else if (err.request) {
				message = "No response from server";
			}

			// ✅ SET ERROR FOR THAT FIELD
			setFormErrors(prev => ({
				...prev,
				[field.key]: message
			}));

			return false; // ❗ important

		} finally {
			setLoading(false);
		}
	};

	const handleFileChange = async (key, e) => {
		const file = e.target.files[0];
		if (!file) return;

		const field = uploadFieldsConfig.find(f => f.key === key);
		if (!field) return;

		const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

		// PHOTO + SIGN rules
		const isPhotoOrSign = ["PHOTO", "SIGN"].includes(field.docCode);

		const allowedImageMime = ["image/png", "image/jpeg"];
		const allowedImageExt = [".png", ".jpg", ".jpeg"];

		const allowedDocMime = ["image/png", "image/jpeg", "application/pdf"];
		const allowedDocExt = [".png", ".jpg", ".jpeg", ".pdf"];

		const allowedMimeTypes = isPhotoOrSign ? allowedImageMime : allowedDocMime;
		const allowedExtensions = isPhotoOrSign ? allowedImageExt : allowedDocExt;

		const maxSize = isPhotoOrSign
			? 250 * 1024     // 250KB
			: 2 * 1024 * 1024;  // 2MB

		// Extension validation
		if (!allowedExtensions.includes(extension)) {
			toast.error(
				isPhotoOrSign
					? "Only JPG, JPEG, PNG allowed"
					: "Only JPG, JPEG, PNG, PDF allowed"
			);
			e.target.value = "";
			return;
		}

		// MIME validation
		if (!allowedMimeTypes.includes(file.type)) {
			toast.error("Invalid file type");
			e.target.value = "";
			return;
		}

		if (file.size > maxSize) {
			toast.error(
				isPhotoOrSign
					? "File size must not exceed 250KB"
					: "File size must not exceed 2MB"
			);
			e.target.value = "";
			return;
		}

		// 🔥 CUSTOM NAME VALIDATION
		if (field.docCode === "OTHERS") {
			const name = customNames[key]?.trim();

			if (!name) {
				setFormErrors(prev => ({
					...prev,
					[key]: "Please enter document name before uploading"
				}));

				e.target.value = "";
				return;
			}

			setFormErrors(prev => {
				const updated = { ...prev };
				delete updated[key];
				return updated;
			});
		}

		setFormErrors(prev => ({ ...prev, [key]: "" }));


		let uploadField = field;

		let uploadSucceeded = false;

		if (field.key === "idProof") {
			if (!idProofType || !idProofNumber) {
				setFormErrors(prev => ({
					...prev,
					idProofType: !idProofType ? "This field is required" : prev.idProofType,
					idProofNumber: !idProofNumber ? "This field is required" : prev.idProofNumber
				}));
				return;
			}

			// ✅ NEW VALIDATION
			let validationStatus = "validated";
			try {
				setLoading(true);

				const res = await profileApi.validateIdProof(
					idProofType,
					idProofNumber.trim().replace(/\s+/g, ""),
					file
				);

				validationStatus = res?.data?.status || "rejected";

			} catch {
				validationStatus = "rejected";
			} finally {
				setLoading(false);
			}

			let isValidationPending = false;
			let pendingChecks = [];

			if (validationStatus === "validated") {
				isValidationPending = false;
				pendingChecks = [];
			} else if (validationStatus === "pending") {
				isValidationPending = true;
				pendingChecks = ["document number"];
			} else if (validationStatus === "rejected") {
				isValidationPending = true;
				pendingChecks = ["document"];
			}

			// ✅ UPLOAD
			try {
				setLoading(true);
				await profileApi.uploadIdProof(
					idProofType,
					idProofNumber.trim().replace(/\s+/g, ""),
					file,
					isValidationPending,
					pendingChecks
				);

				uploadSucceeded = true;

			} catch (err) {
				// console.error("ID Proof upload failed", err);
				toast.error("Upload failed");
			} finally {
				setLoading(false);
			}
		} else {
			uploadSucceeded = await uploadDocument(uploadField, file);
		}

		if (uploadSucceeded) {
			await fetchDocuments();
		} else {
			e.target.value = "";
		}
	};

	const handleCustomName = (key, value) => {
		setCustomNames(prev => ({
			...prev,
			[key]: value
		}));

		// 🔥 CLEAR ERROR WHEN USER TYPES VALID NAME
		if (value.trim()) {
			setFormErrors(prev => {
				const updated = { ...prev };
				delete updated[key];
				return updated;
			});
		}
	};

	const handleIdProofType = (value) => {
		setIdProofType(value);

		setFormErrors(prev => {
			const updated = { ...prev };
			delete updated.idProofType;   // ✅ correct
			delete updated.idProofFile;   // optional (if you want live UX)
			return updated;
		});
	};

	const handleIdProofNumber = (value) => {
		setIdProofNumber(value);

		setFormErrors(prev => {
			const updated = { ...prev };
			delete updated.idProofNumber; // ✅ correct
			delete updated.idProofFile;   // optional
			return updated;
		});
	};

	const handleConnectDigiLocker = async () => {
		setLoading(true);
		try {
			const result = await profileApi.initializeDigiLockerConsent(
				"issued",
				// "PAN"
			);

			if (result.success && result.data) {
				console.log(result.data.redirect_uri);
				window.open(result.data.redirect_uri, "_blank");
			} else {
				toast.error("Unable to launch DigiLocker");
			}
		} catch (err) {
			console.error("Failed to initialize DigiLocker", err);
			toast.error("Failed to connect to DigiLocker. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const validateForm = () => {
		const errors = {};

		uploadFieldsConfig.forEach(field => {
			const isPayslip = payslipDocCodes.includes(field.docCode);


			if (field.required && !files[field.key]) {
				if (isPayslip && isFresher) return;
				errors[field.key] = "This field is required";
			}

			if (field.docCode === "OTHERS") {
				const name = customNames[field.key]?.trim();

				// if (files[field.key] && !name) {
				// 	errors[field.key] = "Document name is required";
				// }
			}

			if (field.key === "idProof") {
				if (!idProofType) {
					errors.idProofType = "This field is required";
				}

				if (!idProofNumber) {
					errors.idProofNumber = "This field is required";
				}

				if (!files[field.key]) {
					errors.idProofFile = "Upload document";
				}
			}
		});

		setFormErrors(errors);
		return errors;
	};

	const handleSubmit = async () => {
		const errors = validateForm();

		if (Object.keys(errors).length > 0) {
			toast.error("Please fill all required fields correctly");
			return;
		}



		try {
			await profileApi.saveProfileComplete(true);
			dispatch(markProfileCompleted());
			setActiveTab("jobs");
		} catch (err) {
			toast.error("Profile completion failed");
		}
	};

	return (
		<div className="px-4 py-3 border rounded bg-white">
			<div className='d-flex justify-content-between'>
				<div>
					<p className="tab_headers" style={{ marginBottom: '0px' }}>Document Details</p>
				</div>
				<div className='d-flex'>
					<img src={bulbIcon} alt="Bulb" style={{ width: '25px', height: '25px', marginTop: '6px', marginRight: '5px' }} />
					<p className='orange_text mt-2'>Please ensure all uploaded documents are clear and eligible. File size should not exceed 2MB per document.</p>
				</div>
			</div>
			<div className="row g-5 mt-0">
				{uploadFieldsConfig.map(field => {
					const isPayslip = payslipDocCodes.includes(field.docCode);
					const disabled = isPayslip && isFresher;
					const isPhotoOrSign = ["PHOTO", "SIGN"].includes(field.docCode);

					return (
						<div key={field.key} className={`${field.key === "idProof" ? "col-md-12" : "col-md-6 col-sm-12"} mt-2`}>
							<div id={`upload-${field.key}`}>
								{field.key === "idProof" ? (
									<>
										<label className='grey-label d-flex align-items-center gap-2'>
											Proof of Identity <span className="text-danger">*</span>
											<span
												style={{ cursor: "pointer" }}
												onClick={() => openInfoModal("Proof of Identity", uploadSampleImg)}
											>
												<FontAwesomeIcon
													icon={faCircleInfo}
													size="md"
													style={{ color: "#42579f" }}
													className='mt-1'
												/>
											</span>
											{field.showDigiLockerIcon && (
												<button 
													type="button" 
													className="border-0 bg-transparent p-0" 
													onClick={handleConnectDigiLocker}
													title="Connect to DigiLocker"
													style={{ cursor: 'pointer', marginLeft: '0.25rem' }}
												>
													<FontAwesomeIcon
														icon={faLink}
														size="sm"
														style={{ color: "#ff7043" }}
													/>
												</button>
											)}
										</label>
										<div key={field.key} className="col-md-12 mt-2 idProof_container rounded p-3">
											{/* ROW 1 — Inputs */}
											<div className="row align-items-center">
												<div className="col-md-3 col-sm-12">
													<label className="grey-label">
														Select ID Proof <span className="text-danger">*</span>
													</label>
													<select
														className={`form-select styled-input ${formErrors.idProofType ? "is-invalid" : ""}`}
														value={idProofType}
														onChange={(e) => handleIdProofType(e.target.value)}
														disabled={!!files.idProof}
													>
														<option value="">Select ID Proof</option>
														<option value={PanDocId}>PAN</option>
														<option value={PassportDocId}>Passport</option>
														<option value={DLDocId}>Driving Licence</option>
													</select>

													{formErrors.idProofType && (
														<div className="text-danger mt-1" style={{ fontSize: "0.75rem" }}>
															{formErrors.idProofType}
														</div>
													)}
												</div>

												<div className="col-md-3 col-sm-12">
													<label className="grey-label">
														Document Number <span className="text-danger">*</span>
													</label>
													<input
														type="text"
														className={`form-control styled-input ${formErrors.idProofNumber ? "is-invalid" : ""}`}
														placeholder="Enter document number"
														value={idProofNumber}
														onChange={(e) => handleIdProofNumber(e.target.value)}
														disabled={!idProofType || !!files.idProof}
													/>
													{formErrors.idProofNumber && (
														<div className="text-danger mt-1" style={{ fontSize: "0.75rem" }}>
															{formErrors.idProofNumber}
														</div>
													)}
												</div>

												<div className="col-md-6 col-sm-12" style={{ paddingLeft: '24px' }}>
													<UploadField
														label={field.label}
														required={field.required}
														file={files[field.key]}
														onBrowse={() => handleBrowse(field.key)}
														onChange={(e) => handleFileChange(field.key, e)}
														onDelete={() => {
															fetchDocuments();
															if (field.key === "idProof") {
																setIdProofType("");
																setIdProofNumber("");
															}
														}}
														ref={(el) => (fileInputRefs.current[field.key] = el)}
														// isInvalid={!!formErrors[field.key]}
														isInvalid={!!formErrors.idProofFile}
														allowedFormats="JPG, PNG, PDF"
														maxSize="2MB"
														disabled={!idProofType || !idProofNumber}
													/>
													{formErrors.idProofFile && (
														<div className="text-danger mt-1" style={{ fontSize: "0.75rem" }}>
															{formErrors.idProofFile}
														</div>
													)}
												</div>
											</div>
										</div>
									</>
								) : (
									<div className='mt-2'>
										<UploadField
											label={field.label}
											required={field.required && !(isPayslip && isFresher)}
											file={files[field.key]}
											customName={field.customName}
											customNameValue={customNames[field.key]}
											onCustomNameChange={(v) => handleCustomName(field.key, v)}
											onBrowse={!disabled ? () => handleBrowse(field.key) : undefined}
											onChange={!disabled ? (e) => handleFileChange(field.key, e) : undefined}
											onDelete={() => fetchDocuments()}
											ref={(el) => (fileInputRefs.current[field.key] = el)}
											isInvalid={!!formErrors[field.key]}
											disabled={disabled}
											allowedFormats={isPhotoOrSign ? "JPG, PNG" : "JPG, PNG, PDF"}
											maxSize={isPhotoOrSign ? "250KB" : "2MB"}
											infoImage={field.infoImage}
											onInfoClick={() => openInfoModal(field.infoTitle || field.label, field.infoImage)}
											showDigiLockerIcon={field.showDigiLockerIcon || false}
											onDigiLockerClick={handleConnectDigiLocker}
										/>
										{formErrors[field.key] && (
											<div className="text-danger" style={{ fontSize: "0.875rem" }}>
												{formErrors[field.key]}
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>

			<div className="d-flex justify-content-between mt-4">
				<button className="btn grey_border" onClick={goBack} style={{ fontSize: '0.875rem', padding: "0.6rem 1rem" }}>
					<FontAwesomeIcon icon={faChevronLeft} size='sm' style={{ marginRight: '0.25rem' }} />
					Back
				</button>

				<button
					className="btn btn-primary"
					style={{ backgroundColor: "#ff7043", border: "none", color: 'white', padding: "0.6rem 1rem", fontSize: '0.875rem' }}
					onClick={handleSubmit}
				>
					Submit
				</button>
			</div>

			<Modal
				show={infoModal.show}
				onHide={() => setInfoModal({ show: false, image: null, title: "" })}
				centered
			>
				<Modal.Header className="border-bottom pb-3" closeButton>
					<Modal.Title className="cerhead">{infoModal.title}</Modal.Title>
				</Modal.Header>

				<Modal.Body style={{ textAlign: "center" }}>
					<img
						src={infoModal.image}
						alt="Exampleimage"
						style={{ width: "100%", borderRadius: "6px" }}
					/>
				</Modal.Body>
			</Modal>

			{loading && (
				<Loader />
			)}
		</div>
	);
};

export default DocumentDetails;