// Short label for where a university's data came from (University.dataSource.provider, set by backend/scripts/dataSync/*)
export const getDataSourceLabel = (provider, { long = false } = {}) => {
  if (!provider) return null;
  const p = String(provider);
  if (p === 'College Scorecard') return 'Official US Govt data';
  if (p === 'CRICOS') return long ? 'Official Australian Govt (CRICOS) data' : 'Official Australian Govt data';
  if (/singapore/i.test(p)) return 'Official Singapore Govt & university data';
  if (/ireland|ILEP|TrustEd/i.test(p)) return 'Official Irish Govt & university data';
  if (/new zealand|NZQA/i.test(p)) return 'Official NZ Govt & university data';
  return 'Official government & university data';
};

// True when the fee itself came from the official source (a sync can verify only some fields, e.g. courses)
const FEE_FIELDS = ['tuitionFeeUSD', 'graduateTuitionUSD', 'tuition'];
export const hasOfficialFee = (dataSource) => {
  if (!dataSource || !dataSource.provider) return false;
  if (dataSource.provider === 'College Scorecard' || dataSource.provider === 'CRICOS') return true;
  return Array.isArray(dataSource.fields) && dataSource.fields.some((f) => FEE_FIELDS.includes(f));
};
