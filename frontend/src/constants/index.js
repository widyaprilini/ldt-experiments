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

const LEXTALE_STIMULI = [
  { id: 0, word: "platery", type: 0 },
  { id: 0, word: "denial", type: 1 },
  { id: 0, word: "generic", type: 1 },
  { id: 1, word: "mensible", type: 0 },
  { id: 2, word: "scornful", type: 1 },
  { id: 3, word: "stoutly", type: 1 },
  { id: 4, word: "ablaze", type: 1 },
  { id: 5, word: "kermshaw", type: 0 },
  { id: 6, word: "moonlit", type: 1 },
  { id: 7, word: "lofty", type: 1 },
  { id: 8, word: "hurricane", type: 1 },
  { id: 9, word: "flaw", type: 1 },
  { id: 10, word: "alberation", type: 0 },
  { id: 11, word: "unkempt", type: 1 },
  { id: 12, word: "breeding", type: 1 },
  { id: 13, word: "festivity", type: 1 },
  { id: 14, word: "screech", type: 1 },
  { id: 15, word: "savoury", type: 1 },
  { id: 16, word: "plaudate", type: 0 },
  { id: 17, word: "shin", type: 1 },
  { id: 18, word: "fluid", type: 1 },
  { id: 19, word: "spaunch", type: 0 },
  { id: 20, word: "allied", type: 1 },
  { id: 21, word: "slain", type: 1 },
  { id: 22, word: "recipient", type: 1 },
  { id: 23, word: "exprate", type: 0 },
  { id: 24, word: "eloquence", type: 1 },
  { id: 25, word: "cleanliness", type: 1 },
  { id: 26, word: "dispatch", type: 1 },
  { id: 27, word: "rebondicate", type: 0 },
  { id: 28, word: "ingenious", type: 1 },
  { id: 29, word: "bewitch", type: 1 },
  { id: 30, word: "skave", type: 0 },
  { id: 31, word: "plaintively", type: 1 },
  { id: 32, word: "kilp", type: 0 },
  { id: 33, word: "interfate", type: 0 },
  { id: 34, word: "hasty", type: 1 },
  { id: 35, word: "lengthy", type: 1 },
  { id: 36, word: "fray", type: 1 },
  { id: 37, word: "crumper", type: 0 },
  { id: 38, word: "upkeep", type: 1 },
  { id: 39, word: "majestic", type: 1 },
  { id: 40, word: "magrity", type: 0 },
  { id: 41, word: "nourishment", type: 1 },
  { id: 42, word: "abergy", type: 0 },
  { id: 43, word: "proom", type: 0 },
  { id: 44, word: "turmoil", type: 1 },
  { id: 45, word: "carbohydrate", type: 1 },
  { id: 46, word: "scholar", type: 1 },
  { id: 47, word: "turtle", type: 1 },
  { id: 48, word: "fellick", type: 0 },
  { id: 49, word: "destription", type: 0 },
  { id: 50, word: "cylinder", type: 1 },
  { id: 51, word: "censorship", type: 1 },
  { id: 52, word: "celestial", type: 1 },
  { id: 53, word: "rascal", type: 1 },
  { id: 54, word: "purrage", type: 0 },
  { id: 55, word: "pulsh", type: 0 },
  { id: 56, word: "muddy", type: 1 },
  { id: 57, word: "quirty", type: 0 },
  { id: 58, word: "pudour", type: 0 },
  { id: 59, word: "listless", type: 1 },
  { id: 60, word: "wrought", type: 1 }
];

const LEXTALE_STIMULI_TEST = [
  { id: 58, word: "pudour", type: 0 },
  { id: 59, word: "listless", type: 1 },
  { id: 60, word: "wrought", type: 1 }
];

const LEXTALE_STITMULI_PRACTICE = [
  { id: 0, word: "platery", type: 0 },
  { id: 0, word: "denial", type: 1 },
  { id: 0, word: "generic", type: 1 }
];

const GROUP_VALUE = {
  A: {
    wordSymbol: "J",
    nonWordSymbol: "F"
  },
  B: {
    wordSymbol: "F",
    nonWordSymbol: "J"
  },
};

module.exports = { PHASE, LEXTALE_STIMULI, LEXTALE_STITMULI_PRACTICE, LEXTALE_STIMULI_TEST, GROUP_VALUE };