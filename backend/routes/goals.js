const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Goal = require('../models/Goal');
const WeightEntry = require('../models/Weight');
const Workout = require('../models/Workout');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules for goal creation/update
const goalValidation = [
  body('type')
    .isIn(['weight-loss', 'weight-gain', 'muscle-gain', 'fat-loss', 'strength', 'endurance', 'habit', 'custom'])
    .withMessage('Invalid goal type'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('priority')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('targetDate')
    .isISO8601()
    .custom((value) => {
      const targetDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (targetDate <= today) {
        throw new Error('Target date must be in the future');
      }
      return true;
    })
    .withMessage('Target date must be a valid future date'),
  body('targetValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Target value must be a positive number'),
  body('currentValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current value must be a positive number'),
  body('unit')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Unit must be between 1 and 20 characters'),
  body('frequency.type')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'once'])
    .withMessage('Invalid frequency type'),
  body('frequency.target')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Frequency target must be a positive integer'),
  body('category')
    .optional()
    .isIn(['fitness', 'nutrition', 'health', 'lifestyle', 'performance'])
    .withMessage('Invalid category'),
];

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
router.get('/', protect, [
  query('status').optional().isIn(['active', 'completed', 'paused', 'cancelled']).withMessage('Invalid status'),
  query('type').optional().isIn(['weight-loss', 'weight-gain', 'muscle-gain', 'fat-loss', 'strength', 'endurance', 'habit', 'custom']).withMessage('Invalid type'),
  query('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  query('category').optional().isIn(['fitness', 'nutrition', 'health', 'lifestyle', 'performance']).withMessage('Invalid category'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      status,
      type,
      priority,
      category,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { user: req.user.id };
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get goals with pagination
    const goals = await Goal.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('user', 'name');

    // Get total count for pagination
    const total = await Goal.countDocuments(filter);

    res.json({
      success: true,
      data: goals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching goals'
    });
  }
});

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('user', 'name');

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching goal'
    });
  }
});

// @desc    Create new goal
// @route   POST /api/goals
// @access  Private
router.post('/', protect, goalValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const goalData = {
      ...req.body,
      user: req.user.id
    };

    const goal = new Goal(goalData);
    await goal.save();

    await goal.populate('user', 'name');

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating goal'
    });
  }
});

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
router.put('/:id', protect, goalValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Update goal fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        goal[key] = req.body[key];
      }
    });

    await goal.save();
    await goal.populate('user', 'name');

    res.json({
      success: true,
      message: 'Goal updated successfully',
      data: goal
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating goal'
    });
  }
});

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    await Goal.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting goal'
    });
  }
});

// @desc    Update goal progress
// @route   PATCH /api/goals/:id/progress
// @access  Private
router.patch('/:id/progress', protect, [
  body('currentValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current value must be a positive number'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('completedAt')
    .optional()
    .isISO8601()
    .withMessage('Completed at must be a valid date'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    const { currentValue, notes, completedAt } = req.body;

    // Update progress
    if (currentValue !== undefined) {
      // Add progress entry
      const progressEntry = {
        value: currentValue,
        date: new Date(),
        notes: notes || null
      };
      
      goal.progress.push(progressEntry);
      goal.currentValue = currentValue;
      
      // Update last progress date
      goal.lastProgressUpdate = new Date();
    }

    // Mark as completed if specified
    if (completedAt) {
      goal.status = 'completed';
      goal.completedAt = new Date(completedAt);
      goal.actualCompletionDate = new Date(completedAt);
    }

    // Auto-complete if target is reached
    if (goal.targetValue && goal.currentValue >= goal.targetValue && goal.status === 'active') {
      goal.status = 'completed';
      goal.completedAt = new Date();
      goal.actualCompletionDate = new Date();
    }

    await goal.save();
    await goal.populate('user', 'name');

    res.json({
      success: true,
      message: 'Goal progress updated successfully',
      data: goal
    });
  } catch (error) {
    console.error('Update goal progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating goal progress'
    });
  }
});

// @desc    Update goal status
// @route   PATCH /api/goals/:id/status
// @access  Private
router.patch('/:id/status', protect, [
  body('status')
    .isIn(['active', 'completed', 'paused', 'cancelled'])
    .withMessage('Invalid status'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reason cannot exceed 200 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    const { status, reason } = req.body;
    const oldStatus = goal.status;

    goal.status = status;

    // Set completion date if marked as completed
    if (status === 'completed' && oldStatus !== 'completed') {
      goal.completedAt = new Date();
      goal.actualCompletionDate = new Date();
    }

    // Clear completion date if status changed from completed
    if (status !== 'completed' && oldStatus === 'completed') {
      goal.completedAt = null;
      goal.actualCompletionDate = null;
    }

    // Add status change to activity log
    if (reason) {
      goal.notes = reason;
    }

    await goal.save();
    await goal.populate('user', 'name');

    res.json({
      success: true,
      message: `Goal status updated to ${status}`,
      data: goal
    });
  } catch (error) {
    console.error('Update goal status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating goal status'
    });
  }
});

