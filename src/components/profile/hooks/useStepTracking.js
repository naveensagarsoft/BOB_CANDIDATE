import { useDispatch } from 'react-redux';
import { updateCurrentStep } from '../../auth/store/userSlice';

/**
 * Custom hook to update currentStep in Redux
 * This ensures that when user refreshes, they stay on the same step
 * 
 * Usage:
 * const { updateStep } = useStepTracking();
 * 
 * // Call this in goNext() or any navigation
 * updateStep(3);
 */
export const useStepTracking = () => {
  const dispatch = useDispatch();

  /**
   * Update the current step in Redux (1-indexed for backend consistency)
   * @param {number} stepNumber - The step number (0-indexed)
   */
  const updateStep = (stepNumber) => {
    // Convert 0-indexed to 1-indexed for backend consistency
    const stepForBackend = stepNumber + 1;
    dispatch(updateCurrentStep(stepForBackend));
  };

  return {
    updateStep,
  };
};

