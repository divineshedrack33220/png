import https from 'https';
import Rate from '../models/Rate.js';

const CG_IDS = {
  'BTC/USD': 'bitcoin', 'ETH/USD': 'ethereum', 'USDT/USD': 'tether',
  'SOL/USD': 'solana', 'XRP/USD': 'ripple', 'DOGE/USD': 'dogecoin',
  'USDC/USD': 'usd-coin', 'ADA/USD': 'cardano', 'AVAX/USD': 'avalanche-2',
  'DOT/USD': 'polkadot'
};
const CG_IDS_LIST = Object.values(CG_IDS).join(',');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000, headers: { 'User-Agent': 'Coinexs/1.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ ok: res.statusCode === 200, status: res.statusCode, json: () => JSON.parse(data) }));
    }).on('error', reject).on('timeout', function() { this.destroy(); reject(new Error('timeout')); });
  });
}

export async function fetchLiveRates() {
  try {
    const res = await httpsGet(`https://api.coingecko.com/api/v3/simple/price?ids=${CG_IDS_LIST}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`);
    if (!res.ok) { console.error('CoinGecko error:', res.status); return; }
    let data;
    try { data = await res.json(); } catch { console.error('CoinGecko parse error'); return; }
    if (!data || typeof data !== 'object') { console.error('CoinGecko empty response'); return; }
    for (const [pair, id] of Object.entries(CG_IDS)) {
      const cg = data[id];
      if (!cg) continue;
      const usd = cg.usd || 0;
      const change = cg.usd_24h_change != null ? parseFloat(cg.usd_24h_change.toFixed(2)) : 0;
      const volume = cg.usd_24h_vol ? formatLarge(cg.usd_24h_vol) : '-';
      const marketCap = cg.usd_market_cap ? formatLarge(cg.usd_market_cap) : '-';
      await Rate.updateOne({ pair }, {
        $set: {
          buy: usd, sell: usd * 0.995,
          change, volume, marketCap,
          lastUpdated: new Date()
        }
      });
    }
  } catch (err) {
    console.error('fetchLiveRates error:', err.code || err.message || String(err));
  }
}

function formatLarge(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  return (n / 1e3).toFixed(1) + 'K';
}

export const getRates = async (req, res) => {
  try {
    const { type, search } = req.query;
    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (search) {
      filter.$or = [
        { pair: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const rates = await Rate.find(filter).sort({ marketCap: -1 });
    res.json({ rates });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getRate = async (req, res) => {
  try {
    const rate = await Rate.findOne({ pair: req.params.pair.toUpperCase() });
    if (!rate) return res.status(404).json({ error: 'Rate not found' });
    res.json({ rate });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateRate = async (req, res) => {
  try {
    const { pair, buy, sell, change, high24, low24, marketCap, volume, supply, trend } = req.body;
    const rate = await Rate.findOneAndUpdate(
      { pair: pair.toUpperCase() },
      { buy, sell, change, high24, low24, marketCap, volume, supply, trend, lastUpdated: new Date() },
      { returnDocument: 'after' }
    );
    if (!rate) return res.status(404).json({ error: 'Rate not found' });
    res.json({ rate });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const rate = await Rate.findOne({ pair: req.params.pair.toUpperCase() });
    if (!rate) return res.status(404).json({ error: 'Rate not found' });

    rate.favorite = !rate.favorite;
    await rate.save();

    res.json({ rate, message: rate.favorite ? 'Added to favorites' : 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
