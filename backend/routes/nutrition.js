const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Meal, DailyNutrition } = require('../models/Nutrition');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules for meals
const mealValidation = [
  body('type')
    .isIn(['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout', 'other'])
    .withMessage('Invalid meal type'),
  body('foods')
    .isArray({ min: 1 })
    .withMessage('Meal must contain at least one food item'),
  body('foods.*.name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Food name must be between 1 and 100 characters'),
  body('foods.*.quantity.value')
    .isFloat({ min: 0 })
    .withMessage('Quantity value must be a positive number'),
  body('foods.*.quantity.unit')
    .isIn([
      'g', 'kg', 'oz', 'lb', 'ml', 'l', 'fl oz', 'cup', 'tbsp', 'tsp',
      'piece', 'slice', 'serving', 'small', 'medium', 'large', 'whole'
    ])
    .withMessage('Invalid quantity unit'),
  body('foods.*.calories.total')
    .isFloat({ min: 0 })
    .withMessage('Calories must be a positive number'),
  body('foods.*.macronutrients.protein')
    .isFloat({ min: 0 })
    .withMessage('Protein must be a positive number'),
  body('foods.*.macronutrients.carbohydrates')
    .isFloat({ min: 0 })
    .withMessage('Carbohydrates must be a positive number'),
  body('foods.*.macronutrients.fat.total')
    .isFloat({ min: 0 })
    .withMessage('Fat must be a positive number'),
];

const dailyNutritionValidation = [
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO8601 date'),
  body('goals.calories')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Calorie goal must be a positive number'),
  body('goals.protein')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Protein goal must be a positive number'),
  body('goals.carbohydrates')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Carbohydrates goal must be a positive number'),
  body('goals.fat')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fat goal must be a positive number'),
];

// @desc    Get all meals for user
// @route   GET /api/nutrition/meals
// @access  Private
router.get('/meals', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout', 'other']).withMessage('Invalid meal type'),
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
      startDate,
      endDate,
      search
    } = req.query;

    // Build filter object
    const filter = { user: req.user.id };
    
    if (type) filter.type = type;
    
    if (startDate || endDate) {
      filter.mealTime = {};
      if (startDate) filter.mealTime.$gte = new Date(startDate);
      if (endDate) filter.mealTime.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'foods.name': { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get meals with pagination
    const meals = await Meal.find(filter)
      .sort({ mealTime: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('user', 'name avatar');

    // Get total count for pagination
    const total = await Meal.countDocuments(filter);

    res.json({
      success: true,
      data: meals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching meals'
    });
  }
});

// @desc    Get single meal
// @route   GET /api/nutrition/meals/:id
// @access  Private
router.get('/meals/:id', protect, async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('user', 'name avatar');

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    res.json({
      success: true,
      data: meal
    });
  } catch (error) {
    console.error('Get meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching meal'
    });
  }
});

// @desc    Create new meal
// @route   POST /api/nutrition/meals
// @access  Private
router.post('/meals', protect, mealValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const mealData = {
      ...req.body,
      user: req.user.id
    };

    const meal = new Meal(mealData);
    await meal.save();

    await meal.populate('user', 'name avatar');

    // Update daily nutrition summary
    const mealDate = new Date(meal.mealTime);
    const dateOnly = new Date(mealDate.getFullYear(), mealDate.getMonth(), mealDate.getDate());
    
    await DailyNutrition.findOneAndUpdate(
      { user: req.user.id, date: dateOnly },
      { $addToSet: { meals: meal._id } },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Meal created successfully',
      data: meal
    });
  } catch (error) {
    console.error('Create meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating meal'
    });
  }
});

// @desc    Update meal
// @route   PUT /api/nutrition/meals/:id
// @access  Private
router.put('/meals/:id', protect, mealValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    // Update meal fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        meal[key] = req.body[key];
      }
    });

    await meal.save();
    await meal.populate('user', 'name avatar');

    res.json({
      success: true,
      message: 'Meal updated successfully',
      data: meal
    });
  } catch (error) {
    console.error('Update meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating meal'
    });
  }
});

// @desc    Delete meal
// @route   DELETE /api/nutrition/meals/:id
// @access  Private
router.delete('/meals/:id', protect, async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    // Remove from daily nutrition
    const mealDate = new Date(meal.mealTime);
    const dateOnly = new Date(mealDate.getFullYear(), mealDate.getMonth(), mealDate.getDate());
    
    await DailyNutrition.findOneAndUpdate(
      { user: req.user.id, date: dateOnly },
      { $pull: { meals: meal._id } }
    );

    await Meal.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting meal'
    });
  }
});

