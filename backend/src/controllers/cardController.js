import Card from '../models/Card.js';

export const getCards = async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.userId });
    res.json({ cards });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCard = async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, userId: req.userId });
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json({ card });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const freezeCard = async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, userId: req.userId });
    if (!card) return res.status(404).json({ error: 'Card not found' });

    card.isFrozen = !card.isFrozen;
    card.status = card.isFrozen ? 'frozen' : 'active';
    await card.save();

    res.json({ card, message: card.isFrozen ? 'Card frozen' : 'Card unfrozen' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const changePin = async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;
    if (!currentPin || !newPin) {
      return res.status(400).json({ error: 'Both PINs are required' });
    }

    const card = await Card.findOne({ _id: req.params.id, userId: req.userId }).select('+pin');
    if (!card) return res.status(404).json({ error: 'Card not found' });

    if (card.pin && card.pin !== currentPin) {
      return res.status(401).json({ error: 'Current PIN is incorrect' });
    }

    card.pin = newPin;
    await card.save();

    res.json({ message: 'PIN updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateCardSettings = async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, userId: req.userId });
    if (!card) return res.status(404).json({ error: 'Card not found' });

    if (req.body.settings) {
      card.settings = { ...card.settings, ...req.body.settings };
    }
    if (req.body.limits) {
      card.limits = { ...card.limits, ...req.body.limits };
    }
    await card.save();

    res.json({ card });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const blockCard = async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, userId: req.userId });
    if (!card) return res.status(404).json({ error: 'Card not found' });

    card.status = 'blocked';
    card.isFrozen = true;
    await card.save();

    res.json({ card, message: 'Card blocked' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const replaceCard = async (req, res) => {
  try {
    const { reason } = req.body;
    const oldCard = await Card.findOne({ _id: req.params.id, userId: req.userId });
    if (!oldCard) return res.status(404).json({ error: 'Card not found' });

    oldCard.status = 'blocked';
    await oldCard.save();

    const newCard = await Card.create({
      userId: req.userId,
      cardNumber: '4532' + Math.random().toString().slice(2, 6) + Math.random().toString().slice(2, 6) + Math.random().toString().slice(2, 6),
      last4: Math.floor(1000 + Math.random() * 9000).toString(),
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      holder: oldCard.holder,
      expiry: oldCard.expiry,
      type: oldCard.type,
      tier: oldCard.tier,
      color: oldCard.color,
      limits: oldCard.limits,
      settings: oldCard.settings,
      spending: oldCard.spending
    });

    res.json({ card: newCard, message: 'Card replaced' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
