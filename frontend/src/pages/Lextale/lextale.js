import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initJsPsych } from "jspsych";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import htmlButtonResponse from "@jspsych/plugin-html-button-response";
import "jspsych/css/jspsych.css";

import { LEXTALE_STIMULI, LEXTALE_STITMULI_PRACTICE, LEXTALE_STIMULI_TEST, GROUP_VALUE } from "../../constants";
import { saveLextaleResponse } from "./lextale.handler";

export default function LextaleExperiment() {
  const navigate = useNavigate();
  const location = useLocation();

  const hasRun = useRef(false);
  const startTimeRef = useRef(new Date());
  const jsPsychRef = useRef(null);

  const form = location.state?.form;
  const respondentId = location.state?.respondentId;
  const group = form?.group;
  const isGroupA = group === "A";

  const { wordSymbol, nonWordSymbol } = GROUP_VALUE[group];

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const jsPsych = initJsPsych({
      display_element: "jspsych-target",
      show_progress_bar: true,
      auto_update_progress_bar: false,

      on_finish: () => {
        navigate("/ldt-experiment", {
          state: { form, respondentId }
        });

        const target = document.getElementById("jspsych-target");
        if (target) target.innerHTML = "";
      }
    });

    jsPsychRef.current = jsPsych;

    function saveToLocal(payload) {
      try {
        const stored = JSON.parse(localStorage.getItem("lextale_backup") || "[]");
        stored.push(payload);
        localStorage.setItem("lextale_backup", JSON.stringify(stored));
        console.log("✅ Data saved locally as backup.");
      } catch (err) {
        console.error("Failed to store LexTALE backup:", err);
      }
    }

    async function handleDataSubmission() {
      const header = document.getElementById("status-header");
      const msg = document.getElementById("save-msg");
      const nextBtn = document.getElementById("next-btn");
      const retryBtn = document.getElementById("retry-btn");
      const continueBtn = document.getElementById("continue-anw-btn");

      const lextaleData = jsPsych.data.get()
        .filter({ phase: "main" })
        .ignore(["internal_node_id", "trial_type", "phase"])
        .values();

      const refinedLextaleData = lextaleData
        .slice(3)
        .map(({ word, type, response, rt, isCorrect }) => ({
          word, type, response, rt, isCorrect
        }));

        const startTime = startTimeRef.current.toISOString();
        const endTime = new Date().toISOString();
        const payload = {
          respondentInformation: { 
            ...form,
            respondentId
          },
          results: refinedLextaleData,
          startTime: startTimeRef.current.toISOString(),
          endTime,
          duration: (new Date(endTime) - new Date(startTime))/1000
        };

      saveToLocal(payload);

      function showSuccess() {
        header.innerHTML = "Success submitting data!";
        header.style.color = "#27ae60";
        msg.innerHTML = `
          You have completed the LexTALE task.<br>
          The main task will begin next.<br>
          When you are ready, click below to continue.
        `;
        nextBtn.style.display = "inline-block";
        nextBtn.onclick = (e) => {
          e.preventDefault();
          jsPsych.finishTrial();
        };
      }

      function showFailure() {
        header.innerHTML = "Submission Failed";
        header.style.color = "#c0392b";
        msg.innerHTML = "We encountered an error while saving your data.";
        retryBtn.style.display = "inline-block";
        continueBtn.style.display = "inline-block";
        retryBtn.textContent = "Retry Submission";
        continueBtn.textContent = "Continue Anyway";

        retryBtn.onclick = () => {
          retryBtn.style.display = "none";
          continueBtn.style.display = "none";
          header.innerHTML = "Retrying submission...";
          header.style.color = "black";
          msg.innerHTML = "Retrying... ⏳";
          handleDataSubmission(jsPsych);
        };

        continueBtn.onclick = () => {
          jsPsych.finishTrial();
        };
      }

      try {
        await saveLextaleResponse(payload);
        showSuccess();
      } catch (error) {
        console.error("❌ LexTALE submission failed:", error);
        showFailure();
      }
    }

    const remainingStimuli = LEXTALE_STIMULI_TEST.filter(s => s.id > 0);
    const shuffledRemaining = jsPsych.randomization.shuffle(remainingStimuli);
    const stimuliList = [...LEXTALE_STITMULI_PRACTICE, ...shuffledRemaining];

    const test_stimuli = stimuliList.map((item) => ({
      stimulus: item.word,
      type: item.type,
      word_id: item.id
    }));

    let mainTrialCount = 0;
    const totalMainTrials = stimuliList.length;

    const beforeLextale = {
      type: htmlKeyboardResponse,
      stimulus: `
        <div class="overlay">
          <div class="modal">
            <h2>LexTALE</h2>
            <p>This is a pre-test designed to measure your vocabulary proficiency.</p>
            <p>It will take approximately 5–10 minutes to complete and will be administered before the main experiment.</p>
            <p>Please complete it carefully.</p>
            <p>Press <b>Space</b> to begin.</p>
          </div>
        </div>
      `,
      choices: [" "]
    };

    const instructions = {
      type: htmlKeyboardResponse,
      stimulus: () => {
        const wordChoice = `Press <b>${wordSymbol}</b> if it is a REAL word.<br/>`;
        const nonWordChoice = `Press <b>${nonWordSymbol}</b> if it is a NON word.<br/>`;

        const choice = isGroupA ? `${nonWordChoice}${wordChoice}` : `${wordChoice}${nonWordChoice}`

        return `
          <div class="overlay">
            <div class="modal">
              <h2>Instructions</h2>
                <p>
                You will see a word on the screen.<br/><br/>
                ${choice}
                <br/>Respond as quickly and accurately as possible.
              </p>
              <p>Press <b>F</b> or <b>J</b> to begin.</p>
              </div>
            </div>
          `
        },
        choices: ["f", "j"],
        on_finish: () => {
          jsPsych.finishTrial();
        }
      };

    const afterLextale = {
      type: htmlButtonResponse,
      stimulus: () => {
        return `
          <div class="overlay">
            <div class="modal">
              <h2 id="status-header">LexTALE Task Finished</h2>
              
              <div id="message-container" style="margin: 20px 0;">
                <p id="save-msg" style="color: black;">
                  Submitting Data.... ⏳
                </p>
              </div>

              <hr />

              <div id="action-area" style="min-height: 50px;">
                <button id="next-btn" class="btn yes" style="display:none;">
                  Continue
                </button>
                <button id="retry-btn" class="btn no" style="display:none;">
                  Retry Submission
                </button>
                <button id="continue-anw-btn" class="btn yes" style="display:none;">
                  Continue Anyway
                </button>
              </div>
            </div>
          </div>
        `;
      },
      choices: [],
      on_load: () => {
        handleDataSubmission(jsPsych);
      }
    };

    const mainLextale = {
      type: htmlKeyboardResponse,
      stimulus: () => {
        const word = jsPsych.evaluateTimelineVariable("stimulus");
        const wordChoice = `<div class="choice word">REAL WORD (<b> ${wordSymbol} </b>)</div>`;
        const nonWordChoice = `<div class="choice non-word">NON WORD (<b> ${nonWordSymbol} </b>)</div>`;

        const choice = isGroupA ? `${nonWordChoice}${wordChoice}` : `${wordChoice}${nonWordChoice}`

        return `
          <div class="overlay">
            <div class="modal">

              <div class="target">
                ${word}
              </div>

              <div class="btn-group">
                ${choice}
              </div>

              <div class="progress-container">
                <div class="progress-bar" id="progress-bar"></div>
              </div>

            </div>
          </div>
        `;
      },
      choices: ["f", "j"],
      data: {
        phase: "main"
      },
      on_load: () => {
        const progressPercent = (mainTrialCount / totalMainTrials) * 100;
        mainTrialCount++;

        const bar = document.getElementById("progress-bar");
        if (bar) {
          bar.style.width = `${progressPercent}%`;
        }
      },
      on_finish: (data) => {
        const correctType = jsPsych.evaluateTimelineVariable("type");
        data.isCorrect = (data.response.toUpperCase() === wordSymbol && correctType === 1) ||
                         (data.response.toUpperCase() === nonWordSymbol && correctType === 0);
        data.word = jsPsych.evaluateTimelineVariable("stimulus");
        data.type = correctType;
        data.rt = data.rt !== null ? Math.round(data.rt) : null;
      }
    };

    const block = {
      timeline: [mainLextale],
      timeline_variables: test_stimuli
    };

    jsPsych.run([beforeLextale, instructions, block, afterLextale]);

    return () => {
      if (jsPsychRef.current) {
        try {
          jsPsychRef.current.endExperiment("Component unmounted");
        } catch (e) { }
        jsPsychRef.current = null;
      }
    };
  }, []);

  return <div id="jspsych-target" className="experiment-container" />;
}