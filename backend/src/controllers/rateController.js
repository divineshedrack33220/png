import Rate from '../models/Rate.js';

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
