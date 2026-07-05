import User from '../models/User.js';

const adminOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      return next();
    }
    return res.status(403).json({ error: 'Admin access required' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export default adminOnly;
