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

// Rough USD → INR rate used only for the "≈ ₹ Lakh" hint next to an official USD fee
const USD_TO_INR = 85;

/**
 * Yearly tuition to show for a university, or null when there is no official fee.
 * Only fees taken from an official source are shown; estimates and placeholder values never are
 * (callers show CHECK_SITE / a link to the university instead). Prefers the Master's fee when asked.
 * Returns { usd, usdText, inrText, sourceLabel }.
 */
export const getOfficialTuition = (uni, { preferGraduate = false } = {}) => {
  if (!uni || !hasOfficialFee(uni.dataSource)) return null;
  const grad = Number(uni.graduateTuitionUSD) || 0;
  const ug = Number(uni.tuitionFeeUSD) || 0;
  const usd = (preferGraduate && grad > 0) ? grad : (ug || grad);
  if (!usd) return null;
  return {
    usd,
    usdText: `$${Math.round(usd).toLocaleString('en-US')} USD/yr`,
    inrText: `₹${(Math.round((usd * USD_TO_INR) / 10000) / 10).toFixed(1)} Lakh/yr`,
    sourceLabel: getDataSourceLabel(uni.dataSource.provider),
  };
};
