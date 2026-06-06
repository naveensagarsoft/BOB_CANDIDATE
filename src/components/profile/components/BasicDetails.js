import { faChevronRight, faCircleCheck, faCircleXmark, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import deleteIcon from '../../../assets/delete-icon.png';
import viewIcon from '../../../assets/view-icon.png';
import bulbIcon from '../../../assets/bulb-icon.png';
import { useBasicDetails } from '../hooks/basicHooks';
import profileApi from '../services/profile.api';
import { toast } from 'react-toastify';
import Loader from '../../../shared/components/Loader';
import BackButtonWithConfirmation from '../../../shared/components/BackButtonWithConfirmation';
import { Form } from 'react-bootstrap';
import greenCheck from '../../../assets/green-check.png'
import { handleEyeClick } from "../../../shared/utils/fileDownload";
const BasicDetails = ({ goNext, goBack, parsedData }) => {
	const {
		formData,
		setFormData,
		formErrors,
		setFormErrors,
		masterData,
		setDobValidationStatus,
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
		isGeneralCategory,
		isBirthDocLocked,
		getAvailableLanguages,
		handleCommunityFileChange,
		handleCommunityBrowse,
		handleDisabilityFileChange,
		handleDisabilityBrowse,
		handleServiceFileChange,
		handleServiceBrowse,
		handleBirthFileChange,
		handleBirthBrowse,
		formatFileSize,
		handleChange,
		handleDisabilityChange,
		addDisability,
		removeDisability,
		handleRadio,
		handleCheckbox,
		handleSubmit,
		parsedClass,
		handleNameKeyDown,
		getAvailableDisabilityTypes,
		loading,
		isDirty,
		isMarried,
		isHindu,
		isDobLocked,
		setIsDobLocked
	} = useBasicDetails({ goNext, goBack, parsedData });

	const handleDeleteDocument = async (
		document,
		onSuccess
	) => {
		if (document?.documentId) {
			try {
				await profileApi.deleteDocument(document.documentId);
				onSuccess();
			} catch (err) {
				console.error("Failed to delete", err);
				toast.error("Failed to delete document");
			}
		}
	};
	const handleTwinSiblingChange = (value) => {
		const hasTwin = value === "true";

		setFormData(prev => ({
			...prev,
			twinSibling: hasTwin,
			siblingName: hasTwin ? prev.siblingName : "",
			twinGender: hasTwin ? prev.twinGender : ""
		}));

		if (!hasTwin) {
			setFormErrors(prev => {
				const updated = { ...prev };
				delete updated.siblingName;
				delete updated.twinGender;
				return updated;
			});
		}
	};

	const handleDisabilityStatusChange = (value) => {
		const isDisabled = value === "true";

		setFormData(prev => ({
			...prev,
			isDisabledPerson: isDisabled,
			disabilities: isDisabled
				? (prev.disabilities.length > 0
					? prev.disabilities
					: [{ disabilityCategoryId: "", disabilityPercentage: "" }])
				: [],
			scribeRequirement: isDisabled ? prev.scribeRequirement : ""
		}));

		if (!isDisabled) {
			setFormErrors(prev => {
				const updated = { ...prev };
				delete updated.disabilities;
				delete updated.scribeRequirement;
				delete updated.disabilityCertificate;

				Object.keys(updated).forEach(key => {
					if (
						key.startsWith("disabilityType_") ||
						key.startsWith("disabilityPercentage_")
					) {
						delete updated[key];
					}
				});

				return updated;
			});
		}
	};

	const handleNumericKeyDown = (e) => {
		if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
			return;
		}
		if (!/^\d$/.test(e.key)) {
			e.preventDefault();
		}
	}; 
	const handleCibilChange = (value) => {
		if (!/^\d*$/.test(value)) return;

		setFormData(prev => ({
			...prev,
			cibilScore: value
		}));

		setFormErrors(prev => {
			const updated = { ...prev };
			delete updated.cibilScore;
			return updated;
		});
	};

	return (
		<div>
			{loading && (
				<Loader />
			)}
			<form className="row g-4 formfields"
				onSubmit={handleSubmit}
			>
				<div className="px-4 pb-4 rounded row g-4 formfields bg-white border">
					<div className='d-flex justify-content-between align-items-center mt-2'>
						<div>
							<p className="tab_headers" style={{ marginBottom: '0px' }}>Personal Details</p>
						</div>
						<div className='d-flex'>
							<img src={bulbIcon} alt="bulb icon" style={{ width: '25px', height: '25px', marginTop: '6px', marginRight: '5px' }} />
							<p className='orange_text mt-2'>Resume details have been auto-applied in the highlighted fields.</p>
						</div>
					</div>
					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="firstName" className="form-label" style={{ color: '#42579f', fontWeight: 500 }}>First Name <span className="text-danger">*</span></label>
						<input
							type="text"
							className={`form-control ${parsedClass("firstName")} ${formErrors.firstName ? 'is-invalid' : ''}`}
							id="firstName"
							value={formData.firstName || ''}
							onChange={handleChange}
							onKeyDown={handleNameKeyDown}
							placeholder='Enter your first name'
							maxLength={200}
						/>
						{formErrors.firstName && <div className="invalid-feedback">{formErrors.firstName}</div>}
					</div>
					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="middleName" className="form-label" style={{ color: '#42579f', fontWeight: 500 }}>Middle Name</label>
						<input type="text" maxLength={200} className={`form-control ${parsedClass("middleName")}`} id="middleName" value={formData?.middleName} onChange={handleChange} onKeyDown={handleNameKeyDown} placeholder='Enter your middle name' />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="lastName" className="form-label" style={{ color: '#42579f', fontWeight: 500 }}>Last Name <span className="text-danger">*</span></label>
						<input type="text" maxLength={200} className={`form-control ${parsedClass("lastName")} ${formErrors.lastName ? 'is-invalid' : ''}`} id="lastName" value={formData?.lastName} onChange={handleChange} onKeyDown={handleNameKeyDown} placeholder='Enter your last name' />
						{formErrors.lastName && <div className="invalid-feedback">{formErrors.lastName}</div>}
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="fullNameAadhar" className="form-label">Full Name as per Aadhar Card <span className="text-danger">*</span></label>
						<input
							type="text"
							id="fullNameAadhar"
							value={formData.fullNameAadhar}
							onChange={handleChange}
							onKeyDown={handleNameKeyDown}
							className={`form-control ${parsedClass("fullNameAadhar")} ${formErrors.fullNameAadhar ? 'is-invalid' : ''}`}
							placeholder="Enter full name as per Aadhaar"
							maxLength={200}
						/>
						{/* {isNameMismatch && (
						<small className="text-danger">
							Name not matching with Aadhaar
						</small>
					)} */}
						{formErrors.fullNameAadhar && <div className="invalid-feedback">{formErrors.fullNameAadhar}</div>}
					</div>
					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="fullNameSSC" className="form-label">Full Name as per 10th/Birth Certificate <span className="text-danger">*</span></label>
						<input type="text" maxLength={200} className={`form-control ${formErrors.fullNameSSC ? 'is-invalid' : ''}`} id="fullNameSSC" value={formData?.fullNameSSC} onChange={handleChange} onKeyDown={handleNameKeyDown} placeholder='Enter your full name' />
						{formErrors.fullNameSSC && <div className="invalid-feedback">{formErrors.fullNameSSC}</div>}
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="gender" className="form-label">Gender <span className="text-danger">*</span></label>
						<select
							className={`form-select ${formErrors.gender ? 'is-invalid' : ''}`}
							id="gender"
							value={formData.gender}
							onChange={handleChange}
						>
							<option value="">Select Gender</option>
							{masterData?.genders.map(g => (
								<option key={g.genderId} value={g.genderId}>
									{g.gender}
								</option>
							))}
						</select>
						{formErrors.gender && <div className="invalid-feedback">{formErrors.gender}</div>}
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="dob" className="form-label" style={{ color: '#42579f', fontWeight: 500 }}>Date of Birth <span className="text-danger">*</span></label>

						<input type="date" className={`form-control ${formErrors.dob ? 'is-invalid' : ''}`} id="dob" value={formData?.dob} onChange={handleChange} max={new Date().toISOString().split("T")[0]} disabled={isDobLocked} />

						{formErrors.dob && <div className="invalid-feedback" style={{ display: 'block' }}>{formErrors.dob}</div>}

					</div>
					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="birthCertificate" className="form-label">Upload 10th/Birth Certificate <span className="text-danger">*</span></label>
						<div className="d-flex gap-4 mt-2 mb-2">
							<div className="form-check">
								<input
									className="form-check-input"
									type="radio"
									name="dobProofType"
									id="birthRadio"
									value="BIRTH_CERT"
									checked={formData.dobProofType === "BIRTH_CERT"}
									onChange={handleRadio}
									disabled={isBirthDocLocked}
								/>
								<label className="form-check-label" htmlFor="birthRadio">
									Birth Certificate
								</label>
							</div>

							<div className="form-check">
								<input
									className="form-check-input"
									type="radio"
									name="dobProofType"
									id="tenthRadio"
									value="TENTH"
									checked={formData.dobProofType === "TENTH"}
									onChange={handleRadio}
									disabled={isBirthDocLocked}
								/>
								<label className="form-check-label" htmlFor="tenthRadio">
									10th Certificate
								</label>
							</div>
						</div>
						{!birthFile && !existingBirthDoc && (
							<div
								id="birthCertificate"
								className={`border rounded d-flex flex-column align-items-center justify-content-center ${formErrors.birthCertificate ? "border-danger" : ""}`}
								style={{
									minHeight: "100px",
									cursor: "pointer",
									opacity: 1
								}}
								onClick={handleBirthBrowse}
							>
								{/* Upload Icon */}
								<FontAwesomeIcon
									icon={faUpload}
									className="me-2 text-secondary"
								/>
								{/* Upload Text */}
								<div className="mt-2" style={{ color: "#7b7b7b", fontWeight: "500" }}>
									Click to upload
								</div>
								<div className="text-muted" style={{ fontSize: "12px" }}>
									PDF, JPG or PNG (Max 2MB)
								</div>
								{/* Hidden File Input */}
								<input
									id="birthCertificateInput"
									type="file"
									accept=".jpg,.jpeg,.png,.pdf"
									style={{ display: "none" }}
									onChange={handleBirthFileChange}
								/>
							</div>
						)}

						{existingBirthDoc && !birthFile && (
							<div
								id="birthCertificate"
								className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
								style={{
									border: "2px solid #bfc8e2",
									borderRadius: "8px",
									background: "#f7f9fc"
								}}
							>
								{/* LEFT SIDE: Check icon + File name + size */}
								<div className="d-flex align-items-center">
									<img
										src={greenCheck}
										style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
										alt="check"
									/>

									<div>
										<div style={{ fontWeight: 600, color: "#42579f" }}>
											{/* {existingBirthDoc.displayName ?? existingBirthDoc.fileName} */}
											{formData.dobProofType === "BIRTH_CERT" ? "Birth Certificate" : "10th Certificate"}
											{/* Birth/10th Certificate */}
										</div>
										{/* <div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(certificateFile.size)}
										</div> */}
									</div>
								</div>

								{/* RIGHT SIDE: View / Edit / Delete */}
								<div className="d-flex gap-2">
									{/* View */}
									{/*	<img
										src={viewIcon}
										alt="View"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => window.open(existingBirthDoc.fileUrl, "_blank")}
									/>*/}
									<div onClick={() => handleEyeClick(existingBirthDoc.fileUrl)}>
										<img src={viewIcon} style={{ width: "25px", cursor: "pointer" }} alt="view" />
									</div>

									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() =>
											handleDeleteDocument(existingBirthDoc, () => {
												setExistingBirthDoc(null);
												setDobValidationStatus(null);
												setIsDobLocked(false);
											})
										}
									/>
								</div>
							</div>
						)}

						{birthFile && (
							<div
								id="birthCertificate"
								className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
								style={{
									border: "2px solid #bfc8e2",
									borderRadius: "8px",
									background: "#f7f9fc"
								}}
							>
								{/* LEFT SIDE: Check icon + File name + size */}
								<div className="d-flex align-items-center">
									<img
										src={greenCheck}
										style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
										alt="check"
									/>
									<div>
										<div style={{ fontWeight: 600, color: "#42579f" }} className="wraptext">
											{birthFile?.name}
										</div>
										<div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(birthFile.size)}
										</div>
									</div>
								</div>

								{/* RIGHT SIDE: View / Edit / Delete */}
								<div className="d-flex gap-2">
									{/* View */}
									<img
										src={viewIcon}
										alt="View"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => window.open(URL.createObjectURL(birthFile), "_blank")}
									/>
									{/* <div onClick={() => handleEyeClick(birthFile)}>
										<img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
									</div> */}
									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => {
											setBirthFile(null);
											setDobValidationStatus(null);
											setIsDobLocked(false);
										}}
									/>
								</div>
							</div>
						)}
						{formErrors.birthCertificate && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.birthCertificate}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="maritalStatus" className="form-label">Marital Status <span className="text-danger">*</span></label>
						<select
							id="maritalStatus"
							value={formData.maritalStatus}
							onChange={handleChange}
							className={`form-select ${formErrors.maritalStatus ? 'is-invalid' : ''}`}
						>
							<option value="">Select Marital Status</option>
							{masterData?.maritalStatus.map(ms => (
								<option key={ms.maritalStatusId} value={ms.maritalStatusId}>
									{ms.maritalStatus}
								</option>
							))}
						</select>
						{formErrors.maritalStatus && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.maritalStatus}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="motherName" className="form-label">Mother Name <span className="text-danger">*</span></label>
						<input type="text" maxLength={200} className={`form-control ${parsedClass("motherName")} ${formErrors.motherName ? 'is-invalid' : ''}`} id="motherName" value={formData?.motherName} onChange={handleChange} onKeyDown={handleNameKeyDown} placeholder='Enter your mother name' />
						{formErrors.motherName && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.motherName}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="fatherName" className="form-label">Father Name <span className="text-danger">*</span></label>
						<input type="text" maxLength={200} className={`form-control ${parsedClass("fatherName")} ${formErrors.fatherName ? 'is-invalid' : ''}`} id="fatherName" value={formData?.fatherName} onChange={handleChange} onKeyDown={handleNameKeyDown} placeholder='Enter your father name' />
						{formErrors.fatherName && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.fatherName}
							</div>
						)}
					</div>
					{isMarried && (
						<div className="col-md-3 col-sm-12 mt-3">
							<label htmlFor="spouseName" className="form-label">Spouse Name <span className="text-danger">*</span></label>
							<input
								type="text"
								maxLength={200}
								className={`form-control ${formErrors.spouseName ? 'is-invalid' : ''}`}
								id="spouseName"
								value={formData?.spouseName}
								onChange={handleChange}
								onKeyDown={handleNameKeyDown}
							/>

							{formErrors.spouseName && (
								<div className="invalid-feedback">
									{formErrors.spouseName}
								</div>
							)}						</div>
					)}

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="contactNumber" className="form-label" style={{ color: '#42579f', fontWeight: 500 }}>Contact Number <span className="text-danger">*</span></label>
						<input
							type="text"
							className={`form-control ${parsedClass("contactNumber")} ${formErrors.contactNumber ? 'is-invalid' : ''}`}
							id="contactNumber"
							maxLength={10}
							inputMode="numeric"
							pattern="[0-9]*"
							value={formData?.contactNumber}
							placeholder='Enter your contact number'
							onChange={handleChange}
							onKeyDown={handleNumericKeyDown}
						/>
						{formErrors.contactNumber && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.contactNumber}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="altNumber" className="form-label">Alternative Number</label>
						<input
							type="text"
							className="form-control"
							id="altNumber"
							maxLength={10}
							inputMode="numeric"
							pattern="[0-9]*"
							value={formData?.altNumber}
							placeholder='Enter your alternate number'
							onChange={handleChange}
							onKeyDown={handleNumericKeyDown}
						/>
						{formErrors.altNumber && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.altNumber}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="cibilScore" className="form-label">
							CIBIL Score <span className="text-danger">*</span>
						</label>

						<input
							type="text"
							id="cibilScore"
							value={formData.cibilScore}
							className={`form-control ${formErrors.cibilScore ? "is-invalid" : ""}`}
							placeholder="Enter CIBIL score"
							inputMode="numeric"      // mobile numeric keypad
							maxLength={3}            // optional: CIBIL usually 300–900
							onChange={(e) => handleCibilChange(e.target.value)}
							onKeyDown={handleNumericKeyDown}
						/>

						{formErrors.cibilScore && (
							<div className="invalid-feedback">
								{formErrors.cibilScore}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="socialMediaLink" className="form-label">Socail Media Profile Link</label>
						<input type="text" maxLength={200} className="form-control" id="socialMediaLink" value={formData?.socialMediaLink} onChange={handleChange} placeholder='Enter your social media profile link' />
					</div>
				</div>

				<div className="px-4 pb-4 rounded row g-4 formfields bg-white border">
					<p className="tab_headers" style={{ marginBottom: '0px', marginTop: '1rem' }}>Community</p>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="nationality" className="form-label">Nationality/Citizenship <span className="text-danger">*</span></label>
						<select
							className={`form-select ${formErrors.nationality ? 'is-invalid' : ''}`}
							id="nationality"
							value={formData?.nationality}
							onChange={handleChange}
						>
							<option value="">Select Nationality</option>
							{masterData?.countries.map(ms => (
								<option key={ms.countryId} value={ms.countryId}>
									{ms.countryName}
								</option>
							))}
						</select>
						{formErrors.nationality && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.nationality}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="religion" className="form-label">Religion <span className="text-danger">*</span></label>
						<select
							id="religion"
							value={formData.religion}
							onChange={handleChange}
							className={`form-select ${formErrors.religion ? 'is-invalid' : ''}`}
						>
							<option value="">Select Religion</option>
							{masterData?.religions
								?.filter(r => r.religion?.toLowerCase() !== "others")
								.map(r => (
									<option key={r.religionId} value={r.religionId}>
										{r.religion}
									</option>
								))}
						</select>
						{formErrors.religion && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.religion}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="category" className="form-label">Category <span className="text-danger">*</span></label>
						<select
							id="category"
							value={formData.category}
							onChange={handleChange}
							className={`form-select ${formErrors.category ? 'is-invalid' : ''}`}
						>
							<option value="">Select Category</option>
							{masterData?.reservationCategories.map(c => (
								<option key={c.reservationCategoriesId} value={c.reservationCategoriesId}>
									{c.categoryName}
								</option>
							))}
						</select>
						{formErrors.category && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.category}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="caste" className="form-label">Community/Caste <span className="text-danger">*</span></label>
						<input type="text" maxLength={200} className={`form-control ${formErrors.caste ? 'is-invalid' : ''}`} id="caste" value={formData?.caste} onChange={handleChange} onKeyDown={handleNameKeyDown} placeholder='Enter your community/caste' />
						{formErrors.caste && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.caste}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="casteState" className="form-label">State to which belong for SC/ST/OBC</label>
						<select
							className="form-select"
							id="casteState"
							value={formData?.casteState}
							onChange={handleChange}
							disabled={isGeneralCategory}
						>
							<option value="">Select State</option>
							{masterData?.states.map(c => (
								<option key={c.stateId} value={c.stateId}>
									{c.stateName}
								</option>
							))}
						</select>
					</div>

					<div className="col-md-6 col-sm-12 mt-3">
						<label htmlFor="communityCertificate" className="form-label">
							Upload Certificate {!isGeneralCategory && <span className="text-danger">*</span>}
						</label>
						{!communityFile && !existingCommunityDoc && (
							<div
								id="communityCertificate"
								className={`border rounded d-flex flex-column align-items-center justify-content-center ${formErrors.communityCertificate ? "border-danger" : ""}`}
								style={{
									minHeight: "100px",
									cursor: isGeneralCategory ? "not-allowed" : "pointer",
									opacity: isGeneralCategory ? 0.6 : 1
								}}
								onClick={!isGeneralCategory ? handleCommunityBrowse : undefined}
							>
								{/* Upload Icon */}
								<FontAwesomeIcon
									icon={faUpload}
									className="me-2 text-secondary"
								/>
								{/* Upload Text */}
								<div className="mt-2" style={{ color: "#7b7b7b", fontWeight: "500" }}>
									Click to upload
								</div>
								<div className="text-muted" style={{ fontSize: "12px" }}>
									PDF, JPG or PNG (Max 2MB)
								</div>
								{/* Hidden File Input */}
								<input
									id="communityCertificateInput"
									type="file"
									accept=".jpg,.jpeg,.png,.pdf"
									style={{ display: "none" }}
									onChange={handleCommunityFileChange}
								/>
							</div>
						)}

						{existingCommunityDoc && !communityFile && (
							<div
								id="communityCertificate"
								className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
								style={{
									border: "2px solid #bfc8e2",
									borderRadius: "8px",
									background: "#f7f9fc"
								}}
							>
								{/* LEFT SIDE: Check icon + File name + size */}
								<div className="d-flex align-items-center">
									<img
										src={greenCheck}
										alt="Check"
										style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
									/>
									<div>
										<div style={{ fontWeight: 600, color: "#42579f" }}>
											{/* {existingCommunityDoc.fileName} */}
											{existingCommunityDoc.displayName ?? existingCommunityDoc.fileName}
										</div>
										{/* <div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(certificateFile.size)}
										</div> */}
									</div>
								</div>

								{/* RIGHT SIDE: View / Edit / Delete */}
								<div className="d-flex gap-2">
									{/* View */}
									{/* <img
										src={viewIcon}
										alt="View"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => window.open(existingCommunityDoc.fileUrl, "_blank")}
									/> */}
									{/* <div onClick={handleEyeClick(existingCommunityDoc.fileUrl)}>
												  <img src={viewIcon} alt='View' style={{ width: '25px', cursor: 'pointer' }} />
									</div> */}
									<div onClick={() => handleEyeClick(existingCommunityDoc.fileUrl)}>
										<img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
									</div>

									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() =>
											handleDeleteDocument(existingCommunityDoc, () => {
												setExistingCommunityDoc(null);
											})
										}
									/>
								</div>
							</div>
						)}

						{communityFile && (
							<div
								id="communityCertificate"
								className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
								style={{
									border: "2px solid #bfc8e2",
									borderRadius: "8px",
									background: "#f7f9fc"
								}}
							>
								{/* LEFT SIDE: Check icon + File name + size */}
								<div className="d-flex align-items-center">
									<img
										src={greenCheck}
										style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
										alt="check"
									/>
									<div>
										<div style={{ fontWeight: 600, color: "#42579f" }}>
											{communityFile?.name}
										</div>
										<div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(communityFile.size)}
										</div>
									</div>
								</div>

								{/* RIGHT SIDE: View / Edit / Delete */}
								<div className="d-flex gap-2">
									{/* View */}
									<img
										src={viewIcon}
										alt="View"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => window.open(URL.createObjectURL(communityFile), "_blank")}
									/>
									{/* 
									<div onClick={() => handleEyeClick(communityFile)}>
										<img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
									</div> */}
									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => setCommunityFile(null)}
									/>
								</div>
							</div>
						)}
						{formErrors.communityCertificate && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.communityCertificate}
							</div>
						)}
					</div>
				</div>

				<div className="px-4 pb-4 rounded row g-4 formfields bg-white border">
					<p className="tab_headers" style={{ marginBottom: '0px', marginTop: '1rem' }}>Siblings</p>
					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="twinSibling" className="form-label">Do you have a twin sibling? <span className="text-danger">*</span></label>
						<select
							className="form-select"
							id="twinSibling"
							value={formData?.twinSibling}
							onChange={(e) => handleTwinSiblingChange(e.target.value)}
						>
							<option value={true}>Yes</option>
							<option value={false}>No</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="siblingName" className="form-label">Twin Sibling's Name</label> {formData?.twinSibling && <span className="text-danger">*</span>}
						<input
							type="text"
							className={`form-control ${formErrors.siblingName ? 'is-invalid' : ''}`}
							id="siblingName"
							disabled={!formData?.twinSibling}
							value={formData?.siblingName}
							onChange={handleChange}
							onKeyDown={handleNameKeyDown}
							placeholder={`Enter your twin sibling's name`}
							maxLength={200}
						/>
						{formErrors.siblingName && <div className="invalid-feedback">{formErrors.siblingName}</div>}
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="twinGender" className="form-label">Gender of the twin</label> {formData?.twinSibling && <span className="text-danger">*</span>}
						<select
							className={`form-select ${formErrors.twinGender ? 'is-invalid' : ''}`}
							id="twinGender"
							value={formData?.twinGender}
							onChange={handleChange}
							disabled={!formData?.twinSibling}
						>
							<option value="">Select Gender</option>
							{masterData?.genders.map(g => (
								<option key={g.genderId} value={g.genderId}>
									{g.gender}
								</option>
							))}
						</select>
						{formErrors.twinGender && <div className="invalid-feedback">{formErrors.twinGender}</div>}
					</div>
				</div>

				<div className="px-4 pb-4 rounded row g-4 formfields bg-white border">
					<p className="tab_headers" style={{ marginBottom: '0px', marginTop: '1rem' }}>Disability</p>
					<div className="col-md-4 col-sm-12 mt-3">
						<label htmlFor="disability" className="form-label">Person with Disability? <span className="text-danger">*</span></label>
						<select
							className="form-select"
							id="disability"
							value={formData?.isDisabledPerson}
							onChange={(e) => handleDisabilityStatusChange(e.target.value)}
						>
							<option value={true}>Yes</option>
							<option value={false}>No</option>
						</select>
					</div>

					<div className="col-md-4 col-sm-12 mt-3">
						<label htmlFor="scribeRequirement" className="form-label">Scribe Requirement</label> {formData?.isDisabledPerson && <span className="text-danger">*</span>}
						<select
							className={`form-select ${formErrors.scribeRequirement ? 'is-invalid' : ''
								}`}
							id="scribeRequirement"
							value={formData?.scribeRequirement}
							onChange={handleChange}
							disabled={!formData?.isDisabledPerson}

						>
							<option value="">Select Scribe Requirement</option>
							<option value="Yes">Yes</option>
							<option value="No">No</option>
						</select>

						{formErrors.scribeRequirement && (
							<div className="invalid-feedback">
								{formErrors.scribeRequirement}
							</div>
						)}
					</div>

					<div className="col-md-4 col-sm-12 mt-3">
						<label htmlFor="disabilityCertificate" className="form-label">Upload Certificate</label> {formData?.isDisabledPerson && <span className="text-danger">*</span>}
						{!disabilityFile && !existingDisabilityDoc && (
							<div
								id='disabilityCertificate'
								className="border rounded d-flex flex-column align-items-center justify-content-center"
								style={{
									minHeight: "100px",
									cursor: !formData?.isDisabledPerson ? "not-allowed" : "pointer",
									opacity: !formData?.isDisabledPerson ? 0.6 : 1
								}}
								onClick={formData?.isDisabledPerson ? handleDisabilityBrowse : undefined}

							>
								{/* Upload Icon */}
								<FontAwesomeIcon
									icon={faUpload}
									className="me-2 text-secondary"
								/>
								{/* Upload Text */}
								<div className="mt-2" style={{ color: "#7b7b7b", fontWeight: "500" }}>
									Click to upload
								</div>
								<div className="text-muted" style={{ fontSize: "12px" }}>
									PDF, JPG or PNG (Max 2MB)
								</div>
								{/* Hidden File Input */}
								<input
									id="disabilityCertificateInput"
									type="file"
									accept=".jpg,.jpeg,.png,.pdf"
									style={{ display: "none" }}
									onChange={handleDisabilityFileChange}
								/>
							</div>
						)}

						{/* Show File Name */}
						{existingDisabilityDoc && !disabilityFile && (
							<div
								id='disabilityCertificate'
								className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
								style={{
									border: "2px solid #bfc8e2",
									borderRadius: "8px",
									background: "#f7f9fc"
								}}
							>
								{/* LEFT SIDE: Check icon + File name + size */}
								<div className="d-flex align-items-center">
									<img
										src={greenCheck}
										style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
										alt="check"
									/>
									<div>
										<div style={{ fontWeight: 600, color: "#42579f" }}>
											{existingDisabilityDoc.displayName ?? existingDisabilityDoc.fileName}
										</div>
										{/* <div className="text-muted" style={{ fontSize: "12px" }}>
										{formatFileSize(certificateFile.size)}
									</div> */}
									</div>
								</div>

								{/* RIGHT SIDE: View / Edit / Delete */}
								<div className="d-flex gap-2">
									{/* View */}
									{/* <img
										src={viewIcon}
										alt="View"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => window.open(existingDisabilityDoc.fileUrl, "_blank")}
									/> */}

									<div onClick={() => handleEyeClick(existingDisabilityDoc.fileUrl)}>
										<img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
									</div>

									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() =>
											handleDeleteDocument(existingDisabilityDoc, () => {
												setExistingDisabilityDoc(null);
											})
										}
									/>
								</div>
							</div>
						)}

						{disabilityFile && (
							<div
								id="disabilityCertificate"
								className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
								style={{
									border: "2px solid #bfc8e2",
									borderRadius: "8px",
									background: "#f7f9fc"
								}}
							>
								{/* LEFT SIDE: Check icon + File name + size */}
								<div className="d-flex align-items-center">
									<img
										src={greenCheck}
										style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
										alt="check"
									/>
									<div>
										<div style={{ fontWeight: 600, color: "#42579f" }}>
											{disabilityFile?.name}
										</div>
										<div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(disabilityFile.size)}
										</div>
									</div>
								</div>

								{/* RIGHT SIDE: View / Edit / Delete */}
								<div className="d-flex gap-2">
									{/* View */}
									<img
										src={viewIcon}
										alt="View"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => window.open(URL.createObjectURL(disabilityFile), "_blank")}
									/>
									{/* <div onClick={() => handleEyeClick(disabilityFile)}>
										<img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
									</div> */}
									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => setDisabilityFile(null)}
									/>
								</div>
							</div>
						)}
						{formErrors.disabilityCertificate && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.disabilityCertificate}
							</div>
						)}
					</div>

					<div className="d-flex justify-content-end mt-2">
						<button
							type="button"
							className="btn btn-primary mt-3"
							style={{
								backgroundColor: "#ff7043",
								border: "none",
								padding: "0.25rem 1rem",
								borderRadius: "4px",
								color: "#fff",
								fontSize: '0.875rem'
							}}
							onClick={addDisability}
							disabled={!formData.isDisabledPerson}
						>
							+ Add Disability
						</button>
					</div>

					{formData.disabilities.map((dis, index) => (
						<div key={index} className='border rounded d-flex pb-3 px-4 gap-3'>
							<div className="col-md-6 col-sm-12 mt-2">
								<label htmlFor={`disabilityType_${index}`} className="form-label">Type of Disability</label> {formData?.isDisabledPerson && <span className="text-danger">*</span>}
								<select
									id={`disabilityType_${index}`}
									value={dis.disabilityCategoryId}
									onChange={(e) =>
										handleDisabilityChange(index, 'disabilityCategoryId', e.target.value)
									}

									className={`form-select ${formErrors[`disabilityType_${index}`] ? 'is-invalid' : ''
										}`}
								>
									<option value="">Select Disability Type</option>
									{getAvailableDisabilityTypes(index).map(d => (
										<option key={d.disabilityCategoryId} value={d.disabilityCategoryId}>
											{d.disabilityName}
										</option>
									))}
								</select>

								{formErrors[`disabilityType_${index}`] && (
									<div className="invalid-feedback">
										{formErrors[`disabilityType_${index}`]}
									</div>
								)}
							</div>

							<div className="col-md-5 col-sm-12 mt-2">
								<label htmlFor={`disabilityPercentage-${index}`} className="form-label">Disability Percentage</label> {formData?.isDisabledPerson && <span className="text-danger">*</span>}
								<div className='d-flex gap-1 align-items-center'>
									<input
										type="number"
										className={`form-control ${formErrors[`disabilityPercentage_${index}`] ? 'is-invalid' : ''
											}`}
										id={`disabilityPercentage_${index}`}
										value={dis.disabilityPercentage}
										min={1}
										max={100}
										disabled={!formData.isDisabledPerson}
										placeholder="1 - 100"
										onChange={(e) => {
											let value = e.target.value;
											if (value === "") {
												handleDisabilityChange(index, 'disabilityPercentage', "");
												return;
											}
											value = Number(value);
											if (value < 1) value = 1;
											if (value > 100) value = 100;
											handleDisabilityChange(index, 'disabilityPercentage', value);
										}}
									/>
									<span className="">%</span>
								</div>
								{formErrors[`disabilityPercentage_${index}`] && (
									<div className="invalid-feedback d-block">
										{formErrors[`disabilityPercentage_${index}`]}
									</div>
								)}
							</div>

							{formData.disabilities.length > 1 && (
								<div className="col-md-2 col-sm-12 d-flex align-items-end">
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => removeDisability(index)}
									/>
								</div>
							)}
						</div>
					))}
				</div>

				<div className="px-4 pb-4 rounded row g-4 formfields bg-white border">
					<p className="tab_headers" style={{ marginBottom: '0px', marginTop: '1rem' }}>Ex-Service Person</p>
					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="servicePerson" className="form-label">Ex Service Person?</label>
						<select
							className="form-select"
							id="servicePerson"
							value={formData?.isExService}
							onChange={(e) =>
								setFormData(prev => ({
									...prev,
									isExService: e.target.value === "true"
								}))
							}
							required
						>
							<option value={true}>Yes</option>
							<option value={false}>No</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="serviceEnrollment" className="form-label">Service Start Enrollment Date</label> {formData?.isExService && <span className="text-danger">*</span>}
						<input
							type="date"
							className={`form-control ${formErrors.serviceEnrollment ? "is-invalid" : ""
								}`}
							id="serviceEnrollment"
							disabled={!formData?.isExService}
							value={formData?.serviceEnrollment}
							onChange={handleChange}
							max={new Date().toISOString().split("T")[0]}
						/>

						{formErrors.serviceEnrollment && (
							<div className="invalid-feedback">
								{formErrors.serviceEnrollment}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="dischargeDate" className="form-label">Discharge Date</label> {formData?.isExService && <span className="text-danger">*</span>}
						<input
							type="date"
							className={`form-control ${formErrors.dischargeDate ? "is-invalid" : ""
								}`}
							id="dischargeDate"
							disabled={!formData?.isExService}
							value={formData?.dischargeDate}
							onChange={handleChange}
							min={formData.serviceEnrollment || undefined}
							max={new Date().toISOString().split("T")[0]}
						/>

						{formErrors.dischargeDate && (
							<div className="invalid-feedback">
								{formErrors.dischargeDate}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-3">
						<label htmlFor="servicePeriod" className="form-label">Service Period (in Months)</label>
						<input type="number" className="form-control" id="servicePeriod" disabled value={formData?.servicePeriod} onChange={handleChange} placeholder='Enter your service period' />
					</div>
					<div className='col-md-6 d-flex flex-column'>
						<div className="col-md-12 col-sm-12 d-grid">
							<div>
								<label htmlFor='employmentSecured' className="form-label">
									Have you already secured regular employment under the Central Govt. in a civil post?
								</label>
							</div>

							<div>
								<Form.Check
									type="radio"
									id="employmentSecuredYes"
									name="employmentSecured"
									value="Yes"
									label="Yes"
									checked={formData?.employmentSecured === "Yes"}
									onChange={handleRadio}
									inline
									style={{ fontSize: "12px" }}
								/>
								<Form.Check
									type="radio"
									id="employmentSecuredNo"
									name="employmentSecured"
									value="No"
									label="No"
									checked={formData?.employmentSecured === "No"}
									onChange={handleRadio}
									inline
									style={{ fontSize: "12px", marginLeft: '1rem' }}
								/>
							</div>
						</div>

						<div className="col-md-12 col-sm-12 mt-3 d-grid">
							<div>
								<label htmlFor='lowerPostYes' className="form-label">
									If Yes, then are you at present serving at a post lower than the one advertised?
								</label>
							</div>

							<div>
								<Form.Check
									type="radio"
									id="lowerPostYes"
									name="lowerPostStatus"
									value="Yes"
									label="Yes"
									checked={formData?.lowerPostStatus === "Yes"}
									onChange={handleRadio}
									inline
									style={{ fontSize: "12px" }}
								/>
								<Form.Check
									type="radio"
									id="lowerPostNo"
									name="lowerPostStatus"
									value="No"
									label="No"
									checked={formData?.lowerPostStatus === "No"}
									onChange={handleRadio}
									inline
									style={{ fontSize: "12px", marginLeft: '1rem' }}
								/>
							</div>
						</div>
					</div>
					<div className="col-md-6 col-sm-12 mt-4">
						<label htmlFor="serviceCertificate" className="form-label">Upload Certificate</label> {formData?.isExService && <span className="text-danger">*</span>}
						{!serviceFile && !existingServiceDoc && (
							<div
								id='serviceCertificate'
								className={`border rounded d-flex flex-column align-items-center justify-content-center ${formErrors.serviceCertificate ? "border-danger" : ""
									}`}
								style={{
									minHeight: "100px",
									cursor: !formData?.isExService ? "not-allowed" : "pointer",
									opacity: !formData?.isExService ? 0.6 : 1
								}}
								onClick={formData?.isExService ? handleServiceBrowse : undefined}
							>
								{/* Upload Icon */}
								<FontAwesomeIcon
									icon={faUpload}
									className="me-2 text-secondary"
								/>
								{/* Upload Text */}
								<div className="mt-2" style={{ color: "#7b7b7b", fontWeight: "500" }}>
									Click to upload
								</div>
								<div className="text-muted" style={{ fontSize: "12px" }}>
									PDF, JPG or PNG (Max 2MB)
								</div>
								{/* Hidden File Input */}
								<input
									id="serviceCertificateInput"
									type="file"
									accept=".jpg,.jpeg,.png,.pdf"
									style={{ display: "none" }}
									onChange={handleServiceFileChange}
								/>
							</div>
						)}

						{/* Show File Name */}
						{existingServiceDoc && !serviceFile && (
							<div
								id='serviceCertificate'
								className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
								style={{
									border: "2px solid #bfc8e2",
									borderRadius: "8px",
									background: "#f7f9fc"
								}}
							>
								{/* LEFT SIDE: Check icon + File name + size */}
								<div className="d-flex align-items-center">
									<img
										src={greenCheck}
										style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
										alt="check"
									/>

									<div>
										<div style={{ fontWeight: 600, color: "#42579f" }}>
											{existingServiceDoc.displayName ?? existingServiceDoc.fileName}
										</div>
										{/* <div className="text-muted" style={{ fontSize: "12px" }}>
										{formatFileSize(certificateFile.size)}
									</div> */}
									</div>
								</div>

								{/* RIGHT SIDE: View / Edit / Delete */}
								<div className="d-flex gap-2">
									{/* View */}
									{/* <img
										src={viewIcon}
										alt="View"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => window.open(existingServiceDoc.fileUrl, "_blank")}
									/> */}
									<div onClick={() => handleEyeClick(existingServiceDoc.fileUrl)}>
										<img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
									</div>
									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() =>
											handleDeleteDocument(existingServiceDoc, () => {
												setExistingServiceDoc(null);
											})
										}
									/>
								</div>
							</div>
						)}

						{serviceFile && (
							<div
								id="serviceCertificate"
								className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
								style={{
									border: "2px solid #bfc8e2",
									borderRadius: "8px",
									background: "#f7f9fc"
								}}
							>
								{/* LEFT SIDE: Check icon + File name + size */}
								<div className="d-flex align-items-center">
									<img
										src={greenCheck}
										style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
										alt="check"
									/>
									<div>
										<div style={{ fontWeight: 600, color: "#42579f" }}>
											{serviceFile?.name}
										</div>
										<div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(serviceFile.size)}
										</div>
									</div>
								</div>

								{/* RIGHT SIDE: View / Edit / Delete */}
								<div className="d-flex gap-2">
									{/* View */}
									<img
										src={viewIcon}
										alt="View"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => window.open(URL.createObjectURL(serviceFile), "_blank")}
									/>

									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => setServiceFile(null)}
									/>
								</div>
							</div>
						)}
						{formErrors.serviceCertificate && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.serviceCertificate}
							</div>
						)}
					</div>
				</div>

				<div className="px-4 pb-4 rounded row g-4 formfields bg-white border">
					<p className="tab_headers" style={{ marginBottom: '0px', marginTop: '1rem' }}>Language Proficiency</p>
					<div className="col-md-4 col-sm-12 mt-3">
						<label htmlFor="language1" className="form-label">Language 1 <span className="text-danger">*</span></label>
						<select
							id="language1"
							value={formData.language1}
							onChange={handleChange}
							className={`form-select ${formErrors.language1 ? "is-invalid" : ""}`}
						>
							<option value="">Select Language 1</option>
							{getAvailableLanguages([
								formData.language2,
								formData.language3
							]).map(l => (
								<option key={l.languageId} value={l.languageId}>
									{l.languageName}
								</option>
							))}
						</select>
						{formErrors.language1 && <div className="invalid-feedback">{formErrors.language1}</div>}
						<div className="d-flex">
							<Form.Check
								type="checkbox"
								id="language1Read"
								label="Read"
								checked={formData?.language1Read}
								onChange={handleCheckbox}
								inline
								style={{ marginTop: '0.4rem' }}
							/>
							<Form.Check
								type="checkbox"
								id="language1Write"
								label="Write"
								checked={formData?.language1Write}
								onChange={handleCheckbox}
								inline
								style={{ marginTop: '0.4rem' }}
							/>
							<Form.Check
								type="checkbox"
								id="language1Speak"
								label="Speak"
								checked={formData?.language1Speak}
								onChange={handleCheckbox}
								inline
								style={{ marginTop: '0.4rem' }}
							/>
						</div>
						{formErrors.language1Proficiency && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.language1Proficiency}
							</div>
						)}
					</div>

					<div className="col-md-4 col-sm-12 mt-3">
						<label htmlFor="language2" className="form-label">Language 2</label>
						<select
							id="language2"
							value={formData.language2}
							onChange={handleChange}
							className="form-select"
						>
							<option value="">Select Language 2</option>
							{getAvailableLanguages([
								formData.language1,
								formData.language3
							]).map(l => (
								<option key={l.languageId} value={l.languageId}>
									{l.languageName}
								</option>
							))}
						</select>
						<div className="d-flex">
							<Form.Check
								type="checkbox"
								id="language2Read"
								label="Read"
								checked={formData?.language2Read}
								onChange={handleCheckbox}
								inline
								style={{ marginTop: '0.4rem' }}
							/>
							<Form.Check
								type="checkbox"
								id="language2Write"
								label="Write"
								checked={formData?.language2Write}
								onChange={handleCheckbox}
								inline
								style={{ marginTop: '0.4rem' }}
							/>
							<Form.Check
								type="checkbox"
								id="language2Speak"
								label="Speak"
								checked={formData?.language2Speak}
								onChange={handleCheckbox}
								inline
								style={{ marginTop: '0.4rem' }}
							/>
						</div>
						{formErrors.language2Proficiency && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.language2Proficiency}
							</div>
						)}
					</div>

					<div className="col-md-4 col-sm-12 mt-3">
						<label htmlFor="language3" className="form-label">Language 3</label>
						<select
							id="language3"
							value={formData.language3}
							onChange={handleChange}
							className="form-select"
						>
							<option value="">Select Language 3</option>
							{getAvailableLanguages([
								formData.language1,
								formData.language2
							]).map(l => (
								<option key={l.languageId} value={l.languageId}>
									{l.languageName}
								</option>
							))}
						</select>
						<div className="d-flex">
							<Form.Check
								type="checkbox"
								id="language3Read"
								label="Read"
								checked={formData?.language3Read}
								onChange={handleCheckbox}
								inline
								style={{ marginTop: '0.4rem' }}
							/>
							<Form.Check
								type="checkbox"
								id="language3Write"
								label="Write"
								checked={formData?.language3Write}
								onChange={handleCheckbox}
								inline
								style={{ marginTop: '0.4rem' }}
							/>
							<Form.Check
								type="checkbox"
								id="language3Speak"
								label="Speak"
								checked={formData?.language3Speak}
								onChange={handleCheckbox}
								inline
								style={{ marginTop: '0.4rem' }}
							/>
						</div>
						{formErrors.language3Proficiency && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.language3Proficiency}
							</div>
						)}
					</div>
				</div>

				<div className="px-4 pb-4 rounded row g-4 formfields bg-white border">
					<div className="col-md-6 col-sm-12 mt-4 d-grid">
						<div>
							<label htmlFor='riotVictimFamilyYes' className="form-label">
								Are you a child/family member of those who died in 1984 riots?
							</label>
						</div>
						<div>
							<Form.Check
								type="radio"
								id="riotVictimFamilyYes"
								name="riotVictimFamily"
								value="Yes"
								label="Yes"
								checked={formData?.riotVictimFamily === "Yes"}
								onChange={handleRadio}
								inline
								style={{ fontSize: "12px" }}
							/>
							<Form.Check
								type="radio"
								id="riotVictimFamilyNo"
								name="riotVictimFamily"
								value="No"
								label="No"
								checked={formData?.riotVictimFamily === "No"}
								onChange={handleRadio}
								inline
								style={{ fontSize: "12px", marginLeft: '1rem' }}
							/>
						</div>
					</div>

					<div className="col-md-6 col-sm-12 mt-4 d-grid">
						<div>
							<label htmlFor='servingInGovtYes' className="form-label">
								Whether serving in Govt./quasi Govt./Public Sector Undertaking?
							</label>
						</div>
						<div>
							<Form.Check
								type="radio"
								id="servingInGovtYes"
								name="servingInGovt"
								value="Yes"
								label="Yes"
								checked={formData?.servingInGovt === "Yes"}
								onChange={handleRadio}
								inline
								style={{ fontSize: "12px" }}
							/>
							<Form.Check
								type="radio"
								id="servingInGovtNo"
								name="servingInGovt"
								value="No"
								label="No"
								checked={formData?.servingInGovt === "No"}
								onChange={handleRadio}
								inline
								style={{ fontSize: "12px", marginLeft: '1rem' }}
							/>
						</div>
					</div>
					{!isHindu && formData.religion && (
						<div className="col-md-6 col-sm-12 mt-3 d-grid">
							<div>
								<label htmlFor='minorityCommunityYes' className="form-label">
									Do you belong to Religious Minority Community?
								</label>
							</div>
							<div>
								<Form.Check
									type="radio"
									id="minorityCommunityYes"
									name="minorityCommunity"
									value="Yes"
									label="Yes"
									checked={formData?.minorityCommunity === "Yes"}
									onChange={handleRadio}
									inline
									style={{ fontSize: "12px" }}
								/>
								<Form.Check
									type="radio"
									id="minorityCommunityNo"
									name="minorityCommunity"
									value="No"
									label="No"
									checked={formData?.minorityCommunity === "No"}
									onChange={handleRadio}
									inline
									style={{ fontSize: "12px", marginLeft: '1rem' }}
								/>
							</div>
						</div>
					)}

					<div className="col-md-6 col-sm-12 mt-3 d-grid">
						<div>
							<label htmlFor='disciplinaryActionYes' className="form-label">
								Any disciplinary action in any of your previous/current employment?
							</label>
						</div>
						<div>
							<Form.Check
								type="radio"
								id="disciplinaryActionYes"
								name="disciplinaryAction"
								value="Yes"
								label="Yes"
								checked={formData?.disciplinaryAction === "Yes"}
								onChange={handleRadio}
								inline
								style={{ fontSize: "12px" }}
							/>
							<Form.Check
								type="radio"
								id="disciplinaryActionNo"
								name="disciplinaryAction"
								value="No"
								label="No"
								checked={formData?.disciplinaryAction === "No"}
								onChange={handleRadio}
								inline
								style={{ fontSize: "12px", marginLeft: '1rem' }}
							/>
						</div>
					</div>

					<div className="d-flex justify-content-between mt-2">
						<div>
							<BackButtonWithConfirmation goBack={goBack} isDirty={isDirty} />
						</div>
						<div>
							<button
								type="submit"
								className="btn btn-primary"
								style={{
									backgroundColor: "#ff7043",
									border: "none",
									padding: "0.6rem 2rem",
									borderRadius: "4px",
									color: "#fff",
									fontSize: '0.875rem'
								}}
							>
								Save & Next
								<FontAwesomeIcon icon={faChevronRight} size='sm' className="ms-2" />
								{/* <span className='px-2' style={{ fontSize: '1.25rem' }}>></span> */}
							</button>
						</div>
					</div>
				</div>
			</form >
		</div >
	)
}

export default BasicDetails