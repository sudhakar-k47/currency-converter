export const CURRENCY_NAMES = {
  USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', AUD: 'Australian Dollar', CAD: 'Canadian Dollar',
  INR: 'Indian Rupee', JPY: 'Japanese Yen', CNY: 'Chinese Yuan', NZD: 'New Zealand Dollar', CHF: 'Swiss Franc',
  SEK: 'Swedish Krona', NOK: 'Norwegian Krone', DKK: 'Danish Krone', SGD: 'Singapore Dollar', HKD: 'Hong Kong Dollar',
  ZAR: 'South African Rand', AED: 'UAE Dirham', SAR: 'Saudi Riyal', THB: 'Thai Baht', PHP: 'Philippine Peso',
  KRW: 'South Korean Won', TRY: 'Turkish Lira', MXN: 'Mexican Peso', BRL: 'Brazilian Real',
};

export const CURRENCY_TO_COUNTRY = {
  USD: 'US', EUR: 'EU', GBP: 'GB', AUD: 'AU', CAD: 'CA', INR: 'IN', JPY: 'JP', CNY: 'CN', NZD: 'NZ', CHF: 'CH',
  SEK: 'SE', NOK: 'NO', DKK: 'DK', SGD: 'SG', HKD: 'HK', ZAR: 'ZA', AED: 'AE', SAR: 'SA', THB: 'TH', PHP: 'PH', KRW: 'KR',
  TRY: 'TR', MXN: 'MX', BRL: 'BR',
};

export function flagEmoji(countryCode) {
  if (!countryCode || countryCode === 'EU') return '🇪🇺';
  const code = countryCode.toUpperCase();
  return String.fromCodePoint(...[...code].map(c => 127397 + c.charCodeAt(0)));
}

export function flagForCurrency(code) {
  const cc = CURRENCY_TO_COUNTRY[code] || code.slice(0, 2);
  return flagEmoji(cc);
}

export function displayName(code) {
  return CURRENCY_NAMES[code] ? `${CURRENCY_NAMES[code]} (${code})` : code;
}

export function formatRate(n) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(n ?? 0);
}
