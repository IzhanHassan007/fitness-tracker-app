const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Calculate basic stats
    const stats = {
      profileCompletion: calculateProfileCompletion(user),
      memberSince: user.createdAt,
      lastActive: user.lastLogin,
      accountStatus: user.isActive ? 'active' : 'inactive'
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user stats'
    });
  }
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    // Soft delete - deactivate account instead of permanently deleting
    await User.findByIdAndUpdate(req.user.id, { 
      isActive: false,
      deactivatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deactivating account'
    });
  }
});

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(user) {
  const fields = [
    user.name,
    user.email,
    user.dateOfBirth,
    user.gender && user.gender !== 'prefer-not-to-say',
    user.height && user.height.value,
    user.activityLevel,
    user.fitnessGoals && user.fitnessGoals.length > 0,
    user.avatar
  ];

  const completedFields = fields.filter(field => field).length;
  return Math.round((completedFields / fields.length) * 100);
}

module.exports = router;
