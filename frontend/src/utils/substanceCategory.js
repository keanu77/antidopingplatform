// Missing classification is not a verified substance/rule label.
export function hasSubstanceCategoryLabel(category) {
  return Boolean(category?.trim()) && !/未.*核對|未標示/.test(category);
}
