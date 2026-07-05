import GiftCard from '../models/GiftCard.js';

export const getGiftCards = async (req, res) => {
  try {
    const cards = await GiftCard.find({ isActive: true });
    res.json({ giftCards: cards });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
