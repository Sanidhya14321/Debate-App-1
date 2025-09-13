import User from '../models/User.js';
import Debate from '../models/Debate.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const debateCount = await Debate.countDocuments();

    res.json({ userCount, debateCount });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
