const { TYPE_ORDER } = require("../../constants");
const { appendToSheet } = require("../googleApi/googleApiService");

const saveLdtResponse = async (data) => {
  const { 
    results, 
    respondentInformation : {
      name, gender, age
    }
  } = data;
  const respondent_id = Math.random().toString(36).substring(2, 4);
  const timestamp = new Date();

  const mappedResult = results
    .sort((a, b) => 
      TYPE_ORDER[a.trialData.type] - TYPE_ORDER[b.trialData.type]
    )
    .map((eachResult) => {
      const { trialData, response: keyPressed, rt, isCorrect } = eachResult;
      const { code, prime, target, type } = trialData;

      const isResponded = Number(rt) < 2000 ? 1 : 0;
      const isCorrectValue = isCorrect ? 1 : 0; 

      return [
        "",
        timestamp,
        respondent_id,
        name,
        gender,
        age,
        code,
        type,
        prime,
        target,
        isResponded,
        keyPressed,
        rt,
        isCorrectValue
      ];
    });
  
  console.log(mappedResult, 'mappedResult');

  await appendToSheet(mappedResult);

  return mappedResult;
};

module.exports = { saveLdtResponse };