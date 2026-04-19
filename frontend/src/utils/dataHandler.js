export function groupByBlock(data) {
  const blockedTrials = data.reduce((acc, item) => {
    const block = item.block;

    if (!acc[block]) {
      acc[block] = [];
    }

    acc[block].push(item);

    return acc;
  }, {});

  const totalBlock = Object.keys(blockedTrials).length;
  const totalData = data.length;

  return {
    blockedTrials,
    totalBlock,
    totalData
  };
}