// @desc    Get daily nutrition summary
// @route   GET /api/nutrition/daily/:date
// @access  Private
router.get('/daily/:date', protect, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const dailyNutrition = await DailyNutrition.findOne({
      user: req.user.id,
      date: dateOnly
    }).populate({
      path: 'meals',
      select: 'type name foods mealTime totalCalories totalProtein totalCarbohydrates totalFat totalFiber totalSugar totalSodium'
    });

    if (!dailyNutrition) {
      // Create empty daily nutrition if doesn't exist
      const newDaily = new DailyNutrition({
        user: req.user.id,
        date: dateOnly,
        meals: []
      });
      
      return res.json({
        success: true,
        data: newDaily
      });
    }

    res.json({
      success: true,
      data: dailyNutrition
    });
  } catch (error) {
    console.error('Get daily nutrition error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching daily nutrition'
    });
  }
});

// @desc    Update daily nutrition goals
// @route   PUT /api/nutrition/daily/:date/goals
// @access  Private
router.put('/daily/:date/goals', protect, dailyNutritionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const date = new Date(req.params.date);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const dailyNutrition = await DailyNutrition.findOneAndUpdate(
      { user: req.user.id, date: dateOnly },
      { 
        $set: { 
          goals: req.body.goals,
          waterIntake: req.body.waterIntake,
          supplements: req.body.supplements,
          bodyWeight: req.body.bodyWeight,
          symptoms: req.body.symptoms,
          notes: req.body.notes
        }
      },
      { upsert: true, new: true }
    ).populate('meals');

    res.json({
      success: true,
      message: 'Daily nutrition updated successfully',
      data: dailyNutrition
    });
  } catch (error) {
    console.error('Update daily nutrition error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating daily nutrition'
    });
  }
});

// @desc    Add water intake
// @route   POST /api/nutrition/daily/:date/water
// @access  Private
router.post('/daily/:date/water', protect, [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Water amount must be a positive number'),
  body('unit')
    .optional()
    .isIn(['ml', 'l', 'fl oz', 'cup'])
    .withMessage('Invalid water unit'),
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

    const date = new Date(req.params.date);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const { amount, unit = 'ml' } = req.body;

    // Convert to ml for consistent storage
    let amountInMl = amount;
    if (unit === 'l') amountInMl = amount * 1000;
    else if (unit === 'fl oz') amountInMl = amount * 29.5735;
    else if (unit === 'cup') amountInMl = amount * 236.588;

    const dailyNutrition = await DailyNutrition.findOneAndUpdate(
      { user: req.user.id, date: dateOnly },
      { 
        $inc: { 'waterIntake.total': amountInMl },
        $set: { 'waterIntake.unit': 'ml' }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Water intake added successfully',
      data: {
        totalWater: dailyNutrition.waterIntake.total,
        unit: dailyNutrition.waterIntake.unit
      }
    });
  } catch (error) {
    console.error('Add water intake error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding water intake'
    });
  }
});

