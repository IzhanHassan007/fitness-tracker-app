const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Workout = require('../models/Workout');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules for workouts
const workoutValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Workout name must be between 1 and 100 characters'),
  body('type')
    .optional()
    .isIn([
      'strength', 'cardio', 'hiit', 'yoga', 'pilates', 'crossfit',
      'powerlifting', 'bodybuilding', 'endurance', 'flexibility',
      'sports', 'functional', 'circuit', 'other'
    ])
    .withMessage('Invalid workout type'),
  body('intensity')
    .optional()
    .isIn(['low', 'moderate', 'high', 'extreme'])
    .withMessage('Invalid intensity level'),
  body('exercises')
    .optional()
    .isArray()
    .withMessage('Exercises must be an array'),
  body('exercises.*.name')
    .if(body('exercises').exists())
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Exercise name must be between 1 and 100 characters'),
  body('exercises.*.sets')
    .if(body('exercises').exists())
    .optional()
    .isArray()
    .withMessage('Exercise sets must be an array'),
];

const exerciseValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Exercise name must be between 1 and 100 characters'),
  body('category')
    .optional()
    .isIn([
      'strength', 'cardio', 'flexibility', 'balance', 'sports', 
      'functional', 'plyometrics', 'bodyweight', 'weightlifting', 'other'
    ])
    .withMessage('Invalid exercise category'),
  body('sets')
    .optional()
    .isArray()
    .withMessage('Sets must be an array'),
];

// @desc    Get all workouts for user
// @route   GET /api/workouts
// @access  Private
router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn([
    'strength', 'cardio', 'hiit', 'yoga', 'pilates', 'crossfit',
    'powerlifting', 'bodybuilding', 'endurance', 'flexibility',
    'sports', 'functional', 'circuit', 'other'
  ]).withMessage('Invalid workout type'),
  query('status').optional().isIn(['planned', 'in-progress', 'completed', 'skipped']).withMessage('Invalid status'),
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
      limit = 20,
      type,
      status,
      startDate,
      endDate,
      search
    } = req.query;

    // Build filter object
    const filter = { user: req.user.id };
    
    if (type) filter.type = type;
    if (status) filter.completionStatus = status;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get workouts with pagination
    const workouts = await Workout.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('user', 'name avatar');

    // Get total count for pagination
    const total = await Workout.countDocuments(filter);

    res.json({
      success: true,
      data: workouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching workouts'
    });
  }
});

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('user', 'name avatar');

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    res.json({
      success: true,
      data: workout
    });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching workout'
    });
  }
});

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private
router.post('/', protect, workoutValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const workoutData = {
      ...req.body,
      user: req.user.id
    };

    // Calculate calories burned if not provided
    if (!workoutData.caloriesBurned) {
      const workout = new Workout(workoutData);
      workoutData.caloriesBurned = workout.calculateCaloriesBurned(req.user.weight || 70);
    }

    const workout = new Workout(workoutData);
    await workout.save();

    await workout.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      data: workout
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating workout'
    });
  }
});

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
router.put('/:id', protect, workoutValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Update workout fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        workout[key] = req.body[key];
      }
    });

    await workout.save();
    await workout.populate('user', 'name avatar');

    res.json({
      success: true,
      message: 'Workout updated successfully',
      data: workout
    });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating workout'
    });
  }
});

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    await Workout.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting workout'
    });
  }
});

// @desc    Add exercise to workout
// @route   POST /api/workouts/:id/exercises
// @access  Private
router.post('/:id/exercises', protect, exerciseValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    workout.exercises.push(req.body);
    await workout.save();

    res.json({
      success: true,
      message: 'Exercise added successfully',
      data: workout
    });
  } catch (error) {
    console.error('Add exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding exercise'
    });
  }
});

// @desc    Update exercise in workout
// @route   PUT /api/workouts/:id/exercises/:exerciseId
// @access  Private
router.put('/:id/exercises/:exerciseId', protect, exerciseValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    const exercise = workout.exercises.id(req.params.exerciseId);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    // Update exercise fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        exercise[key] = req.body[key];
      }
    });

    await workout.save();

    res.json({
      success: true,
      message: 'Exercise updated successfully',
      data: workout
    });
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating exercise'
    });
  }
});

