import * as React from 'react'; // Import React library
import styles from './styles.module.css'; // Import CSS styles
import { StepStates, ProgressStep, StepProgressProps, ReducerAction } from './models'; // Import types/interfaces from models file

// Define reducer function to manage state of steps
function stepsReducer(steps: ProgressStep[], action: ReducerAction): ProgressStep[] {
  // Use map() to create new array of steps with updated state
  return steps.map(function (step, i) {
    if (i < action.payload.index) { // If step is before current step, mark as completed
      step.state = StepStates.COMPLETED;
    } else if (i === action.payload.index) { // If step is current step, update its state
      step.state = action.payload.state;
    } else { // If step is after current step, mark as not started
      step.state = StepStates.NOT_STARTED;
    }
    return step; // Return updated step object
  });
}

// Define StepProgressBar component function
function StepProgressBar(props: StepProgressProps): JSX.Element {
  // Destructure props object
  const {
    steps,
    startingStep,
    wrapperClass,
    progressClass,
    stepClass,
    labelClass,
    subtitleClass,
    contentClass,
    buttonWrapperClass,
    primaryBtnClass,
    secondaryBtnClass,
    submitBtnName,
    onSubmit,
    previousBtnName,
    nextBtnName
  } = props;

  // Use useReducer hook to manage state of steps
  const [state, dispatch] = React.useReducer(stepsReducer, steps);
  const [currentIndex, setCurrentIndex] = React.useState(startingStep);

  // Use useEffect hook to initialize state of starting step
  React.useEffect(function () {
    dispatch({
      type: 'init',
      payload: { index: currentIndex, state: StepStates.CURRENT }
    });
  }, []);

  // Define function to handle submit button click
  function submitHandler(): void {
    onSubmit();
  }

  // Define function to handle next button click
  function nextHandler(): void {
    if (currentIndex === steps.length - 1) { // If on last step, do nothing
      return;
    }

    let isStateValid = true;
    const stepValidator = state[currentIndex].validator;
    if (stepValidator) { // If step has validator function, check if step is valid
      isStateValid = stepValidator();
    }

    // Dispatch action to update state of current step
    dispatch({
      type: 'next',
      payload: {
        index: isStateValid ? currentIndex + 1 : currentIndex,
        state: isStateValid ? StepStates.CURRENT : StepStates.ERROR
      }
    });

    if (isStateValid) { // If step is valid, update current index
      setCurrentIndex(currentIndex + 1);
    }
  }

  // Define function to handle previous button click
  function prevHandler(): void {
    if (currentIndex === 0) { // If on first step, do nothing
      return;
    }

    // Dispatch action to update state of current step
    dispatch({
      type: 'previous',
      payload: {
        index: currentIndex - 1,
        state: StepStates.CURRENT
      }
    });

    // Update current index
    setCurrentIndex(currentIndex - 1);
  }

  // Render progress bar and buttons
  return (
    <div className={`${styles['progress-bar-wrapper']} ${wrapperClass || ''}`}>
      <ul className={`${styles['step-progress-bar']} ${progressClass || ''}`}>
        {state
