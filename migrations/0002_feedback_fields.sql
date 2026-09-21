-- 補回前端 FeedbackBar 實際送出、但 0001 簡化掉的欄位（只加欄位，不動既有資料）。
-- page 欄位沿用為 toolSlug（前端的 pathname）。
-- type 現為 'rating' | 'feedback' | 'error'，外加遷移期的舊值 'issue'。
ALTER TABLE feedback ADD COLUMN issue_type  TEXT;
ALTER TABLE feedback ADD COLUMN error_type  TEXT;
ALTER TABLE feedback ADD COLUMN description TEXT;
ALTER TABLE feedback ADD COLUMN suggestion  TEXT;
ALTER TABLE feedback ADD COLUMN refs        TEXT;
ALTER TABLE feedback ADD COLUMN role        TEXT;
ALTER TABLE feedback ADD COLUMN email       TEXT;
ALTER TABLE feedback ADD COLUMN url         TEXT;
ALTER TABLE feedback ADD COLUMN ua_class    TEXT;
ALTER TABLE feedback ADD COLUMN viewport    TEXT;
ALTER TABLE feedback ADD COLUMN snapshot    TEXT;
