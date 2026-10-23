import { describe, it, expect } from 'vitest';
import data from '../../../backend/data/substances.json';
import { evaluateDrug } from './tueDecision.js';

describe('來源與規則版本守門', () => {
  const drug = () => ({ ...data.substances.guanfacine });
  it('沒有可追溯來源時不宣告允許', () => {
    const missing = drug(); delete missing.evidenceId;
    expect(evaluateDrug(missing, { asOf: '2026-10-23' }).verdict).toBe('unknown');
  });
  it.each(['2025-12-31', '2027-01-01', '2027-06-01', 'bad-date'])('日期 %s 不可使用2026允許判定', (asOf) => {
    expect(evaluateDrug(drug(), { asOf }).verdict).toBe('unknown');
  });
  it.each(['2026-10-23', '2026-12-31'])('有效日期 %s 仍可判讀已核對規則', (asOf) => {
    expect(evaluateDrug(drug(), { asOf }).verdict).toBe('permitted');
  });
  it.each(['2026-01-01', '2026-10-22'])('核對日期之前的 %s 不可沿用尚未發生的核對結果', (asOf) => {
    expect(evaluateDrug(drug(), { asOf }).verdict).toBe('unknown');
  });
  it('已公布的2027版本不得自動啟用', () => {
    expect(evaluateDrug({ ...drug(), ruleVersion: 'wada-2027' }, { asOf: '2027-01-01' }).verdict).toBe('unknown');
  });
  it('未知來源與不相符版本不放行', () => {
    expect(evaluateDrug({ ...drug(), evidenceId: 'missing' }, { asOf: '2026-10-23' }).verdict).toBe('unknown');
    expect(evaluateDrug({ ...drug(), ruleVersion: null }, { asOf: '2026-10-23' }).verdict).toBe('unknown');
  });
});
