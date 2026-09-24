export function hasBan(caseData) {
  const ban = String(caseData.punishment?.banDuration ?? "");
  return ban !== "" && !/無處罰|無禁賽|無[（(]|無正式禁賽|合法|處分撤銷|未成立|^公開警告$|^譴責$/.test(ban);
}

export function banDurationCategory(caseData) {
  const ban = String(caseData.punishment?.banDuration ?? "");
  if (!hasBan(caseData)) return "無禁賽／處分撤銷";
  if (/死亡|受害者/.test(ban)) return "死亡／特殊情況";
  if (/終身|無限期/.test(ban)) return "終身／無限期";
  if (/暫時禁賽/.test(ban)) return "暫時禁賽（非最終處分）";
  if (/場|球季|賽季/.test(ban)) return "特定比賽場次";
  if (/\d+[-–]\d+年|不等/.test(ban)) return "期間不一";
  // Parse the whole duration before examining months: 4年3個月 is 51 months, not 3.
  const years = ban.match(/(\d+(?:\.\d+)?)年(?:\s*(\d+)個月)?/);
  const monthsOnly = ban.match(/(\d+)個月/);
  const months = years ? Number(years[1]) * 12 + Number(years[2] ?? 0) : Number(monthsOnly?.[1] ?? 0);
  if (months > 0 && months <= 6) return "1-6個月";
  if (months <= 12 && months > 0) return "7-12個月";
  if (months <= 24 && months > 0) return "1-2年";
  if (months < 48 && months > 0) return "2-4年";
  if (months >= 48) return "4年以上";
  if (/退役/.test(ban)) return "退役";
  return "其他";
}