// @desc    Delete exercise from workout
// @route   DELETE /api/workouts/:id/exercises/:exerciseId
// @access  Private
router.delete('/:id/exercises/:exerciseId', protect, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    const exercise = workout.exercises.id(req.params.exerciseId);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    exercise.remove();
    await workout.save();

    res.json({
      success: true,
      message: 'Exercise deleted successfully',
      data: workout
    });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting exercise'
    });
  }
});

// @desc    Get workout statistics
// @route   GET /api/workouts/stats
// @access  Private
router.get('/stats/summary', protect, [
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
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await Workout.getWorkoutStats(req.user.id, start, end);

    // Get recent workouts
    const recentWorkouts = await Workout.find({
      user: req.user.id,
      completionStatus: 'completed'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name type duration.actual caloriesBurned createdAt');

    // Get personal records
    const personalRecords = await Workout.aggregate([
      { 
        $match: { 
          user: req.user.id,
          completionStatus: 'completed',
          'exercises.personalRecord': true
        }
      },
      { $unwind: '$exercises' },
      { 
        $match: { 
          'exercises.personalRecord': true 
        }
      },
      { 
        $sort: { 
          createdAt: -1 
        }
      },
      { 
        $limit: 10 
      },
      {
        $project: {
          exerciseName: '$exercises.name',
          maxWeight: { $max: '$exercises.sets.weight.value' },
          maxReps: { $max: '$exercises.sets.reps' },
          totalVolume: '$exercises.totalVolume',
          date: '$createdAt'
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        recentWorkouts,
        personalRecords,
        dateRange: { start, end }
      }
    });
  } catch (error) {
    console.error('Get workout stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching workout statistics'
    });
  }
});

// @desc    Start workout (set status to in-progress)
// @route   PATCH /api/workouts/:id/start
// @access  Private
router.patch('/:id/start', protect, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    workout.completionStatus = 'in-progress';
    workout.startTime = new Date();
    
    await workout.save();

    res.json({
      success: true,
      message: 'Workout started successfully',
      data: workout
    });
  } catch (error) {
    console.error('Start workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting workout'
    });
  }
});

// @desc    Complete workout
// @route   PATCH /api/workouts/:id/complete
// @access  Private
router.patch('/:id/complete', protect, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    workout.completionStatus = 'completed';
    workout.endTime = new Date();
    
    // Calculate calories if not already set
    if (!workout.caloriesBurned) {
      workout.caloriesBurned = workout.calculateCaloriesBurned(req.user.weight || 70);
    }

    await workout.save();

    res.json({
      success: true,
      message: 'Workout completed successfully',
      data: workout
    });
  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing workout'
    });
  }
});

// @desc    Get workout templates
// @route   GET /api/workouts/templates
// @access  Private
router.get('/templates/list', protect, async (req, res) => {
  try {
    const templates = await Workout.find({
      $or: [
        { user: req.user.id, isTemplate: true },
        { isTemplate: true, isPublic: true }
      ]
    })
    .select('name description type intensity duration exercises.name templateName')
    .populate('user', 'name')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching templates'
    });
  }
});

// @desc    Create workout from template
// @route   POST /api/workouts/templates/:templateId/create
// @access  Private
router.post('/templates/:templateId/create', protect, async (req, res) => {
  try {
    const template = await Workout.findOne({
      _id: req.params.templateId,
      $or: [
        { user: req.user.id, isTemplate: true },
        { isTemplate: true, isPublic: true }
      ]
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Create new workout from template
    const workoutData = template.toObject();
    delete workoutData._id;
    delete workoutData.createdAt;
    delete workoutData.updatedAt;
    delete workoutData.__v;
    
    workoutData.user = req.user.id;
    workoutData.isTemplate = false;
    workoutData.completionStatus = 'planned';
    workoutData.startTime = new Date();
    workoutData.name = req.body.name || `${template.name} - ${new Date().toLocaleDateString()}`;

    const workout = new Workout(workoutData);
    await workout.save();

    res.status(201).json({
      success: true,
      message: 'Workout created from template successfully',
      data: workout
    });
  } catch (error) {
    console.error('Create from template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating workout from template'
    });
  }
});

module.exports = router;
