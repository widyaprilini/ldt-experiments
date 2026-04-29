const { TYPE_ORDER, REL_VALUE, SHEET_RANGE } = require("../../constants");
const { appendToSheet, safeAppendRows } = require("../googleApi/googleApiService");

const saveLextaleResponse = async (data) => {
  await processLextaleResponse(data);

  await processLextaleCorrectCount(data);

  return { success: true };
};

const processLextaleResponse = async (data) => {
  const { 
    results, 
    respondentInformation : {
      respondentId, group
    }
  } = data;

  try {
    const mappedResult = results
      .map((eachResult) => {
        const { 
          word, type, response, rt, isCorrect
        } = eachResult;
  
        return [
          respondentId,
          group,
          word,
          type,
          response,
          rt,
          isCorrect ? 1 : 0
        ];
      });
    
    await appendToSheet(mappedResult, SHEET_RANGE.lextaleResults);
  
    return { success: true };
  } catch (error) {
    throw error;
  }
}

const processLextaleCorrectCount = async (data) => {
  const { 
    startTime,
    endTime,
    duration,
    results,
    respondentInformation : {
      respondentId
    }
  } = data;

  const wordItems = results.filter(item => item.type === 1);
  const nonWordItems = results.filter(item => item.type === 0);
  const wordCorrect = wordItems.filter(item => item.isCorrect).length;
  const nonWordCorrect = nonWordItems.filter(item => item.isCorrect).length;
  const wordAccuracy = wordItems.length 
    ? (wordCorrect / wordItems.length) * 100 
    : 0;
  const nonWordAccuracy = nonWordItems.length 
    ? (nonWordCorrect / nonWordItems.length) * 100 
    : 0;
  const score = (wordAccuracy + nonWordAccuracy) / 2;

  try {
    const scoreData = [
      respondentId,
      startTime,
      endTime,
      duration,
      score.toFixed(2),
    ];

    await appendToSheet([scoreData], SHEET_RANGE.lextaleScore);

    return { success: true }
  } catch (error) {
    throw error;
  }
};

module.exports = { saveLextaleResponse };