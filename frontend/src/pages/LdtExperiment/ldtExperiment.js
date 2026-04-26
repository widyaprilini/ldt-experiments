import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { initJsPsych } from 'jspsych';
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import "jspsych/css/jspsych.css";

import { loadAndShuffleCsv, groupByBlock } from "../../utils";
import { PHASE } from "../../constants";
import { usePreventLeave } from "../../hooks/usePreventLeave";
import { submitLdtResult } from "./ldtExperiment.handler";

export default function LdtExperimentNew() {
  const navigate = useNavigate();
  const location = useLocation();

  const hasRun = useRef(false);
  const jsPsychRef = useRef(null);
  const isSubmitting = useRef(false);

  usePreventLeave(() => !isSubmitting.current);

  const respondentInformation = location.state?.form;
  const respondentId = location.state?.respondentId;

  function saveToLocal(ldtData) {
    try {
      const stored = JSON.parse(localStorage.getItem("ldt_backup") || "[]");
      stored.push(ldtData);
      localStorage.setItem("ldt_backup", JSON.stringify(stored));
      console.log("✅ Data saved locally as backup.");
    } catch (err) {
      console.error("Failed to store LDT backup:", err);
    }
  }

  function createBreakTrial(totalBlock = 0, blockIndex = 0) {
    let duration = 60;
    let timeLeft = 60;
    let interval;

    const afterPracticeWording = `
      <h2>Practice session completed.</h2>
      <p>You will now begin the actual experiment.</p>
    `;

    const afterTrialWording = `
      <h2>You have completed ${(blockIndex / totalBlock * 100).toFixed(2)}% of the experiment.</h2>
      <p>Take a short break</p>
    `;

    const breakWording = blockIndex === 0 ? afterPracticeWording : afterTrialWording;

    return {
      type: htmlKeyboardResponse,
      choices: ["f", "j"],
      trial_duration: duration * 1000,
      data: {
        phase: PHASE.BREAK
      },
      stimulus: `
        <div class="screen">
          ${breakWording}
          <p>Continue automatically in <span id="countdown">${timeLeft}</span>s</p>
          <p id="skipText">
            Press F or J to continue immediately
          </p>
        </div>
      `,
      on_load: () => {
        interval = setInterval(() => {
          const el = document.getElementById("countdown");
          if (el) el.textContent = timeLeft;

          if (timeLeft <= 0) {
            clearInterval(interval);
            return;
          }

          timeLeft--;
        }, 1000);
      },

      on_finish: () => {
        if (interval) clearInterval(interval);
      }
    };
  }

  useEffect(() => {
    if (hasRun.current) return;

    hasRun.current = true;

    async function runExperiment() {
      let globalTrialIndex = 0;

      function createTrialSet(trial, isMainSession, jsPsych = null) {
        let trialNumber = null;

        if (isMainSession) {
          globalTrialIndex++;
          trialNumber = globalTrialIndex;
        }

        const base = [
          {
            type: htmlKeyboardResponse,
            stimulus: "",
            choices: "NO_KEYS",
            trial_duration: 200,
            data: {
              phase: PHASE.BLANK
            }
          },
          {
            type: htmlKeyboardResponse,
            stimulus: `<div class="stimulus">+</div>`,
            choices: "NO_KEYS",
            trial_duration: 500,
            data: {
              phase: PHASE.FIXATION
            }
          },
          {
            type: htmlKeyboardResponse,
            stimulus: `<div class="stimulus">#############</div>`,
            choices: "NO_KEYS",
            trial_duration: 500,
            data: {
              phase: PHASE.MASK
            }
          },
          {
            type: htmlKeyboardResponse,
            stimulus: `
              <div class="jspsych-wrapper">
                <div class="stimulus">${trial.prime}</div>
              </div>
            `,
            choices: "NO_KEYS",
            trial_duration: 50,
            data: {
              phase: PHASE.PRIME
            }
          },
          {
            type: htmlKeyboardResponse,
            stimulus: `
              <div class="jspsych-wrapper">
                <div class="question">
                  Real Word (F) or Non Word (J)?
                </div>

                <div class="maskTop">
                  ******************************
                </div>

                <div class="targetWord">
                  ${trial.target.toUpperCase()}
                </div>

                <div class="maskBottom">
                  ******************************
                </div>
              </div>
            `,
            choices: ["f", "j"],
            trial_duration: 2000,
            data: {
              ...trial,
              phase: isMainSession ? PHASE.TARGET : ""
            },
            on_finish: function (data) {
              const isPseudo = trial.type === "nw";

              const isCorrect =
                (!isPseudo && data.response === "f") ||
                (isPseudo && data.response === "j");

              data.isCorrect = isCorrect;
              data.isPseudoword = isPseudo;
              data.index = trialNumber;
              data.timestamp = new Date().toISOString();
            }
          }
        ];

        const feedback = {
          type: htmlKeyboardResponse,
          choices: "NO_KEYS",
          trial_duration: 1000,
          stimulus: () => {
            const last = jsPsych.data.get().last(1).values()[0];

            if (last.response === null) {
              return `<div class="stimulus">TOO SLOW!</div>`;
            }

            return last.isCorrect
              ? `<div class="stimulus">CORRECT!</div>`
              : `<div class="stimulus">WRONG!</div>`;
          }
        };

        if (!isMainSession) {
          base.push(feedback);
        }

        return base;
      }

      const timeline = [];
      const jsPsych = initJsPsych({
        display_element: "jspsych-target"
      });
      jsPsychRef.current = jsPsych;

      const practice = await loadAndShuffleCsv("/tempData/user-simulations.csv", true);
      const trials = await loadAndShuffleCsv("/tempData/user-trials.csv", true);

      const { blockedTrials, totalBlock, totalData } = groupByBlock(trials);

      timeline.push({
        type: htmlKeyboardResponse,
        stimulus: `
          <div class="screen">
          <h2>Instructions</h2>
          <p>
            You will see a word on the screen.<br /><br />
            Press <b>F</b> if it is a REAL word.<br />
            Press <b>J</b> if it is a NON word.<br /><br />
            Respond as quickly and accurately as possible.
          </p>
          <p>Press <b>F</b> or <b>J</b> to begin.</p>
        </div>
        `,
        choices: ["f", "j"],
        data: {
          phase: PHASE.INSTRUCTION
        }
      });

      timeline.push({
        type: htmlKeyboardResponse,
        stimulus: `
          <div class="screen">
            <h2>Practice Session</h2>
            <p>Press <b>F</b> or <b>J</b> to begin.</p>
          </div>
        `,
        choices: ["f", "j"],
        data: {
          phase: PHASE.INSTRUCTION
        }
      });

      practice.forEach((trial) => {
        timeline.push(...createTrialSet(
          trial,
          false,
          jsPsych
        ));
      });

      timeline.push(createBreakTrial());

      Object.keys(blockedTrials).forEach((blockKey, blockIndex) => {
        const trialSet = blockedTrials[blockKey];

        trialSet.forEach((trial) => {
          timeline.push(...createTrialSet(trial, true));
        });

        if (blockIndex < Object.keys(blockedTrials).length - 1) {
          const breakTimeline = createBreakTrial(totalBlock, (blockIndex + 1));
          timeline.push(breakTimeline);
        }
      });

      timeline.push({
        type: htmlKeyboardResponse,
        stimulus: `<p id="submit-status">Submitting data...</p>`,
        choices: "NO_KEYS",
        trial_duration: null,
        on_load: async () => {
          async function doSubmit() {
            const el = document.getElementById("submit-status");
            if (el) el.innerHTML = `<p>Submitting data...</p>`;

            const results = jsPsych.data.get().filter({ phase: PHASE.TARGET }).values();
            const respondedCount = results.filter(data => data.response !== null).length;
            const correctCount = results.filter(data => data.isCorrect).length;

            saveToLocal({
              respondentInformation: { ...respondentInformation, respondentId },
              results,
              totalCorrect: correctCount,
              totalResponded: respondedCount,
              totalData,
              savedAt: new Date().toISOString(),
            });

            try {
              await submitLdtResult({
                respondentInformation: { ...respondentInformation, respondentId },
                results,
                totalCorrect: correctCount,
                totalResponded: respondedCount,
                totalData,
              });

              if (el) {
                el.innerHTML = `
                  <p style="color:green">Data saved ✅</p>
                  <p>Press <b>ENTER</b> or <b>SPACE</b> to finish</p>
                `;
              }

              jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: () => {
                  isSubmitting.current = true;
                  jsPsych.finishTrial();
                  navigate("/", { replace: true });
                },
                valid_responses: [" ", "Enter"]
              });

            } catch (err) {
              console.error(err);

              if (el) {
                el.innerHTML = `
                  <p style="color:red">Failed to submit ❌</p>
                  <p>Press <b>SPACE</b> to retry submit</p>
                  <p>Press <b>ENTER</b> to continue anyway</p>
                `

              const retryKeyListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: (info) => {
                  jsPsych.pluginAPI.cancelKeyboardResponse(retryKeyListener);

                  if (info.key === " ") {
                    doSubmit();
                  } else if (info.key === "Enter") {
                    isSubmitting.current = true;
                    jsPsych.finishTrial();
                    navigate("/", { replace: true });
                  }
                },
                valid_responses: [" ", "Enter"]
              });
              }
            }
          } 
          doSubmit();
        }
      });

      jsPsych.run(timeline);
    }

    runExperiment();

    return () => {
      if (jsPsychRef.current) {
        try {
          jsPsychRef.current.endExperiment("Component unmounted");
        } catch (e) { }
        jsPsychRef.current = null;
      }
    };
  }, []);

  return <div id="jspsych-target"></div>;
}