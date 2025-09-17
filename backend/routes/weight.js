const express = require('express');
const { body, validationResult, query } = require('express-validator');
const WeightEntry = require('../models/Weight');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules for weight entries
const weightEntryValidation = [
  body('weight.value')
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight value must be between 20 and 500'),
  body('weight.unit')
    .isIn(['kg', 'lbs'])
    .withMessage('Weight unit must be kg or lbs'),
  body('bodyFat.percentage')
    .optional()
    .isFloat({ min: 3, max: 60 })
    .withMessage('Body fat percentage must be between 3% and 60%'),
  body('bodyFat.method')
    .optional()
    .isIn(['dexa', 'bod-pod', 'hydrostatic', 'bioelectrical', 'calipers', 'visual-estimate', 'other'])
    .withMessage('Invalid body fat measurement method'),
  body('muscleMass.value')
    .optional()
    .isFloat({ min: 10 })
    .withMessage('Muscle mass must be at least 10 kg'),
  body('waterPercentage')
    .optional()
    .isFloat({ min: 30, max: 85 })
    .withMessage('Water percentage must be between 30% and 85%'),
  body('measuredAt')
    .optional()
    .isISO8601()
    .withMessage('Measured at must be a valid date'),
  body('timeOfDay')
    .optional()
    .isIn(['morning', 'afternoon', 'evening', 'before-workout', 'after-workout', 'before-meal', 'after-meal'])
    .withMessage('Invalid time of day'),
];

// @desc    Get all weight entries for user
// @route   GET /api/weight
// @access  Private
router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO8601 date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO8601 date'),
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
      page = 1,
      limit = 50,
      startDate,
      endDate,
      sortBy = 'measuredAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { user: req.user.id };
    
    if (startDate || endDate) {
      filter.measuredAt = {};
      if (startDate) filter.measuredAt.$gte = new Date(startDate);
      if (endDate) filter.measuredAt.$lte = new Date(endDate);
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get weight entries with pagination
    const weightEntries = await WeightEntry.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('user', 'name height preferredWeightUnit');

    // Get total count for pagination
    const total = await WeightEntry.countDocuments(filter);

    res.json({
      success: true,
      data: weightEntries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get weight entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching weight entries'
    });
  }
});

// @desc    Get single weight entry
// @route   GET /api/weight/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const weightEntry = await WeightEntry.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('user', 'name height preferredWeightUnit');

    if (!weightEntry) {
      return res.status(404).json({
        success: false,
        message: 'Weight entry not found'
      });
    }

    res.json({
      success: true,
      data: weightEntry
    });
  } catch (error) {
    console.error('Get weight entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching weight entry'
    });
  }
});

// @desc    Create new weight entry
// @route   POST /api/weight
// @access  Private
router.post('/', protect, weightEntryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const weightEntryData = {
      ...req.body,
      user: req.user.id
    };

    const weightEntry = new WeightEntry(weightEntryData);
    await weightEntry.save();

    await weightEntry.populate('user', 'name height preferredWeightUnit');

    res.status(201).json({
      success: true,
      message: 'Weight entry created successfully',
      data: weightEntry
    });
  } catch (error) {
    console.error('Create weight entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating weight entry'
    });
  }
});

// @desc    Update weight entry
// @route   PUT /api/weight/:id
// @access  Private
router.put('/:id', protect, weightEntryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const weightEntry = await WeightEntry.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!weightEntry) {
      return res.status(404).json({
        success: false,
        message: 'Weight entry not found'
      });
    }

    // Update weight entry fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        weightEntry[key] = req.body[key];
      }
    });

    await weightEntry.save();
    await weightEntry.populate('user', 'name height preferredWeightUnit');

    res.json({
      success: true,
      message: 'Weight entry updated successfully',
      data: weightEntry
    });
  } catch (error) {
    console.error('Update weight entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating weight entry'
    });
  }
});

// @desc    Delete weight entry
// @route   DELETE /api/weight/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const weightEntry = await WeightEntry.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!weightEntry) {
      return res.status(404).json({
        success: false,
        message: 'Weight entry not found'
      });
    }

    await WeightEntry.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Weight entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete weight entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting weight entry'
    });
  }
});