// @desc    Get nutrition statistics
// @route   GET /api/nutrition/stats
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

    const stats = await Meal.getNutritionStats(req.user.id, start, end);

    // Get recent meals
    const recentMeals = await Meal.find({
      user: req.user.id
    })
    .sort({ mealTime: -1 })
    .limit(10)
    .select('name type mealTime totalCalories totalProtein totalCarbohydrates totalFat');

    // Get favorite foods (most logged)
    const favoriteFoods = await Meal.aggregate([
      { $match: { user: req.user.id, mealTime: { $gte: start, $lte: end } } },
      { $unwind: '$foods' },
      { 
        $group: { 
          _id: '$foods.name',
          count: { $sum: 1 },
          avgCalories: { $avg: '$foods.calories.total' },
          category: { $first: '$foods.category' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get daily averages
    const dailyAverages = await DailyNutrition.aggregate([
      { 
        $match: { 
          user: req.user.id,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'meals',
          localField: 'meals',
          foreignField: '_id',
          as: 'mealData'
        }
      },
      {
        $project: {
          date: 1,
          totalCalories: { $sum: '$mealData.totalCalories' },
          totalProtein: { $sum: '$mealData.totalProtein' },
          totalCarbs: { $sum: '$mealData.totalCarbohydrates' },
          totalFat: { $sum: '$mealData.totalFat' },
          waterIntake: '$waterIntake.total'
        }
      },
      {
        $group: {
          _id: null,
          avgCalories: { $avg: '$totalCalories' },
          avgProtein: { $avg: '$totalProtein' },
          avgCarbs: { $avg: '$totalCarbs' },
          avgFat: { $avg: '$totalFat' },
          avgWater: { $avg: '$waterIntake' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        recentMeals,
        favoriteFoods,
        dailyAverages: dailyAverages[0] || {
          avgCalories: 0,
          avgProtein: 0,
          avgCarbs: 0,
          avgFat: 0,
          avgWater: 0
        },
        dateRange: { start, end }
      }
    });
  } catch (error) {
    console.error('Get nutrition stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nutrition statistics'
    });
  }
});

// @desc    Get meal suggestions based on goals
// @route   GET /api/nutrition/suggestions
// @access  Private
router.get('/suggestions', protect, [
  query('mealType').optional().isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Invalid meal type'),
  query('calories').optional().isFloat({ min: 0 }).withMessage('Calories must be a positive number'),
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

    const { mealType, calories } = req.query;

    // Get user's popular meals for suggestions
    const suggestions = await Meal.find({
      user: req.user.id,
      ...(mealType && { type: mealType }),
      ...(calories && { 
        $expr: { 
          $and: [
            { $gte: ['$totalCalories', calories * 0.8] },
            { $lte: ['$totalCalories', calories * 1.2] }
          ]
        }
      })
    })
    .select('name type foods totalCalories totalProtein totalCarbohydrates totalFat')
    .sort({ createdAt: -1 })
    .limit(10);

    // Get public meal suggestions if user has few meals
    if (suggestions.length < 5) {
      const publicSuggestions = await Meal.find({
        isPublic: true,
        isRecipe: true,
        ...(mealType && { type: mealType }),
        ...(calories && { 
          $expr: { 
            $and: [
              { $gte: ['$totalCalories', calories * 0.8] },
              { $lte: ['$totalCalories', calories * 1.2] }
            ]
          }
        })
      })
      .select('name type foods totalCalories totalProtein totalCarbohydrates totalFat recipe.servings')
      .populate('user', 'name')
      .sort({ 'likes.length': -1 })
      .limit(10 - suggestions.length);

      suggestions.push(...publicSuggestions);
    }

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Get meal suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching meal suggestions'
    });
  }
});

// @desc    Get nutrition goals recommendations
// @route   GET /api/nutrition/goals/recommendations
// @access  Private
router.get('/goals/recommendations', protect, async (req, res) => {
  try {
    const user = req.user;
    
    // Calculate BMR using Mifflin-St Jeor equation
    let bmr = 0;
    if (user.gender && user.dateOfBirth && user.height?.value) {
      const age = new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();
      const weight = 70; // Default weight if not provided
      const height = user.height.unit === 'ft' ? user.height.value * 30.48 : user.height.value;
      
      if (user.gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
      } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      }
    }

    // Activity level multipliers
    const activityMultipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very-active': 1.9
    };

    const activityLevel = user.activityLevel || 'moderate';
    const tdee = bmr * activityMultipliers[activityLevel];

    // Macro distribution based on goals (default balanced)
    let calorieGoal = Math.round(tdee);
    let proteinRatio = 0.20;
    let carbRatio = 0.50;
    let fatRatio = 0.30;

    // Adjust based on fitness goals
    if (user.fitnessGoals?.includes('weight-loss')) {
      calorieGoal = Math.round(tdee - 500); // 500 calorie deficit
      proteinRatio = 0.25;
      carbRatio = 0.45;
      fatRatio = 0.30;
    } else if (user.fitnessGoals?.includes('muscle-gain')) {
      calorieGoal = Math.round(tdee + 300); // 300 calorie surplus
      proteinRatio = 0.30;
      carbRatio = 0.40;
      fatRatio = 0.30;
    }

    const recommendations = {
      calories: Math.max(calorieGoal, 1200), // Minimum 1200 calories
      protein: Math.round((calorieGoal * proteinRatio) / 4), // 4 calories per gram
      carbohydrates: Math.round((calorieGoal * carbRatio) / 4), // 4 calories per gram
      fat: Math.round((calorieGoal * fatRatio) / 9), // 9 calories per gram
      fiber: Math.round(calorieGoal / 100) + 10, // Rough fiber estimate
      water: user.gender === 'male' ? 3700 : 2700, // ml per day
      ratios: {
        protein: Math.round(proteinRatio * 100),
        carbohydrates: Math.round(carbRatio * 100),
        fat: Math.round(fatRatio * 100)
      },
      bmr: Math.round(bmr),
      tdee: Math.round(tdee)
    };

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get nutrition recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating nutrition recommendations'
    });
  }
});

module.exports = router;
