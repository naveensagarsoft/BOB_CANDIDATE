import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useStepTracking } from "../hooks/useStepTracking";
import ResumeUpload from "../components/ResumeUpload";
import Stepper from "../../../shared/components/Stepper";
import AddressDetails from "../components/AddressDetails";
import EducationDetails from "../components/EducationDetails";
import ExperienceDetails from "../components/ExperienceDetails";
import CertificationDetails from "../components/CertificationDetails";
import DocumentDetails from "../components/DocumentDetails";
import BasicDetails from "../components/BasicDetails";

const CandidateProfileStepper = ({
  resumeFile,
  setResumeFile,
  resumePublicUrl,
  setResumePublicUrl,
  candidateData,
  setCandidateData,
  onSubmit,
  setActiveTab,
  activeStep: externalActiveStep = null,
  setActiveStep: externalSetActiveStep = null
}) => {
  const { updateStep } = useStepTracking();
  const [visitedSteps, setVisitedSteps] = useState(new Set([0]));
  const serverData = useSelector((state) => state?.user?.user?.data); // matches other components
  const isProfileCompleted = serverData?.user?.isProfileCompleted === true;
  
  const steps = [
    // "Upload Aadhar", 
    "Upload Resume", "Basic Details", "Address", "Education", "Certification",  "Experience", "Document"];

  const computeInitialStep = () => {
    if (!serverData) return 0;

    const srvUser = serverData.user;

    // 🔒 Only for FIRST LOAD / EDIT PROFILE
    if (srvUser?.isProfileCompleted === true) {
      return steps.length - 1; // Document
    }

    const cs = Number(srvUser?.currentStep);
    if (!Number.isNaN(cs) && cs >= 1 && cs <= steps.length) {
      return cs - 1;
    }

    return 0;
  };

  const [activeStep, setActiveStepLocal] = useState(computeInitialStep);
  const [isNavigating, setIsNavigating] = useState(false);

  // Use external activeStep if provided (e.g., from DigiLocker callback)
  useEffect(() => {
    if (externalActiveStep !== null) {
      setActiveStepLocal(externalActiveStep);
    }
  }, [externalActiveStep]);

  useEffect(() => {
    setVisitedSteps(prev => new Set(prev).add(activeStep));
  }, [activeStep]);

  // If server data changes after login, update active step accordingly
  useEffect(() => {
  if (!serverData) return;

  // 🚫 Do not override user navigation or external activeStep
  if (isNavigating || externalActiveStep !== null) {
    setIsNavigating(false);
    return;
  }

  const next = computeInitialStep();
  setActiveStepLocal(next);
}, [serverData, externalActiveStep]);

  useEffect(() => {
    if (activeStep === 1) {
      setResumeFile(null);
      setResumePublicUrl("");
    }
  }, [activeStep]);


  const goNext = () => {
  setIsNavigating(true);

  const nextStep = Math.min(activeStep + 1, steps.length - 1);
  updateStep(nextStep + 1);
  setActiveStepLocal(nextStep);
};

const goBack = () => {
  setIsNavigating(true);

  const prevStep = Math.max(activeStep - 1, 0);
  updateStep(prevStep + 1);
  setActiveStepLocal(prevStep);
};


  const renderStepContent = () => {
    switch (activeStep) {
      // case 0:
      //   return (
      //     <UploadIdProof
      //       goNext={goNext}
      //     />
      //   );

      case 0:
        return (
          <ResumeUpload
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
            setParsedData={setCandidateData}
            resumePublicUrl={resumePublicUrl}
            setResumePublicUrl={setResumePublicUrl}
            goNext={goNext}
            goBack={goBack}
          />
        );

      case 1:
        return (
          <BasicDetails
            // initialData={candidateData}
            // resumePublicUrl={resumePublicUrl}
            // onSubmit={onSubmit}
            goNext={goNext}
            goBack={goBack}
            parsedData={candidateData}
          />
        );

      case 2:
        return <AddressDetails goNext={goNext} goBack={goBack} />;

      case 3:
        return <EducationDetails goNext={goNext} goBack={goBack} />;

      case 4:
        return <CertificationDetails goNext={goNext} goBack={goBack} />;

      case 5:
        return <ExperienceDetails goNext={goNext} goBack={goBack} />;

      case 6:
        return <DocumentDetails goNext={goNext} goBack={goBack} setActiveTab={setActiveTab} />;

      default:
        return <h3>Coming Soon…</h3>;
    }
  };

  return (
    <div className="pb-3">
      <Stepper steps={steps} activeStep={activeStep} isProfileCompleted={isProfileCompleted} visitedSteps={visitedSteps} />

      <div className="p-3" style={{ margin: '0 auto', width: '82%' }}>
        {renderStepContent()}
      </div>
    </div>
  );
};

export default CandidateProfileStepper;