// @desc    Get weight trends and analytics
// @route   GET /api/weight/trends
// @access  Private
router.get('/analytics/trends', protect, [
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO8601 date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO8601 date'),
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
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

    const { startDate, endDate, period = 'month' } = req.query;
    
    // Calculate date range based on period if not provided
    const end = endDate ? new Date(endDate) : new Date();
    let start = startDate ? new Date(startDate) : new Date();
    
    if (!startDate) {
      switch (period) {
        case 'week':
          start.setDate(start.getDate() - 7);
          break;
        case 'month':
          start.setMonth(start.getMonth() - 1);
          break;
        case 'quarter':
          start.setMonth(start.getMonth() - 3);
          break;
        case 'year':
          start.setFullYear(start.getFullYear() - 1);
          break;
      }
    }

    const trends = await WeightEntry.getWeightTrends(req.user.id, start, end);

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Get weight trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching weight trends'
    });
  }
});

// @desc    Get weight statistics
// @route   GET /api/weight/stats
// @access  Private
router.get('/analytics/stats', protect, [
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO8601 date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO8601 date'),
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

    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await WeightEntry.getWeightStats(req.user.id, start, end);

    // Get current and target weight from user profile or latest entry
    const latestEntry = await WeightEntry.findOne({
      user: req.user.id
    }).sort({ measuredAt: -1 }).limit(1);

    const currentWeight = latestEntry ? latestEntry.weight : null;

    // Get weight change over different periods
    const lastWeekEntry = await WeightEntry.findOne({
      user: req.user.id,
      measuredAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).sort({ measuredAt: 1 }).limit(1);

    const lastMonthEntry = await WeightEntry.findOne({
      user: req.user.id,
      measuredAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ measuredAt: 1 }).limit(1);

    const weightChanges = {
      lastWeek: lastWeekEntry && latestEntry ? 
        latestEntry.weight.value - lastWeekEntry.weight.value : null,
      lastMonth: lastMonthEntry && latestEntry ? 
        latestEntry.weight.value - lastMonthEntry.weight.value : null
    };

    // Calculate BMI trend if height is available
    let bmiTrend = null;
    if (req.user.height?.value) {
      const bmiEntries = await WeightEntry.find({
        user: req.user.id,
        measuredAt: { $gte: start, $lte: end }
      }).sort({ measuredAt: 1 }).limit(10).populate('user', 'height');

      bmiTrend = bmiEntries.map(entry => ({
        date: entry.measuredAt,
        bmi: entry.bmi,
        category: entry.bmiCategory
      }));
    }

    res.json({
      success: true,
      data: {
        ...stats,
        currentWeight,
        weightChanges,
        bmiTrend,
        dateRange: { start, end }
      }
    });
  } catch (error) {
    console.error('Get weight stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching weight statistics'
    });
  }
});

// @desc    Get progress comparison between two weight entries
// @route   GET /api/weight/compare/:id1/:id2
// @access  Private
router.get('/compare/:id1/:id2', protect, async (req, res) => {
  try {
    const [entry1, entry2] = await Promise.all([
      WeightEntry.findOne({ _id: req.params.id1, user: req.user.id }).populate('user', 'height'),
      WeightEntry.findOne({ _id: req.params.id2, user: req.user.id }).populate('user', 'height')
    ]);

    if (!entry1 || !entry2) {
      return res.status(404).json({
        success: false,
        message: 'One or both weight entries not found'
      });
    }

    // Calculate progress metrics
    const comparison = entry2.calculateProgressMetrics(entry1);

    res.json({
      success: true,
      data: {
        entry1: {
          id: entry1._id,
          weight: entry1.weight,
          bodyFat: entry1.bodyFat,
          muscleMass: entry1.muscleMass,
          measuredAt: entry1.measuredAt,
          bmi: entry1.bmi,
          bmiCategory: entry1.bmiCategory
        },
        entry2: {
          id: entry2._id,
          weight: entry2.weight,
          bodyFat: entry2.bodyFat,
          muscleMass: entry2.muscleMass,
          measuredAt: entry2.measuredAt,
          bmi: entry2.bmi,
          bmiCategory: entry2.bmiCategory
        },
        comparison
      }
    });
  } catch (error) {
    console.error('Weight comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while comparing weight entries'
    });
  }
});