// @desc    Get goal analytics and insights
// @route   GET /api/goals/analytics
// @access  Private
router.get('/analytics/overview', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get goal counts by status
    const statusCounts = await Goal.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get goal counts by type
    const typeCounts = await Goal.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get completion rate over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const completionTrend = await Goal.aggregate([
      {
        $match: {
          user: userId,
          completedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          completed: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get goals with upcoming deadlines (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingDeadlines = await Goal.find({
      user: userId,
      status: 'active',
      targetDate: { $lte: thirtyDaysFromNow }
    })
    .sort({ targetDate: 1 })
    .limit(10)
    .populate('user', 'name');

    // Calculate average completion time
    const completedGoals = await Goal.find({
      user: userId,
      status: 'completed',
      completedAt: { $exists: true }
    });

    let averageCompletionDays = 0;
    if (completedGoals.length > 0) {
      const totalDays = completedGoals.reduce((sum, goal) => {
        const created = new Date(goal.createdAt);
        const completed = new Date(goal.completedAt);
        const days = Math.floor((completed - created) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      averageCompletionDays = Math.round(totalDays / completedGoals.length);
    }

    // Get success rate by goal type
    const successRateByType = await Goal.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          successRate: {
            $multiply: [
              { $divide: ['$completed', '$total'] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        typeCounts: typeCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        completionTrend,
        upcomingDeadlines,
        averageCompletionDays,
        successRateByType,
        totalGoals: await Goal.countDocuments({ user: userId })
      }
    });
  } catch (error) {
    console.error('Get goals analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching goals analytics'
    });
  }
});

// @desc    Get goal progress insights
// @route   GET /api/goals/:id/insights
// @access  Private
router.get('/:id/insights', protect, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('user', 'name');

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    const insights = await goal.generateInsights();

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Get goal insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating goal insights'
    });
  }
});

// @desc    Sync goal with actual data (weight, workouts, etc.)
// @route   POST /api/goals/:id/sync
// @access  Private
router.post('/:id/sync', protect, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    let updatedData = {};

    // Sync with weight data for weight-related goals
    if (['weight-loss', 'weight-gain'].includes(goal.type)) {
      const latestWeight = await WeightEntry.findOne({
        user: req.user.id
      }).sort({ measuredAt: -1 }).limit(1);

      if (latestWeight) {
        const currentWeight = latestWeight.weight.value;
        
        // Update current value based on goal type
        if (goal.type === 'weight-loss') {
          // For weight loss, current value represents weight lost
          const startingWeight = goal.startingValue || currentWeight;
          updatedData.currentValue = Math.max(0, startingWeight - currentWeight);
        } else if (goal.type === 'weight-gain') {
          // For weight gain, current value represents weight gained
          const startingWeight = goal.startingValue || currentWeight;
          updatedData.currentValue = Math.max(0, currentWeight - startingWeight);
        }
        
        updatedData.lastProgressUpdate = new Date();
      }
    }

    // Sync with workout data for strength/endurance goals
    if (['strength', 'endurance'].includes(goal.type)) {
      const recentWorkouts = await Workout.find({
        user: req.user.id,
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }).sort({ date: -1 }).limit(10);

      if (recentWorkouts.length > 0) {
        // This is a simplified sync - in practice, you'd want more specific logic
        // based on the exact goal criteria (e.g., specific exercise, rep range, etc.)
        updatedData.lastProgressUpdate = new Date();
      }
    }

    // Update the goal with synced data
    Object.keys(updatedData).forEach(key => {
      goal[key] = updatedData[key];
    });

    await goal.save();
    await goal.populate('user', 'name');

    res.json({
      success: true,
      message: 'Goal synced with actual data',
      data: {
        goal,
        updatedFields: Object.keys(updatedData)
      }
    });
  } catch (error) {
    console.error('Sync goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while syncing goal'
    });
  }
});

// @desc    Get goal dashboard summary
// @route   GET /api/goals/dashboard/summary
// @access  Private
router.get('/dashboard/summary', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get active goals
    const activeGoals = await Goal.find({
      user: userId,
      status: 'active'
    }).sort({ priority: -1, targetDate: 1 }).limit(5);

    // Get recently completed goals
    const recentlyCompleted = await Goal.find({
      user: userId,
      status: 'completed',
      completedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ completedAt: -1 }).limit(3);

    // Get overdue goals
    const overdueGoals = await Goal.find({
      user: userId,
      status: 'active',
      targetDate: { $lt: new Date() }
    }).sort({ targetDate: 1 });

    // Get goals with progress updates needed
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const needsUpdateGoals = await Goal.find({
      user: userId,
      status: 'active',
      $or: [
        { lastProgressUpdate: { $lt: sevenDaysAgo } },
        { lastProgressUpdate: { $exists: false } }
      ]
    }).sort({ lastProgressUpdate: 1 }).limit(3);

    // Calculate overall progress
    const allGoals = await Goal.find({ user: userId });
    const totalGoals = allGoals.length;
    const completedGoals = allGoals.filter(g => g.status === 'completed').length;
    const overallProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    res.json({
      success: true,
      data: {
        activeGoals,
        recentlyCompleted,
        overdueGoals,
        needsUpdateGoals,
        stats: {
          total: totalGoals,
          active: allGoals.filter(g => g.status === 'active').length,
          completed: completedGoals,
          overdue: overdueGoals.length,
          overallProgress
        }
      }
    });
  } catch (error) {
    console.error('Get goals dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching goals dashboard summary'
    });
  }
});

module.exports = router;
