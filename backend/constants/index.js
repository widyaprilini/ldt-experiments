const TYPE_ORDER = {
  cog: 0,
  nei: 1,
  tra: 2,
  unr: 3,
  nw: 4
};

const COLUMN_KEY = [
  "timestamp",
  "respondentId",
  "respondentName",
  "gender",
  "age",
  "index",
  "trialCode",
  "block",
  "cond",
  "condCode",
  "orthoRel",
  "semRel",
  "nwCond",
  "primeWord",
  "targetWord",
  "isResponded",
  "keyPressed",
  "RT",
  "isCorrect"
];

const REL_VALUE = {
  cog: {
    orthoRel: 1,
    semRel: 1 
  },
  nei: {
    orthoRel: 1,
    semRel: -1
  },
  tra: {
    orthoRel: -1,
    semRel: 1
  },
  unr: {
    orthoRel: -1,
    semRel: -1
  },
  nw: {
    orthoRel: 0,
    semRel: 0
  }
};

const SHEET_RANGE = {
  results: "result!A:M",
  correctCount: "correct_count!A:B",
  lextaleResults: 'lextale_result!A:F',
  lextaleScore: 'lextale_score!A:E',
}

module.exports = { TYPE_ORDER, COLUMN_KEY, REL_VALUE, SHEET_RANGE };