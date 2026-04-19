import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";

import { loadAndShuffleCsv, groupByBlock } from "../../utils";
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
  BREAK: "break",
  RESULT: "result"
};

export default function LdtExperiment() {
  const navigate = useNavigate();
  const location = useLocation();

  const startTimeRef = useRef(null);

  const respondentInformation = location.state?.form;
  const respondentId = location.state?.respondentId;

  const [breakTime, setBreakTime] = useState(60);

  const [allSetData, setAllSetData] = useState({});
  const [totalBlock, setTotalBlock] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [blockIndex, setBlockIndex] = useState(0);
  const [trialIndex, setTrialIndex] = useState(0);

  const [phase, setPhase] = useState(PHASE.START);

  const [results, setResults] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [respondedCount, setRespondedCount] = useState(0);

  const [feedback, setFeedback] = useState("");
  const [submitStatus, setSubmitStatus] = useState("idle");
  
  const currentBlockData = allSetData[blockIndex] || [];
  const currentTrial = currentBlockData[trialIndex];

  usePreventLeave(phase !== PHASE.RESULT && phase !== PHASE.START && phase !== PHASE.INSTRUCTION);

  const isTrialPhase = useMemo(() => blockIndex > 0, [blockIndex]);
  console.log(totalBlock, blockIndex);
  const isResultPhase = blockIndex >= totalBlock && trialIndex + 1 >= currentBlockData.length;

  function goNextTrial() {
    if(trialIndex + 1 >= currentBlockData.length && blockIndex < totalBlock) {
      setBreakTime(60);
      setPhase(PHASE.BREAK);
      return;
    }
    if (isResultPhase) {
      setPhase(PHASE.RESULT);
      return;
    }
    setTrialIndex((prev) => prev + 1);
    setPhase(PHASE.BLANK);
  }

  function goNextBlock() {
    if (isResultPhase) {
      setPhase(PHASE.RESULT);
      return;
    }
    setTrialIndex(0);
    setBlockIndex((prev) => prev + 1);
    setPhase(PHASE.BLANK);
  }

  async function handleSubmit() {
    setSubmitStatus("loading");

    try {
      console.log({
        respondentInformation: {
          ...respondentInformation,
          respondentId
        },
        results,
        totalCorrect: correctCount,
        totalResponded: respondedCount,
        totalData
      });

      await submitLdtResult({
        respondentInformation: {
          ...respondentInformation,
          respondentId
        },
        results,
        totalCorrect: correctCount,
        totalResponded: respondedCount,
        totalData
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

      const { blockedTrials, totalBlock, totalData } = groupByBlock(trials);

      setAllSetData({
        0: simulations,
        ...blockedTrials
      });
      setTotalBlock(totalBlock);
      setBlockIndex(0);
      setTotalData(totalData);
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
      timer = setTimeout(goNextTrial, 1000);
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

    const isPseudoword = currentTrial.type === "nw";
    let responded = false;

    function handleKey(e) {
      if (e.key !== "f" && e.key !== "j") return;
      if (responded) return;

      responded = true;

      const rt = (performance.now() - startTimeRef.current) / 1000;

      const isCorrect =
        (!isPseudoword && e.key === "f") ||
        (isPseudoword && e.key === "j");

      if (isTrialPhase) {
        setRespondedCount((prev) => prev + 1);
        if (isCorrect) setCorrectCount((prev) => prev + 1);

        setResults((prev) => [
          ...prev,
          {
            trialData: currentTrial,
            response: e.key.toUpperCase(),
            rt: rt.toFixed(3),
            isPseudoword,
            isCorrect
          }
        ]);

        goNextTrial();
        return;
      }

      setFeedback(isCorrect ? "CORRECT!" : "WRONG!");
      setPhase(PHASE.FEEDBACK);
    }

    window.addEventListener("keydown", handleKey);

    const timeout = setTimeout(() => {
      if (responded) return;

      responded = true;

      if (!isTrialPhase) {
        setFeedback("TOO SLOW!");
        setPhase(PHASE.FEEDBACK);
      }

      if (isTrialPhase) {
        setResults((prev) => [
          ...prev,
          {
            trialData: currentTrial,
            response: "none",
            rt: 2000,
            isPseudoword,
            isCorrect: false
          }
        ]);

        goNextTrial();
        return;
      }
    }, 2000);

    return () => {
      window.removeEventListener("keydown", handleKey);
      clearTimeout(timeout);
    };
  }, [phase, currentTrial, isTrialPhase]);

  useEffect(() => {
    if (phase !== PHASE.BREAK) return;

    setBreakTime(60);

    let allowSkip = false;

    const interval = setInterval(() => {
      setBreakTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          goNextBlock();
          return 0;
        }

        if (prev === 51) {
          allowSkip = true;
        }

        return prev - 1;
      });
    }, 1000);

    function handleKey(e) {
      if (e.key !== "f" && e.key !== "j") return;

      if (allowSkip) {
        clearInterval(interval);
        goNextBlock();
      }
    }

    window.addEventListener("keydown", handleKey);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKey);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== PHASE.INSTRUCTION) return;

    function handleStart(e) {
      if (e.key === "f" || e.key === "j") {
        setTrialIndex(0);
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

  if (phase === PHASE.BREAK) {
    return (
      <>
      <div className="screen">
        {blockIndex > 0 ?
        (
          <>
            <h2>You have completed {(blockIndex/totalBlock*100).toFixed(2)}% of the experiment.</h2>
          </>
        ) : (
          <>
            <h2>Practice session completed.</h2>
            <p>You will now begin the actual experiment.</p>
          </>
        )
      }
      <p>Continue automatically in {breakTime}s</p>
      <p className={`skip-text ${breakTime <= 50 ? "show" : ""}`}>
        Press F or J if you want to continue immediately
      </p>
      </div>
      </>
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
            {currentTrial.target.toUpperCase()}
          </div>

          <div className="maskBottom">
            ******************************
          </div>
        </>
      )}

      {phase === PHASE.FEEDBACK && (
        <div className="stimulus">{feedback}</div>
      )}
    </div>
  );
}
