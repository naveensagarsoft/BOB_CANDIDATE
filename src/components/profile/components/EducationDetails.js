import EducationForm from "./EducationForm";
import Loader from '../../../shared/components/Loader';
import BackButtonWithConfirmation from "../../../shared/components/BackButtonWithConfirmation";

import { useEducationDetails } from "../hooks/educationHooks";
import NextButtonWithConfirmation from "../../../shared/components/NextButtonWithConfirmation";
import { Modal } from "react-bootstrap";
import editIcon from "../../../assets/edit-icon.png";
import deleteIcon from "../../../assets/delete-icon.png";
import viewIcon from "../../../assets/view-icon.png";
import { handleEyeClick } from "../../../shared/utils/fileDownload";
import { useSelector } from "react-redux";

const EducationDetails = ({ goNext, goBack }) => {
  // ✅ Get experience list for cross-profile date collision check
  const experienceList = useSelector((state) => state.experience?.list || []);
  // ✅ Get education list for cross-profile date collision check
  const educationList = useSelector((state) => state.resume?.list || []);

  const {
    educations,
    sortedEducations,
    masterData,
    loading,
    isDirty,
    activeEducationUiId,
    setActiveEducationUiId,
    getRef,
    addEducation,
    deleteEducation,
    refreshEducation,
    getExistingRanges,
    saveAndNext,
    setIsDirty,
    handleDeleteClick,
    setShowModal,
    showModal,
    setIsNewRow,
    isNewRow
  } = useEducationDetails({ goNext });

  const getBoardOrCourseName = (edu) => {
    if (!edu?.data?.university) return "-";

    const board = masterData?.boards?.find(
      b => b.educationQualificationsId === edu.data.university
    );

    return board?.qualificationName || "-";
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="px-4 py-3 border rounded bg-white">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 mt-1">
        <div>
          <p className="tab_headers mb-0 fs-14">Education Details</p>
        </div>

        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="btn orange-button"
            onClick={() => {
              addEducation();
              setIsNewRow(true);   // ✅ mark as new
              setActiveEducationUiId(educations.length);
              setShowModal(true);
            }}
          >
            + Add
          </button>
        </div>
      </div>

      {/* 🔴 HIDDEN FORMS (DO NOT REMOVE) */}
      <div style={{ display: "none" }}>
        {educations.map((edu, index) => (
          <EducationForm
            key={edu.uiId}
            educationId={edu.educationId}
            existingData={edu.data}
            parsedId={edu.parsedId}
            masterData={masterData}
            refreshEducation={refreshEducation}
            onDirtyChange={setIsDirty}
            onDelete={deleteEducation}
            ref={getRef(String(index))}
            existingRanges={getExistingRanges(edu.uiId)}
            currentAccordionIndex={index}
            uiId={edu.uiId}
            onSave={() => {}}
            experienceList={experienceList}
            educationList={educationList}
          />
        ))}
      </div>

      {/* TABLE */}
      <div className="d-none d-md-block w-100">
        <table className="experience_table w-100">
          <thead>
            <tr>
              <th className='profile_table_th text-center' style={{ textAlign: 'left', width: '5%' }}>S.No</th>
              <th className='profile_table_th'>Education</th>
              <th className='profile_table_th'>College</th>
              <th className='profile_table_th'>Board/Course</th>
              <th className='profile_table_th'>From</th>
              <th className='profile_table_th'>To</th>
              <th className='profile_table_th'>Percentage</th>
              <th className='profile_table_th'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEducations.map((edu, index) => (
              <tr style={{ border: '1px solid #dee2e6' }} key={edu.uiId}>
                <td className='profile_table_td text-center'>{index + 1}</td>
                <td className='profile_table_td'>{edu.label}</td>
                <td className='profile_table_td'>{edu.data?.college || "-"}</td>
                <td className='profile_table_td'>{getBoardOrCourseName(edu)}</td>
                <td className='profile_table_td'>{formatDate(edu.data?.from)}</td>
                <td className='profile_table_td'>{formatDate(edu.data?.to)}</td>
                <td className='profile_table_td'>{edu.data?.percentage || "-"}</td>
                <td className='profile_table_td'>
                  <div className="d-flex gap-2">
                    <img
                      src={editIcon}
                      alt="Edit"
                      style={{ width: "25px", cursor: "pointer" }}
                      onClick={() => {
                        const actualIndex = educations.findIndex(e => e.uiId === edu.uiId);
                        setActiveEducationUiId(actualIndex);
                        setShowModal(true);
                      }}
                    />

                    {/* VIEW (ONLY IF FILE EXISTS) */}
                    {edu?.data?.document?.fileUrl && (
                      <div onClick={() => handleEyeClick(edu.data.document.fileUrl)}>
                        <img
                          src={viewIcon}
                          alt="View"
                          style={{ width: "25px", cursor: "pointer" }}
                        />
                      </div>
                    )}

                    <img
                      src={deleteIcon}
                      alt="Delete"
                      style={{ width: "25px", cursor: "pointer" }}
                      onClick={() => handleDeleteClick(edu)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW */}
      <div className="d-block d-md-none w-100">
        {sortedEducations.map((edu, index) => (
          <div key={edu.uiId} className="border rounded p-3 mb-3 bg-white shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Education #{index + 1}</strong>
              <div className="d-flex gap-2">
                <img
                  src={editIcon}
                  width={22}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setActiveEducationUiId(index);
                    setShowModal(true);
                  }}
                  alt="Edit"
                />
                <img
                  src={deleteIcon}
                  width={22}
                  style={{ cursor: "pointer" }}
                  // onClick={() => deleteEducation(edu.parsedId)}
                  onClick={() => handleDeleteClick(edu)}
                  alt="Delete"
                />
              </div>
            </div>

            <div><small className="text-muted">Education</small><div>{edu.label}</div></div>
            <div><small className="text-muted">College</small><div>{edu.data?.college}</div></div>
            <div><small className="text-muted">From</small><div>{formatDate(edu.data?.from)}</div></div>
            <div><small className="text-muted">To</small><div>{formatDate(edu.data?.to)}</div></div>
            <div><small className="text-muted">Percentage</small><div>{edu.data?.percentage}</div></div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <Modal
        show={showModal}
        onHide={() => {
          if (isNewRow) {
            const last = educations[educations.length - 1];
            if (last?.parsedId) {
              deleteEducation(last.parsedId);
            }
          }
          setIsNewRow(false);
          setShowModal(false);
        }}
        size="xl"
        centered
      >
        <Modal.Header className="border-bottom pb-3" closeButton>
          <Modal.Title className="cerhead">
            {isNewRow ? "Add Education" : "Edit Education"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {activeEducationUiId !== null && educations[activeEducationUiId] && (
            <EducationForm
              key={educations[activeEducationUiId]?.uiId}
              educationId={educations[activeEducationUiId]?.educationId}
              existingData={educations[activeEducationUiId]?.data}
              parsedId={educations[activeEducationUiId]?.parsedId}
              masterData={masterData}
              refreshEducation={refreshEducation}
              onDirtyChange={setIsDirty}
              onDelete={deleteEducation}
              ref={getRef(String(activeEducationUiId))}
              existingRanges={getExistingRanges(
                educations[activeEducationUiId]?.uiId
              )}
              currentAccordionIndex={activeEducationUiId}
              uiId={educations[activeEducationUiId]?.uiId}
              onSave={() => setShowModal(false)}
              experienceList={experienceList}
              educationList={educationList}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Bottom Buttons */}
      <div className="d-flex justify-content-between mt-5">
        <BackButtonWithConfirmation goBack={goBack} isDirty={isDirty} />
        <NextButtonWithConfirmation
          onNext={saveAndNext}
          isDirty={isDirty}
        />
      </div>

      {loading && <Loader />}
    </div>
  );
};

export default EducationDetails;
