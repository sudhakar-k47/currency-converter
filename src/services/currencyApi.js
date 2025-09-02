const API_KEY = "1SMxQumaAcC996SUXGsnlBPW44t2RR82";
const API_BASE = 'https://api.currencybeacon.com/v1';

async function fetchJson(url) {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function symbolsParam(symbols) {
  const list = (symbols || []).filter(Boolean);
  return list.length ? `&symbols=${encodeURIComponent(list.join(','))}` : '';
}

// Fallback provider: exchangerate.host (no key required)
async function fallbackLatest(base, symbols) {
  const url = `https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}${symbolsParam(symbols)}`;
  const { ok, status, data } = await fetchJson(url);
  if (!ok) throw new Error(`Failed to fetch latest rates (${status})`);
  if (!data || typeof data !== 'object' || !data.rates) throw new Error('Unexpected latest rates response');
  return { base: data.base, rates: data.rates };
}

async function fallbackConvert(from, to, amount) {
  const url = `https://api.exchangerate.host/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}`;
  const { ok, status, data } = await fetchJson(url);
  if (!ok) throw new Error(`Failed to convert (${status})`);
  const val = data.result;
  if (val == null) throw new Error('Unexpected convert response');
  return Number(val);
}

export async function getLatest(base, symbols) {
  // If no key, go straight to fallback
  if (!API_KEY) {
    return await fallbackLatest(base, symbols);
  }
  const url = `${API_BASE}/latest?api_key=${API_KEY}&base=${encodeURIComponent(base)}${symbolsParam(symbols)}`;
  const { ok, status, data } = await fetchJson(url);
  if (ok) {
    if (!data || typeof data !== 'object' || !data.rates) throw new Error('Unexpected latest rates response');
    return data;
  }
  // 401/403 → fallback
  if (status === 401 || status === 403) {
    return await fallbackLatest(base, symbols);
  }
  throw new Error(`Failed to fetch latest rates (${status})`);
}

export async function convertAmount(from, to, amount) {
  if (!API_KEY) {
    return await fallbackConvert(from, to, amount);
  }
  const url = `${API_BASE}/convert?api_key=${API_KEY}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}`;
  const { ok, status, data } = await fetchJson(url);
  if (ok) {
    const val = data.value ?? data.response?.value;
    if (val == null) throw new Error('Unexpected convert response');
    return Number(val);
  }
  if (status === 401 || status === 403) {
    return await fallbackConvert(from, to, amount);
  }
  throw new Error(`Failed to convert (${status})`);
}
