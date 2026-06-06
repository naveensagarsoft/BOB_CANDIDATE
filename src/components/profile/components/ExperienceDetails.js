import { faChevronRight, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import deleteIcon from '../../../assets/delete-icon.png';
import editIcon from '../../../assets/edit-icon.png';
import viewIcon from '../../../assets/view-icon.png';
import { toast } from 'react-toastify';
import BackButtonWithConfirmation from '../../../shared/components/BackButtonWithConfirmation';
import { Form } from 'react-bootstrap';
import bulbIcon from '../../../assets/bulb-icon.png';
import Loader from '../../../shared/components/Loader';
import greenCheck from '../../../assets/green-check.png'
import { handleEyeClick } from "../../../shared/utils/fileDownload";
import { useExperienceDetails } from '../hooks/experienceHooks';

import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";

const ExperienceDetails = ({ goNext, goBack }) => {
	// ✅ Get education list for cross-profile date collision check
	const educationList = useSelector((state) => state.resume?.list || []);

	const {
		experienceList,
		formData,
		formErrors,
		setFormErrors,
		certificateFile,
		existingDocument,
		isEditMode,
		isFresher,
		showFresherOption,
		totalExperienceMonths,
		totalExperienceDays,
		isDirty,
		loading,
		fileInputRef,
		ctcDisplay,

		setIsFresher,
		handleChange,
		handleCTCFocus,
		handleCTCBlur,
		handleCTCChange,
		handleFileChange,
		handleWorkingChange,
		handleBrowse,
		saveExperience,
		handleEdit,
		handleDelete,
		handleCancelEdit,
		saveAndNext,
		clearExistingDocument,
		formatFileSize,
		showModal,
		setShowModal,
		docError,
		formatTotalExperience

	} = useExperienceDetails({ goNext });


	const formatDateDDMMYYYY = (date) => {
		if (!date) return "-";

		// If backend sends only YYYY-MM-DD
		const [year, month, day] = date.split("-");
		return `${day}-${month}-${year}`;
	};


	const handleAddClick = () => {
		setFormErrors({});   // clear validation
		handleCancelEdit(); // reset form
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
	};

	const handleEditClick = (item) => {
		handleEdit(item);
		setShowModal(true);
	};

	return (
		<div className="px-4 py-3 border rounded bg-white">
			<div className="d-flex justify-content-between">
				<div>
					<p className="tab_headers" style={{ marginBottom: '0px' }}>Experience Details</p>
				</div>
				{experienceList.length >= 1 && (
					<div className='mb-3'>
						<button
							type="button"
							className="btn orange-button"
							onClick={handleAddClick}
							disabled={isFresher}
						>
							+ Add
						</button>
					</div>
				)}
			</div>

			{showFresherOption && experienceList.length === 0 && (
				<div className="d-flex justify-content-between mb-3 mt-2">

					<div className='d-flex align-items-center gap-2 py-1 px-2 rounded' style={{ width: '120px', backgroundColor: '#fff7ed', border: '1px solid #e7946dff' }}>
						<Form.Check
							type="checkbox"
							id="fresherCheckbox"
							label="I'm fresher"
							checked={isFresher}
							onChange={(e) => {
								setIsFresher(e.target.checked);
							}}
							style={{ fontSize: '14px', color: '#6e6e6e', fontWeight: 500 }}
						/>
					</div>

					<button
						type="button"
						className="btn orange-button"
						onClick={handleAddClick}
						disabled={isFresher}
					>
						+ Add
					</button>

				</div>
			)}

			<Modal
				show={showModal}
				onHide={handleCloseModal}
				size="lg"
				centered
			>
				<Modal.Header className="border-bottom pb-3" closeButton>
					<Modal.Title className="cerhead">
						{isEditMode ? "Edit Experience" : "Add Experience"}
					</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<form className="row g-4 formfields mt-2"
						// onSubmit={handleSubmit}
						onSubmit={(e) => {
							e.preventDefault();
							saveAndNext();
						}}
						// onInvalid={handleInvalid}
						// onInput={handleInput}
						noValidate
					>
						{/* <p className="tab_headers" style={{ marginBottom: '0px' }}>Experience Details</p> */}

						<div className="col-md-4 col-sm-12 mt-2">
							<label htmlFor="organization" className="form-label">Organization <span className="text-danger">*</span></label>
							<input type="text" maxLength={200} className={`form-control ${formErrors.organization ? "is-invalid" : ""}`} id="organization" value={formData.organization} onChange={handleChange} disabled={isFresher === true} required={isFresher === false} />
							{formErrors.organization && (
								<div className="invalid-feedback">{formErrors.organization}</div>
							)}
						</div>

						<div className="col-md-4 col-sm-12 mt-2">
							<label htmlFor="role" className="form-label">Role <span className="text-danger">*</span></label>
							<input type="text" maxLength={200} className={`form-control ${formErrors.role ? "is-invalid" : ""}`} id="role" value={formData.role} onChange={handleChange} disabled={isFresher === true} required={isFresher === false} />
							{formErrors.role && (
								<div className="invalid-feedback">{formErrors.role}</div>
							)}
						</div>

						<div className="col-md-4 col-sm-12 mt-2">
							<label htmlFor="postHeld" className="form-label">Post Held <span className="text-danger">*</span></label>
							<input type="text" maxLength={200} className={`form-control ${formErrors.postHeld ? "is-invalid" : ""}`} id="postHeld" value={formData.postHeld} onChange={handleChange} disabled={isFresher === true} required={isFresher === false} />
							{formErrors.postHeld && (
								<div className="invalid-feedback">{formErrors.postHeld}</div>
							)}
						</div>
						<div className="col-md-4 col-sm-12 mt-3">
							<label htmlFor="from" className="form-label">From <span className="text-danger">*</span></label>
							<input type="date" className={`form-control ${formErrors.from ? "is-invalid" : ""}`} id="from" value={formData.from} onChange={handleChange} disabled={isFresher === true} required={isFresher === false} />
							{formErrors.from && (
								<div className="invalid-feedback">{formErrors.from}</div>
							)}
						</div>

						<div className="col-md-4 col-sm-12 mt-3">
							<label htmlFor="to" className="form-label">To {formData.working === false && (<span className="text-danger">*</span>)}</label>
							<input type="date" className={`form-control ${formErrors.to ? "is-invalid" : ""}`} id="to" value={formData.to} onChange={handleChange} disabled={isFresher === true || formData.working === true} required={isFresher === false && formData.working === false} min={formData.from || undefined} />
							{formErrors.to && (
								<div className="invalid-feedback">{formErrors.to}</div>
							)}
						</div>

						<div className="col-md-4 col-sm-12 mt-3">
							<label htmlFor="working" className="form-label">Presently Working <span className="text-danger">*</span></label>
							<select
								className={`form-select ${formErrors.working ? "is-invalid" : ""}`}
								id="working"
								value={String(formData.working)}
								onChange={(e) => handleWorkingChange(e.target.value)}
								disabled={isFresher}
								required={isFresher === false}
							>
								<option value="true">Yes</option>
								<option value="false">No</option>
							</select>
							{formErrors.working && (
								<div className="invalid-feedback">{formErrors.working}</div>
							)}
						</div>

						{formData.working === true && (
							<div className="col-md-4 col-sm-12 mt-3">
								<label htmlFor="currentCTC" className="form-label">Current CTC <span className="text-danger">*</span></label>
								<input
									type="text"
									inputMode="numeric"
									className={`form-control ${formErrors.currentCTC ? "is-invalid" : ""}`}
									id="currentCTC"
									name="currentCTC"
									value={ctcDisplay}
									onChange={handleCTCChange}
									onFocus={handleCTCFocus}
									onBlur={handleCTCBlur}
									disabled={isFresher === true}
									required={isFresher === false}
								/>
								{formErrors.currentCTC && (
									<div className="invalid-feedback">{formErrors.currentCTC}</div>
								)}
							</div>
						)}

						<div className="col-md-4 col-sm-12 mt-3">
							<label htmlFor="description" className="form-label">Brief Description <span className="text-danger">*</span></label>
							<textarea className={`form-control ${formErrors.description ? "is-invalid" : ""}`} maxLength={2000} id="description" rows={4} value={formData.description} onChange={handleChange} disabled={isFresher === true} required={isFresher === false} />
							{formErrors.description && (
								<div className="invalid-feedback">{formErrors.description}</div>
							)}
						</div>

						<div className="col-md-4 col-sm-12 mt-3">
							<label htmlFor='file' className="form-label">
								Experience Certificate <span className="text-danger">*</span>
							</label>

							{/* Wrapper to show red border on error */}
							<div
								className={`border rounded ${formErrors.certificate ? "border-danger" : ""
									}`}
							>
								{/* Upload box */}
								{!certificateFile && !existingDocument && (
									<div
										className="d-flex flex-column align-items-center justify-content-center"
										style={{
											minHeight: "100px",
											cursor: isFresher ? "not-allowed" : "pointer",
											opacity: isFresher ? 0.6 : 1
										}}
										onClick={!isFresher ? handleBrowse : undefined}
									>
										<FontAwesomeIcon icon={faUpload} className="text-secondary" />

										<div className="mt-2" style={{ color: "#7b7b7b", fontWeight: 500 }}>
											Click to upload
										</div>

										<div className="text-muted" style={{ fontSize: "12px" }}>
											Max: 2MB (jpg, png, pdf)
										</div>

										<input
											id='file'
											ref={fileInputRef}
											type="file"
											accept=".jpg,.jpeg,.png,.pdf"
											hidden
											onChange={handleFileChange}
										/>
									</div>
								)}

								{/* Existing document */}
								{existingDocument && !certificateFile && (
									<div className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
										style={{
											border: "2px solid #bfc8e2",
											borderRadius: "8px",
											background: "#f7f9fc"
										}}
									>
										<div className="d-flex align-items-center">
											<img
												src={greenCheck}
												alt="Check"
												style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
											/>
											<div style={{ fontWeight: 600 }} className="wraptext">
												{existingDocument.displayName ?? existingDocument.fileName}
											</div>
										</div>

										<div className='d-flex gap-2'>
											{/* <img
										src={viewIcon}
										alt="View"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => window.open(existingDocument.fileUrl, "_blank")}
									/> */}
											<div onClick={() => handleEyeClick(existingDocument.fileUrl)}>
												<img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
											</div>
											<img
												src={deleteIcon}
												alt="Delete"
												style={{ width: "22px", cursor: "pointer" }}
												onClick={clearExistingDocument}
											/>
										</div>
									</div>
								)}

								{/* New uploaded file */}
								{certificateFile && (
									<div className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
										style={{
											border: "2px solid #bfc8e2",
											borderRadius: "8px",
											background: "#f7f9fc"
										}}
									>
										<div className="d-flex align-items-center">
											<img
												src={greenCheck}
												alt="Check"
												style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
											/>
											<div>
												<div style={{ fontWeight: 600 }} className="wraptext">{certificateFile.name}</div>
												<div className="text-muted" style={{ fontSize: "12px" }}>
													{formatFileSize(certificateFile.size)}
												</div>
											</div>
										</div>

										<div className='d-flex gap-2'>
											<img
												src={viewIcon}
												alt="View"
												style={{ width: "25px", cursor: "pointer" }}
												onClick={() => window.open(URL.createObjectURL(certificateFile), "_blank")}
											/>
											<img
												src={deleteIcon}
												alt="Delete"
												style={{ width: "22px", cursor: "pointer" }}
												onClick={clearExistingDocument}
											/>
										</div>
									</div>
								)}
							</div>

							{/* ❌ Validation error */}
							{(formErrors.certificate || docError) && (
								<div className="text-danger mt-1" style={{ fontSize: "13px" }}>
									{formErrors.certificate || docError}
								</div>
							)}
						</div>


						<div className="d-flex justify-content-between gap-3 mt-4">
							<div className='d-flex'>
								<img src={bulbIcon} alt="Bulb" style={{ width: '25px', height: '25px', marginTop: '6px', marginRight: '5px' }} />
								<p className='orange_text mt-2 mb-0'>If multiple roles/posts were held in the same organization, please record each one separately.</p>
							</div>
							{!isEditMode ? (
								<button
									type="button"
									className="btn orange-button"
									onClick={saveExperience}
									disabled={isFresher}
								>
									Save
								</button>
							) : (
								<div className="d-flex gap-2">
									{/* <button
								type="button"
								className="btn btn-outline-secondary text-muted"
								onClick={handleEdit}
							>
								Cancel
							</button> */}

									<button
										type="button"
										className="btn orange-button"
										onClick={saveExperience}
									>
										Update
									</button>
								</div>
							)}
						</div>
					</form>
				</Modal.Body>
			</Modal>

			<div className="d-none d-md-block w-100">
				<table className='experience_table w-100'>
					<thead>
						<tr>
							<th className='profile_table_th text-center' style={{ textAlign: 'left', width: '5%' }}>S.No</th>
							<th className='profile_table_th'>Organization</th>
							<th className='profile_table_th'>From</th>
							<th className='profile_table_th'>To</th>
							<th className='profile_table_th'>Experience (in days)</th>
							<th className='profile_table_th'>Role</th>
							<th className='profile_table_th'>Post</th>
							<th className='profile_table_th'>Description</th>
							<th className='profile_table_th'>Actions</th>
						</tr>
					</thead>
					<tbody>
						{experienceList.map((item, index) => (
							<tr style={{ border: '1px solid #dee2e6' }} key={index}>
								<td className='profile_table_td text-center'>{index + 1}</td>
								<td className='profile_table_td'>{item?.organization}</td>
								<td className='profile_table_td'>
									{formatDateDDMMYYYY(item?.from)}
								</td>

								<td className='profile_table_td'>
									{item?.to ? formatDateDDMMYYYY(item.to) : "-"}
								</td>
								<td className='profile_table_td'>{item?.experience}</td>
								<td className='profile_table_td'>{item?.role}</td>
								<td className='profile_table_td'>{item?.postHeld}</td>
								<td className='profile_table_td'>{item?.description}</td>
								<td className='profile_table_td'>
									<div className="d-flex gap-2">
										<div>
											<img src={editIcon} alt='Edit' style={{ width: '25px', cursor: 'pointer' }} onClick={() => handleEditClick(item)} />
										</div>
										{item?.certificate?.fileUrl && (
											<div onClick={() => handleEyeClick(item?.certificate?.fileUrl)}>
												<img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
											</div>
										)}
										<div>
											<img src={deleteIcon} alt='Delete' style={{ width: '25px', cursor: 'pointer' }} onClick={() => handleDelete(item)} />
										</div>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* MOBILE CARDS */}
			<div className="d-block d-md-none w-100">
				{experienceList.map((item, index) => (
					<div
						key={item.workExperienceId}
						className="border rounded p-3 mb-3 bg-white shadow-sm"
					>
						<div className="d-flex justify-content-between align-items-center mb-2">
							<strong>Experience #{index + 1}</strong>
							<div className="d-flex gap-2">
								<img
									src={editIcon}
									width={22}
									style={{ cursor: "pointer" }}
									onClick={() => handleEditClick(item)}
									alt="Edit"
								/>
								<img
									src={viewIcon}
									width={22}
									style={{ cursor: "pointer" }}
									alt="View"
									onClick={() => {
										if (!item?.certificate?.fileUrl) {
											toast.error("No document available");
											return;
										}
										window.open(item.certificate.fileUrl, "_blank");
									}}
								/>
								<img
									src={deleteIcon}
									width={22}
									style={{ cursor: "pointer" }}
									onClick={() => handleDelete(item)}
									alt="Delete"
								/>
							</div>
						</div>

						<div className="mb-1">
							<small className="text-muted">Organization</small>
							<div className='wrap-text'>{item.organization}</div>
						</div>

						<div className="mb-1">
							<small className="text-muted">Role</small>
							<div className='wrap-text'>{item.role}</div>
						</div>

						<div className="mb-1">
							<small className="text-muted">Post Held</small>
							<div className='wrap-text'>{item.postHeld}</div>
						</div>

						<div className="mb-1">
							<small className="text-muted">From</small>
							<div className='wrap-text'>
								{formatDateDDMMYYYY(item.from)}
							</div>
						</div>

						<div className="mb-1">
							<small className="text-muted">To</small>
							<div className='wrap-text'>
								{item.to ? formatDateDDMMYYYY(item.to) : "-"}
							</div>
						</div>

						<div className="mb-1">
							<small className="text-muted">Experience (days)</small>
							<div className='wrap-text'>{item.experience}</div>
						</div>

						<div>
							<small className="text-muted">Description</small>
							<div className='wrap-text'>{item.description}</div>
						</div>
					</div>
				))}
			</div>

			<div className='d-flex justify-content-center align-items-center gap-2 mt-3'>
				<label htmlFor="working" className="form-label mb-0">Total experience </label>
				<input type="text" className="form-control text-center" style={{ width: '212px' }} id="to" disabled value={formatTotalExperience(totalExperienceDays)} />
			</div>

			{/* <div className='d-flex justify-content-center align-items-center gap-2 py-1' style={{ backgroundColor: '#fff7ed', borderLeft: '3px solid #f26623' }}>
						<input
							type="checkbox"
							// className="form-control"
							id="declarationCheckbox"
							// checked={sameAsCorrespondence}
							// onChange={handleCheckboxToggle}
						/>
						<label htmlFor="declarationCheckbox" className="form-label mt-1">I declare that I possess the requisite work experience for this post, 
							as stipulated in terms of the advertisement, and undertake to submit neccessary documents/testimonials in support of the same as and when called for by the Bank.
						</label>
					</div> */}

			<div className="d-flex justify-content-between">
				<div>
					<BackButtonWithConfirmation goBack={goBack} isDirty={isDirty} />
				</div>
				<div>
					<button
						type="submit"
						className="btn btn-primary"
						onClick={saveAndNext}
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
					</button>
				</div>
			</div>





			{loading && (
				<Loader />
			)}

		</div>
	)
}

export default ExperienceDetails