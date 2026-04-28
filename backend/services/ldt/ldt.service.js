const { TYPE_ORDER, REL_VALUE, SHEET_RANGE } = require("../../constants");
const { appendToSheet, safeAppendRows } = require("../googleApi/googleApiService");

const saveLdtResponse = async (data) => {
  await processLdtResponse(data);

  await processLdtCorrectCount(data);

  return { success: true };
};

const processLdtResponse = async (data) => {
  const { 
    results, 
    respondentInformation : {
      name, gender, age, respondentId, group
    }
  } = data;

  try {
    const mappedResult = results
      .sort((a, b) => 
        TYPE_ORDER[a.type] - TYPE_ORDER[b.type]
      )
      .map((eachResult) => {
        const { 
          timestamp, index, block,
          code, prime, target,
          type, response,
          rt, isCorrect, isPseudoword 
        } = eachResult;

        const isResponded = response !== null;

        const keyPressed = isResponded ? response : "none";
        const rtValue = rt !== null ? rt : 2000;
        const isRespondedValue = isResponded ? 1 : 0;
        const isCorrectValue = !isResponded ? 99 : isCorrect ? 1 : 0;
        const isPseudowordValue = isPseudoword ? 1 : 0;
  
        const orthoRel = REL_VALUE[type].orthoRel;
        const semRel = REL_VALUE[type].semRel;
        const typeCode = TYPE_ORDER[type] + 1;
  
        return [
          timestamp,
          respondentId,
          name,
          gender,
          age,
          group,
          index,
          code,
          block,
          type,
          typeCode,
          orthoRel,
          semRel,
          isPseudowordValue,
          prime,
          target,
          isRespondedValue,
          keyPressed,
          rtValue,
          isCorrectValue
        ];
      });
    
    await safeAppendRows({
      respondentId,
      data: mappedResult,
      sheetRange: SHEET_RANGE.results
    });
  
    return { success: true };
  } catch (error) {
    throw error;
  }
}

const processLdtCorrectCount = async (data) => {
  const { 
    totalCorrect, totalResponded, totalData,
    respondentInformation : {
      respondentId
    }
  } = data;
  const timestamp = new Date();

  const percentageCorrect = (totalCorrect/totalData*100).toFixed(2);
  const percentageResponded = (totalResponded/totalData*100).toFixed(2);

  try {
    const countData = [
      timestamp,
      respondentId,
      totalCorrect,
      percentageCorrect,
      totalResponded,
      percentageResponded
    ];

    await appendToSheet([countData], SHEET_RANGE.correctCount);

    return { success: true }
  } catch (error) {
    throw error;
  }
};

module.exports = { saveLdtResponse };