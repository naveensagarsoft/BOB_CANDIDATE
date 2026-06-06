// components/Tabs/AddressDetails.jsx
import BackButtonWithConfirmation from "../../../shared/components/BackButtonWithConfirmation";
import { Form } from 'react-bootstrap';
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAddressDetails } from "../hooks/addressHooks";

const AddressDetails = ({ goNext, goBack }) => {
	const {
    corrAddress,
    permAddress,
    sameAsCorrespondence,
    filteredDistricts,
    permFilteredDistricts,
    formErrors,
    isDirty,
	sortedStates,
    handleCorrChange,
    handlePermChange,
    handleSameAsToggle,
    handleSubmit
  } = useAddressDetails({ goNext });

	return (
		<div className="px-4 py-3 border rounded bg-white">
			<form className="row g-4 formfields"
				onSubmit={handleSubmit}
				// onInvalid={handleInvalid}
				// onInput={handleInput}
			>
				<p className="tab_headers" style={{ marginBottom: '0px' }}>Address of Correspondence</p>

				<div className="col-md-4 col-sm-12 mt-3">
					<label htmlFor="line1" className="form-label">Address Line 1 <span className="text-danger">*</span></label>
					<input 
                    type="text" 
                    className={`form-control ${formErrors.corrAddress?.line1 ? 'is-invalid' : ''}`} 
                    id="line1" 
                    value={corrAddress.line1} 
                    onChange={handleCorrChange}
					maxLength={200}
                  />
                  {formErrors.corrAddress?.line1 && (
                    <div className="invalid-feedback">{formErrors.corrAddress.line1}</div>
                  )}
				</div>

				<div className="col-md-4 col-sm-12 mt-3">
					<label htmlFor="line2" className="form-label">Address Line 2 <span className="text-danger">*</span></label>
					<input 
                    type="text" 
                    className={`form-control ${formErrors.corrAddress?.line2 ? 'is-invalid' : ''}`} 
                    id="line2" 
                    value={corrAddress.line2} 
                    onChange={handleCorrChange}
					maxLength={200}
                  />
                  {formErrors.corrAddress?.line2 && (
                    <div className="invalid-feedback">{formErrors.corrAddress.line2}</div>
                  )}
				</div>

				<div className="col-md-4 col-sm-12 mt-3">
					<label htmlFor="state" className="form-label">State <span className="text-danger">*</span></label>
					<select 
                    id="state" 
                    className={`form-select ${formErrors.corrAddress?.state ? 'is-invalid' : ''}`}
                    value={corrAddress.state}
                    onChange={handleCorrChange}
                  >
                    
						<option value="">Select State</option>
						{sortedStates.map(s => (
							<option key={s?.stateId} value={s?.stateId}>
								{s?.stateName}
							</option>
						))}
					</select>
					{formErrors.corrAddress?.state && (
                      <div className="invalid-feedback">{formErrors.corrAddress.state}</div>
                    )}
				</div>

				<div className="col-md-4 col-sm-12 mt-3">
					<label htmlFor="district" className="form-label">District <span className="text-danger">*</span></label>
					<select 
                    id="district" 
                    className={`form-select ${formErrors.corrAddress?.district ? 'is-invalid' : ''}`}
                    value={corrAddress.district}
                    onChange={handleCorrChange}
                    disabled={!corrAddress.state}
                  >
						<option value="">Select District</option>
						{filteredDistricts.map(d => (
							<option key={d.districtId} value={d.districtId}>
								{d.districtName}
							</option>
						))}
					</select>
					{formErrors.corrAddress?.district && (
                      <div className="invalid-feedback">{formErrors.corrAddress.district}</div>
                    )}
				</div>

			<div className="col-md-4 col-sm-12 mt-3">
				<label htmlFor="city" className="form-label">City <span className="text-danger">*</span></label>
				<input 
                    type="text" 
                    className={`form-control ${formErrors.corrAddress?.city ? 'is-invalid' : ''}`} 
                    id="city" 
                    value={corrAddress.city} 
                    onChange={handleCorrChange}
					maxLength={100}
                  />
                  {formErrors.corrAddress?.city && (
                    <div className="invalid-feedback">{formErrors.corrAddress.city}</div>
                  )}
			</div>

			<div className="col-md-4 col-sm-12 mt-3">
				<label htmlFor="pincode" className="form-label">Pin <span className="text-danger">*</span></label>
				<input 
                    type="text" 
                    inputMode="numeric"
                    className={`form-control ${formErrors.corrAddress?.pincode ? 'is-invalid' : ''}`} 
                    id="pincode" 
                    value={corrAddress.pincode} 
                    onChange={handleCorrChange}
					maxLength={6}
					pattern="[0-9]*"
					// placeholder="6 digits"
                  />
                  {formErrors.corrAddress?.pincode && (
                    <div className="invalid-feedback">{formErrors.corrAddress.pincode}</div>
                  )}
			</div>				<div className="col-md-12 col-sm-12 mt-4 d-flex align-items-center gap-2 pt-3 border-top">
					<Form.Check
						type="checkbox"
						id="sameCheckbox"
						label="Same as Address of Correspondence"
						checked={sameAsCorrespondence}
						// onChange={handleCheckboxToggle}
						onChange={(e) => handleSameAsToggle(e.target.checked)}
					/>
				</div>

				<p className="tab_headers mt-3" style={{ marginBottom: '0px' }}>Permanent Address</p>

				<div className="col-md-4 col-sm-12 mt-3">
					<label htmlFor="line1" className="form-label">Address Line 1 <span className="text-danger">*</span></label>
					<input 
                    type="text" 
                    className={`form-control ${formErrors.permAddress?.line1 ? 'is-invalid' : ''}`} 
                    id="line1" 
                    value={permAddress.line1} 
                    onChange={handlePermChange} 
                    disabled={sameAsCorrespondence}
					maxLength={200}
                  />
                  {formErrors.permAddress?.line1 && (
                    <div className="invalid-feedback">{formErrors.permAddress.line1}</div>
                  )}
				</div>

				<div className="col-md-4 col-sm-12 mt-3">
					<label htmlFor="line2" className="form-label">Address Line 2 <span className="text-danger">*</span></label>
					<input 
                    type="text" 
                    className={`form-control ${formErrors.permAddress?.line2 ? 'is-invalid' : ''}`} 
                    id="line2" 
                    value={permAddress.line2} 
                    onChange={handlePermChange} 
                    disabled={sameAsCorrespondence}
					maxLength={200}
                  />
                  {formErrors.permAddress?.line2 && (
                    <div className="invalid-feedback">{formErrors.permAddress.line2}</div>
                  )}
				</div>

				<div className="col-md-4 col-sm-12 mt-3">
					<label htmlFor="state" className="form-label">State <span className="text-danger">*</span></label>
					<select
						className={`form-select ${formErrors.permAddress?.state ? 'is-invalid' : ''}`}
						id="state"
						value={permAddress.state}
						onChange={handlePermChange}
						disabled={sameAsCorrespondence}
					>
						<option value="">Select State</option>
						{sortedStates.map(s => (
							<option key={s.stateId} value={s.stateId}>
								{s.stateName}
							</option>
						))}
					</select>
					{formErrors.permAddress?.state && (
                      <div className="invalid-feedback">{formErrors.permAddress.state}</div>
                    )}
				</div>

				<div className="col-md-4 col-sm-12 mt-3">
					<label htmlFor="district" className="form-label">District <span className="text-danger">*</span></label>
					<select
						className={`form-select ${formErrors.permAddress?.district ? 'is-invalid' : ''}`}
						id="district"
						value={permAddress.district}
						onChange={handlePermChange}
						disabled={sameAsCorrespondence || !permAddress.state}
					>
						<option value="">Select District</option>
						{permFilteredDistricts.map(d => (
							<option key={d.districtId} value={d.districtId}>
								{d.districtName}
							</option>
						))}
					</select>
					{formErrors.permAddress?.district && (
                      <div className="invalid-feedback">{formErrors.permAddress.district}</div>
                    )}
				</div>

			<div className="col-md-4 col-sm-12 mt-3">
				<label htmlFor="city" className="form-label">City <span className="text-danger">*</span></label>
				<input 
                    type="text" 
                    className={`form-control ${formErrors.permAddress?.city ? 'is-invalid' : ''}`} 
                    id="city" 
                    value={permAddress.city} 
                    onChange={handlePermChange} 
                    disabled={sameAsCorrespondence}
					maxLength={100}
                  />
                  {formErrors.permAddress?.city && (
                    <div className="invalid-feedback">{formErrors.permAddress.city}</div>
                  )}
			</div>

			<div className="col-md-4 col-sm-12 mt-3">
				<label htmlFor="pincode" className="form-label">Pin <span className="text-danger">*</span></label>
				<input 
                    type="text" 
                    inputMode="numeric"
                    className={`form-control ${formErrors.permAddress?.pincode ? 'is-invalid' : ''}`} 
                    id="pincode" 
                    value={permAddress.pincode} 
                    onChange={handlePermChange}
                    disabled={sameAsCorrespondence}
					maxLength={6}
					pattern="[0-9]*"
					// placeholder="6 digits"
                  />
                  {formErrors.permAddress?.pincode && (
                    <div className="invalid-feedback">{formErrors.permAddress.pincode}</div>
                  )}
			</div>				<div className="d-flex justify-content-between">
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
						</button>
					</div>
				</div>

			</form>
		</div>
	);
};

export default AddressDetails;
