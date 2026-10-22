import { prohibitedList } from "../data/prohibitedList.js";
import { substances } from "../../../backend/data/substances.json";

const normalize = (value) => String(value ?? "").normalize("NFKC").toLowerCase().trim().replace(/\s+/g, " ");

// 別名與細分類取用查詢工具的同一份物質資料，避免另養一份藥名表。
const index = prohibitedList.map((item) => {
  const aliases = Object.entries(substances)
    .filter(([, substance]) => substance.wadaCode.split(".")[0] === item.code)
    .flatMap(([key, substance]) => [key, substance.displayName, substance.wadaCode, ...(substance.aliases || [])]);
  return {
    item,
    text: normalize([item.code, item.name, item.nameEn, item.description, item.medicalUse, ...item.keySubstances, ...aliases].join(" ")),
  };
});

export function filterProhibitedList(search = "", timing = "all") {
  const query = normalize(search);
  return index
    .filter(({ item, text }) => (timing === "all" || item.timing === timing) && (!query || text.includes(query)))
    .map(({ item }) => item);
}
