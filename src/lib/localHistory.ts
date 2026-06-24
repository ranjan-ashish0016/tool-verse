export type HistoryCollection =
  | "gst_history"
  | "emi_history"
  | "age_history"
  | "qr_history"
  | "password_history";

export interface LocalHistoryRecord {
  id: string;
  collectionName: HistoryCollection;
  timestamp: string;
  [key: string]: any;
}

const STORAGE_KEY = "toolverse_history";

const readHistory = (): LocalHistoryRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Could not read local history:", err);
    return [];
  }
};

const writeHistory = (records: LocalHistoryRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn("Could not write local history:", err);
  }
};

export const addHistoryRecord = (collectionName: HistoryCollection, data: Record<string, any>) => {
  const record: LocalHistoryRecord = {
    ...data,
    id: crypto.randomUUID(),
    collectionName,
    timestamp: new Date().toISOString(),
  };

  writeHistory([record, ...readHistory()]);
  return record;
};

export const getHistoryRecords = () => readHistory();

export const deleteHistoryRecord = (collectionName: HistoryCollection, id: string) => {
  writeHistory(readHistory().filter((record) => !(record.collectionName === collectionName && record.id === id)));
};

export const clearHistoryRecords = () => writeHistory([]);