// @desc    Get latest weight entry
// @route   GET /api/weight/latest
// @access  Private
router.get('/entry/latest', protect, async (req, res) => {
  try {
    const latestEntry = await WeightEntry.findOne({
      user: req.user.id
    })
    .sort({ measuredAt: -1 })
    .limit(1)
    .populate('user', 'name height preferredWeightUnit');

    if (!latestEntry) {
      return res.status(404).json({
        success: false,
        message: 'No weight entries found'
      });
    }

    // Get previous entry for comparison
    const previousEntry = await WeightEntry.findOne({
      user: req.user.id,
      measuredAt: { $lt: latestEntry.measuredAt }
    })
    .sort({ measuredAt: -1 })
    .limit(1);

    let comparison = null;
    if (previousEntry) {
      comparison = latestEntry.calculateProgressMetrics(previousEntry);
    }

    res.json({
      success: true,
      data: {
        entry: latestEntry,
        comparison
      }
    });
  } catch (error) {
    console.error('Get latest weight entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching latest weight entry'
    });
  }
});

// @desc    Bulk import weight entries
// @route   POST /api/weight/bulk-import
// @access  Private
router.post('/bulk-import', protect, [
  body('entries')
    .isArray({ min: 1 })
    .withMessage('Entries must be a non-empty array'),
  body('entries.*.weight.value')
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight value must be between 20 and 500'),
  body('entries.*.weight.unit')
    .isIn(['kg', 'lbs'])
    .withMessage('Weight unit must be kg or lbs'),
  body('entries.*.measuredAt')
    .isISO8601()
    .withMessage('Measured at must be a valid date'),
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

    const { entries } = req.body;

    // Add user ID to each entry
    const weightEntries = entries.map(entry => ({
      ...entry,
      user: req.user.id
    }));

    // Insert all entries
    const createdEntries = await WeightEntry.insertMany(weightEntries);

    res.status(201).json({
      success: true,
      message: `Successfully imported ${createdEntries.length} weight entries`,
      data: {
        imported: createdEntries.length,
        entries: createdEntries
      }
    });
  } catch (error) {
    console.error('Bulk import weight entries error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Some entries already exist for the specified dates'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while importing weight entries'
    });
  }
});

// @desc    Get weight summary for dashboard
// @route   GET /api/weight/summary
// @access  Private
router.get('/dashboard/summary', protect, async (req, res) => {
  try {
    // Get latest entry
    const latestEntry = await WeightEntry.findOne({
      user: req.user.id
    }).sort({ measuredAt: -1 }).limit(1).populate('user', 'height');

    // Get entry from 30 days ago for comparison
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthAgoEntry = await WeightEntry.findOne({
      user: req.user.id,
      measuredAt: { $lte: thirtyDaysAgo }
    }).sort({ measuredAt: -1 }).limit(1);

    // Get total entries count
    const totalEntries = await WeightEntry.countDocuments({ user: req.user.id });

    // Calculate summary metrics
    let summary = {
      totalEntries,
      latestWeight: null,
      weightChange30Days: null,
      currentBMI: null,
      bmiCategory: null,
      lastLoggedDays: null,
      consistency: {
        thisWeek: 0,
        thisMonth: 0,
        overall: 0
      }
    };

    if (latestEntry) {
      summary.latestWeight = latestEntry.weight;
      summary.currentBMI = latestEntry.bmi;
      summary.bmiCategory = latestEntry.bmiCategory;
      summary.lastLoggedDays = Math.floor((new Date() - latestEntry.measuredAt) / (1000 * 60 * 60 * 24));

      if (monthAgoEntry) {
        summary.weightChange30Days = latestEntry.weight.value - monthAgoEntry.weight.value;
      }
    }

    // Calculate consistency (frequency of logging)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [weekEntries, monthEntries] = await Promise.all([
      WeightEntry.countDocuments({
        user: req.user.id,
        measuredAt: { $gte: oneWeekAgo }
      }),
      WeightEntry.countDocuments({
        user: req.user.id,
        measuredAt: { $gte: oneMonthAgo }
      })
    ]);

    summary.consistency = {
      thisWeek: Math.min((weekEntries / 7) * 100, 100), // Max 1 entry per day
      thisMonth: Math.min((monthEntries / 30) * 100, 100),
      overall: totalEntries > 0 ? Math.min(totalEntries * 10, 100) : 0 // Rough calculation
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get weight summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching weight summary'
    });
  }
});

module.exports = router;
