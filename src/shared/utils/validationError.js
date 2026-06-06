
import { formatDateDDMMYYYY } from "../../shared/utils/dateUtils";
const groupConditions = (list) => {
  const groups = [];
  let currentGroup = [];

  list.forEach(item => {
    if (item === "(OR)") {
      if (currentGroup.length) {
        groups.push([...currentGroup]);
        currentGroup = [];
      }
    } else {
      currentGroup.push(item);
    }
  });

  if (currentGroup.length) {
    groups.push(currentGroup);
  }

  return groups;
};
const renderGroupedList = (groups) => (
  <ul>
    {groups.map((group, i) => (
      <li key={i}>
        {/* AND inside group */}
        {group.map((item, idx) => (
          <div key={idx}>
            {idx > 0 && <strong>AND</strong>} {item}
          </div>
        ))}

        {/* ✅ OR between groups */}
        {i < groups.length - 1 && (
          <div style={{ fontWeight: "bold", margin: "5px 0" }}>
            (OR)
          </div>
        )}
      </li>
    ))}
  </ul>
);

const getAgeErrors = (age, cutoffDate) => {
  const errors = [];
  if (!age) return errors;

  const failedStates = Array.isArray(age.stateWiseAgeValidations)
    ? age.stateWiseAgeValidations.filter(s => !s.passed)
    : [];

  const formatStateCity = (item) =>
    item.cityName?.trim()
      ? `${item.stateName} - ${item.cityName}`
      : item.stateName;

  if (!age.passed) {
    if (failedStates.length > 0) {
      const stateAgeInfo = failedStates
        .map(s => `${formatStateCity(s)} (Eligibility Age : ${s.allowedAge})`)
        .join(", ");

      errors.push(
        <span>
          Your age as on the cutoff date ({cutoffDate}) does not meet the eligibility requirement in{" "}
          <strong>{stateAgeInfo}</strong>.
        </span>
      );
    } else {
      errors.push(
        <span>
          Your age as on the cutoff date ({cutoffDate}) does not meet the eligibility requirement.
        </span>
      );
    }
  }

  return errors;
};
const getExperienceErrors = (exp) => {
  if (exp && !exp.passed) {
    return [
      <div style={{ whiteSpace: "pre-line" }}>
        {exp.validationMessage}
      </div>
    ];
  }
  return [];
};

const getEducationErrors = (edu) => {
  if (!edu || edu.passed) return [];

  const educationGroups = groupConditions(edu.mandatoryEducation);
  const certificationGroups = groupConditions(edu.mandatoryCertifications);

  if (!edu.educationPassed && !edu.certificationPassed) {
    return [
      <div>
        <div>
          You must meet the following <strong>educational qualification(s)</strong>:
        </div>
        {renderGroupedList(educationGroups)}

        <div style={{ marginTop: "10px" }}>
          You must also meet the following <strong>certification requirement(s)</strong>:
        </div>
        {renderGroupedList(certificationGroups)}
      </div>
    ];
  }

  if (!edu.educationPassed) {
    return [
      <div>
        You must meet the following <strong>educational qualification(s)</strong>:
        {renderGroupedList(educationGroups)}
      </div>
    ];
  }

  if (!edu.certificationPassed) {
    return [
      <div>
        You must meet the following <strong>certification requirement(s)</strong>:
        {renderGroupedList(certificationGroups)}
      </div>
    ];
  }

  return [];
};

const getDocumentErrors = (docs) => {
  if (!docs || docs.passed) return [];

  const missingDocs = docs.requiredDocuments.filter(requiredDoc =>
    !docs.submittedDocuments.some(submittedDoc =>
      submittedDoc.startsWith(requiredDoc)
    )
  );

  if (missingDocs.length > 0) {
    return [
      `Please upload the following mandatory document(s): ${missingDocs.join(", ")}.`
    ];
  }

  return [];
};
const isAlreadyFormatted = (dateStr) => {
  return /^\d{2}-\d{2}-\d{4}$/.test(dateStr);
};
export const extractValidationErrors = (data, date) => {
 let cutoffDate = "N/A";

  if (date) {
    cutoffDate = isAlreadyFormatted(date)
      ? date
      : formatDateDDMMYYYY(date);
  }

  const errors = [];

  if (!data) return errors;

  errors.push(...getAgeErrors(data.ageValidation, cutoffDate));
  errors.push(...getExperienceErrors(data.experienceValidation));
  errors.push(...getEducationErrors(data.educationValidation));
  errors.push(...getDocumentErrors(data.documentValidation));

  return errors;
};
