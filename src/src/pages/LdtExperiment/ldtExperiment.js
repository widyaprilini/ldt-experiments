import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";

import { loadAndShuffleCsv } from "../../utils/csvHandler";
import { submitLdtResult } from "./ldtExperiment.handler";
import { usePreventLeave } from "../../hooks/usePreventLeave";

import "./ldtExperiment.css";

const PHASE = {
  START: "start",
  INSTRUCTION: "instruction",
  FIXATION: "fixation",
  MASK: "mask",
  PRIME: "prime",
  TARGET: "target",
  FEEDBACK: "feedback",
  BLANK: "blank",
  RESULT: "result"
};

export default function LdtExperiment() {
  const navigate = useNavigate();
  const location = useLocation();

  const startTimeRef = useRef(null);

  const respondentInformation = location.state?.form;

  const [allSetData, setAllSetData] = useState([]);
  const [simulationLength, setSimulationLength] = useState(0);
  const [allSetIndex, setAllSetIndex] = useState(0);

  const [phase, setPhase] = useState(PHASE.START);

  const [results, setResults] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [respondedCount, setRespondedCount] = useState(0);

  const [feedback, setFeedback] = useState("");
  const [submitStatus, setSubmitStatus] = useState("idle");

  const currentTrial = allSetData[allSetIndex];  
  usePreventLeave(phase !== PHASE.RESULT && phase !== PHASE.START && phase !== PHASE.INSTRUCTION);

  const isTrialPhase = useMemo(() => {
    return allSetIndex >= simulationLength;
  }, [allSetIndex, simulationLength]);

  function goNext() {
    if (allSetIndex + 1 >= allSetData.length) {
      setPhase(PHASE.RESULT);
    } else {
      setAllSetIndex((prev) => prev + 1);
      setPhase(PHASE.BLANK);
    }
  }

  async function handleSubmit() {
    setSubmitStatus("loading");

    try {
      console.log({
        respondentInformation,
        results,
        correctCount,
        respondedCount
      });

      await submitLdtResult({
        respondentInformation,
        results,
        correctCount,
        respondedCount
      });

      setSubmitStatus("success");
      setTimeout(() => {
        navigate("/", { replace: true })
      }, 30000);
    } catch (err) {
      setSubmitStatus("error");
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const simulations = await loadAndShuffleCsv("/data/user-simulations.csv", true);
      const trials = await loadAndShuffleCsv("/data/user-trials.csv", true);

      setSimulationLength(simulations.length);
      setAllSetData([...simulations, ...trials]);
    };

    fetchData();
  }, []);

  useEffect(() => {
    let timer;

    if (phase === PHASE.FIXATION) {
      timer = setTimeout(() => setPhase(PHASE.MASK), 500);
    }

    if (phase === PHASE.MASK) {
      timer = setTimeout(() => setPhase(PHASE.PRIME), 500);
    }

    if (phase === PHASE.PRIME) {
      timer = setTimeout(() => {
        startTimeRef.current = performance.now();
        setPhase(PHASE.TARGET);
      }, 50);
    }

    if (phase === PHASE.BLANK) {
      timer = setTimeout(() => setPhase(PHASE.FIXATION), 200);
    }

    if (phase === PHASE.FEEDBACK) {
      timer = setTimeout(goNext, 1000);
    }

    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== PHASE.RESULT) return;
    if (submitStatus !== "idle") return;

    sessionStorage.removeItem("ldt_access");
    handleSubmit();
  }, [phase]);

  useEffect(() => {
    if (phase !== PHASE.TARGET) return;

    const isPseudo = currentTrial.type === "NON_WORD";
    let responded = false;

    function handleKey(e) {
      if (e.key !== "f" && e.key !== "j") return;
      if (responded) return;

      responded = true;

      const rt = (performance.now() - startTimeRef.current) / 1000;

      const isCorrect =
        (!isPseudo && e.key === "f") ||
        (isPseudo && e.key === "j");

      if (isTrialPhase) {
        setRespondedCount((p) => p + 1);
        if (isCorrect) setCorrectCount((p) => p + 1);

        if(!isPseudo){
          setResults((prev) => [
            ...prev,
            {
              trialData: currentTrial,
              response: e.key.toUpperCase(),
              rt: rt.toFixed(3),
              isCorrect
            }
          ]);
        }

        goNext();
        return;
      }

      setFeedback(isCorrect ? "CORRECT!" : "WRONG!");
      setPhase(PHASE.FEEDBACK);
    }

    window.addEventListener("keydown", handleKey);

    const timeout = setTimeout(() => {
      if (responded) return;

      responded = true;

      if (isTrialPhase && !isPseudo) {
        setResults((prev) => [
          ...prev,
          {
            trialData: currentTrial,
            response: "none",
            rt: 2000,
            isCorrect: false
          }
        ]);
      }

      setFeedback("TOO SLOW!");
      setPhase(PHASE.FEEDBACK);
    }, 2000);

    return () => {
      window.removeEventListener("keydown", handleKey);
      clearTimeout(timeout);
    };
  }, [phase, currentTrial, isTrialPhase]);

  useEffect(() => {
    if (phase !== PHASE.INSTRUCTION) return;

    function handleStart(e) {
      if (e.key === "f" || e.key === "j") {
        setAllSetIndex(0);
        setPhase(PHASE.FIXATION);
      }
    }

    window.addEventListener("keydown", handleStart);
    return () => window.removeEventListener("keydown", handleStart);
  }, [phase]);

  if (phase === PHASE.START) {
    return (
      <div className="screen">
        <h2>Lexical Decision Task</h2>
        <button onClick={() => setPhase(PHASE.INSTRUCTION)}>
          Click to Start
        </button>
      </div>
    );
  }

  if (phase === PHASE.INSTRUCTION) {
    return (
      <div className="screen">
        <h3>Instructions</h3>
        <p>
          You will see a word on the screen.<br /><br />
          Press <b>F</b> if it is a REAL word.<br />
          Press <b>J</b> if it is a PSEUDOWORD.<br /><br />
          Respond as quickly and accurately as possible.
        </p>
        <p>Press F or J to begin.</p>
      </div>
    );
  }

  if (phase === PHASE.RESULT) {
    return (
      <div className="screen">
        <h2>Experiment Finished</h2>

        {submitStatus === "loading" && <p>Submitting data...</p>}
        {submitStatus === "success" && (
          <>
            <p>Data saved ✅</p>
            <button onClick={() => navigate("/", { replace: true })}>Back</button>
          </>
        )}
        {submitStatus === "error" && (
          <>
            <p style={{ color: "red" }}>
              Failed to submit. Please try again.
            </p>
            <button onClick={handleSubmit}>Retry</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="experiment">
      {phase === PHASE.FIXATION && <div className="stimulus">+</div>}

      {phase === PHASE.MASK && <div className="stimulus">########</div>}

      {phase === PHASE.PRIME && (
        <div className="stimulus">{currentTrial?.prime}</div>
      )}

      {phase === PHASE.TARGET && (
        <>
          <div className="question">
            Real Word (F) or Pseudoword (J)?
          </div>

          <div className="maskTop">
            ******************************
          </div>

          <div className="targetWord">
            {currentTrial.target}
          </div>

          <div className="maskBottom">
            ******************************
          </div>

          {isTrialPhase && (
            <div className="trialCounter">
              Trial(s): {allSetIndex - simulationLength + 1}
            </div>
          )}
        </>
      )}

      {phase === PHASE.FEEDBACK && (
        <div className="stimulus">{feedback}</div>
      )}
    </div>
  );
}
