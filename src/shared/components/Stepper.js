import React from "react";
import "./../../css/Stepper.css";
import whiteCheck from '../../assets/white-check.png'

const Stepper = ({ steps, activeStep, visitedSteps, isProfileCompleted }) => {
  return (
    <div className="stepper-container">
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isVisited = visitedSteps.has(index);

        const isCompleted =
          (isVisited && index < activeStep) || isProfileCompleted;

        const isRevisited =
          isVisited && index === activeStep && index < Math.max(...visitedSteps);

        return (
          <React.Fragment key={index}>
            <div
              className={`step-item
                ${isCompleted ? "completed" : ""}
                ${isActive ? "active" : ""}
                ${isRevisited ? "revisited" : ""}
              `}
            >
              <div className="step_circle">
                {isCompleted && !isActive ? (
                  <img src={whiteCheck} alt="Completed" className="step-check-icon" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="step-label">{step}</div>
            </div>

            {index !== steps.length - 1 && (
              <div className={`step-line ${isCompleted ? "completed" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
