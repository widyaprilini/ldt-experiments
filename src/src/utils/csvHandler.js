import Papa from "papaparse";

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

export const loadAndShuffleCsv = async (path, shuffle = false) => {
  const response = await fetch(path);
  const csvText = await response.text();

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true
  });

  return shuffle ? shuffleArray(parsed.data) : parsed.data;
};