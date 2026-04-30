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

export function saveToLocal(key, value) {
    try {
      localStorage.removeItem(key);
      const stored = JSON.parse(localStorage.getItem(key) || "[]");
      stored.push(value);
      localStorage.setItem(key, JSON.stringify(stored));
      console.log("✅ Data saved locally as backup.");
    } catch (err) {
      console.error("Failed to store backup:", key, err);
    }
  }