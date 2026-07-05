import User from '../models/User.js';

const TIER_LIMITS = {
  1: { label: 'Basic', sendLimit: 0, canSendCrypto: false, minBalance: 0 },
  2: { label: 'Standard', sendLimit: 1000, canSendCrypto: false, minBalance: 0 },
  3: { label: 'Premium', sendLimit: 50000, canSendCrypto: true, minBalance: 5000 }
};

function buildTierInfo(user) {
  return {
    currentTier: user.tier || 1,
    limits: TIER_LIMITS,
    canSendCrypto: user.tier >= 3 && (user.balance?.USD || 0) >= 5000,
    nextTier: user.tier < 3 ? {
      tier: user.tier + 1,
      requirements: user.tier === 1
        ? [{ text: 'Submit SSN for verification', done: user.kycStatus === 'verified' }]
        : [{ text: 'Maintain minimum $5,000 balance', done: (user.balance?.USD || 0) >= 5000 }]
    } : null
  };
}

export const getProfile = async (req, res) => {
  try {
    const userData = req.user.toSafeObject();
    userData.tierInfo = buildTierInfo(req.user);
    res.json({ user: userData });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'avatar', 'dateOfBirth', 'address'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.userId, updates, { returnDocument: 'after', runValidators: true });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const exists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.userId } });
    if (exists) return res.status(409).json({ error: 'Email already in use' });

    const user = await User.findByIdAndUpdate(req.userId, { email: email.toLowerCase() }, { returnDocument: 'after' });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUsername = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    const exists = await User.findOne({ username: username.toLowerCase(), _id: { $ne: req.userId } });
    if (exists) return res.status(409).json({ error: 'Username already taken' });

    const user = await User.findByIdAndUpdate(req.userId, { username: username.toLowerCase() }, { returnDocument: 'after' });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords are required' });
    }

    const user = await User.findById(req.userId).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { settings: { ...req.user.settings, ...req.body } } },
      { returnDocument: 'after' }
    );
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const addBankAccount = async (req, res) => {
  try {
    const { name, type, accountNumber, routingNumber } = req.body;
    if (!name || !accountNumber || !routingNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const last4 = accountNumber.slice(-4);
    const bankId = 'BANK' + Date.now();

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $push: {
          bankAccounts: {
            id: bankId,
            name,
            type: type || 'Checking',
            last4,
            isDefault: req.user.bankAccounts.length === 0
          }
        }
      },
      { returnDocument: 'after' }
    );

    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeBankAccount = async (req, res) => {
  try {
    const { bankId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { bankAccounts: { id: bankId } } },
      { returnDocument: 'after' }
    );
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const setDefaultBank = async (req, res) => {
  try {
    const { bankId } = req.params;
    const user = await User.findById(req.userId);

    user.bankAccounts.forEach(b => { b.isDefault = b.id === bankId; });
    await user.save();

    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { confirm } = req.body;
    if (confirm !== 'DELETE') {
      return res.status(400).json({ error: 'Type DELETE to confirm' });
    }

    await User.findByIdAndUpdate(req.userId, { isDeleted: true });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const submitKycDocument = async (req, res) => {
  try {
    const { docType, front, back, selfie } = req.body;

    if (!docType || !['ssn', 'id'].includes(docType)) {
      return res.status(400).json({ error: 'Invalid document type. Use ssn or id' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (docType === 'ssn') {
      if (!front) return res.status(400).json({ error: 'SSN document is required' });
      user.kycDocuments.push({
        type: 'ssn',
        front,
        status: 'pending',
        submittedAt: new Date()
      });
    } else if (docType === 'id') {
      if (!front || !back || !selfie) return res.status(400).json({ error: 'Front, back, and selfie are required' });
      user.kycDocuments.push({
        type: 'id_card',
        front, back, selfie,
        status: 'pending',
        submittedAt: new Date()
      });
    }

    user.kycStatus = 'pending';
    await user.save();

    res.json({ message: 'Documents submitted for review', kycStatus: 'pending' });
  } catch (err) {
    console.error('Submit KYC error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTierInfo = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const eligibleForTier3 = (user.balance?.USD || 0) >= 5000;
    if (user.tier >= 2 && eligibleForTier3 && user.tier < 3) {
      user.tier = 3;
      await user.save();
    }

    res.json({ tierInfo: buildTierInfo(user) });
  } catch (err) {
    console.error('Get tier info error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
