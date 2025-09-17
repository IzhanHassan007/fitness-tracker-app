const mongoose = require('mongoose');

// Food item schema for individual food items
const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true,
    maxlength: [100, 'Food name cannot exceed 100 characters']
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  category: {
    type: String,
    enum: [
      'grains', 'vegetables', 'fruits', 'protein', 'dairy', 'fats', 'oils',
      'nuts', 'seeds', 'legumes', 'beverages', 'snacks', 'sweets', 'fast-food',
      'supplements', 'condiments', 'spices', 'other'
    ],
    default: 'other'
  },
  quantity: {
    value: {
      type: Number,
      required: [true, 'Quantity value is required'],
      min: [0, 'Quantity cannot be negative']
    },
    unit: {
      type: String,
      enum: [
        'g', 'kg', 'oz', 'lb', 'ml', 'l', 'fl oz', 'cup', 'tbsp', 'tsp',
        'piece', 'slice', 'serving', 'small', 'medium', 'large', 'whole'
      ],
      required: [true, 'Quantity unit is required']
    }
  },
  calories: {
    total: {
      type: Number,
      required: [true, 'Total calories is required'],
      min: [0, 'Calories cannot be negative']
    },
    per100g: {
      type: Number,
      min: [0, 'Calories per 100g cannot be negative']
    }
  },
  macronutrients: {
    protein: {
      type: Number,
      required: [true, 'Protein content is required'],
      min: [0, 'Protein cannot be negative']
    },
    carbohydrates: {
      type: Number,
      required: [true, 'Carbohydrates content is required'],
      min: [0, 'Carbohydrates cannot be negative']
    },
    fiber: {
      type: Number,
      min: [0, 'Fiber cannot be negative'],
      default: 0
    },
    sugar: {
      type: Number,
      min: [0, 'Sugar cannot be negative'],
      default: 0
    },
    fat: {
      total: {
        type: Number,
        required: [true, 'Total fat content is required'],
        min: [0, 'Fat cannot be negative']
      },
      saturated: {
        type: Number,
        min: [0, 'Saturated fat cannot be negative'],
        default: 0
      },
      unsaturated: {
        type: Number,
        min: [0, 'Unsaturated fat cannot be negative'],
        default: 0
      },
      trans: {
        type: Number,
        min: [0, 'Trans fat cannot be negative'],
        default: 0
      }
    }
  },
  micronutrients: {
    sodium: {
      type: Number,
      min: [0, 'Sodium cannot be negative'],
      default: 0
    },
    cholesterol: {
      type: Number,
      min: [0, 'Cholesterol cannot be negative'],
      default: 0
    },
    vitamins: [{
      name: {
        type: String,
        enum: [
          'vitamin-a', 'vitamin-c', 'vitamin-d', 'vitamin-e', 'vitamin-k',
          'vitamin-b1', 'vitamin-b2', 'vitamin-b3', 'vitamin-b6', 'vitamin-b12',
          'folate', 'biotin', 'pantothenic-acid'
        ]
      },
      amount: {
        type: Number,
        min: 0
      },
      unit: {
        type: String,
        enum: ['mg', 'μg', 'iu'],
        default: 'mg'
      }
    }],
    minerals: [{
      name: {
        type: String,
        enum: [
          'calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'zinc',
          'copper', 'manganese', 'selenium', 'chromium', 'iodine'
        ]
      },
      amount: {
        type: Number,
        min: 0
      },
      unit: {
        type: String,
        enum: ['mg', 'μg'],
        default: 'mg'
      }
    }]
  },
  notes: {
    type: String,
    maxlength: [500, 'Food notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Meal schema for grouping food items
const mealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout', 'other'],
    required: [true, 'Meal type is required']
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Meal name cannot exceed 100 characters']
  },
  foods: [foodItemSchema],
  mealTime: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    enum: ['home', 'restaurant', 'work', 'school', 'gym', 'other'],
    default: 'home'
  },
  mood: {
    before: {
      type: Number,
      min: 1,
      max: 10
    },
    after: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  hungerLevel: {
    before: {
      type: Number,
      min: 1,
      max: 10
    },
    after: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  satisfactionLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  waterIntake: {
    value: {
      type: Number,
      min: 0,
      default: 0
    },
    unit: {
      type: String,
      enum: ['ml', 'l', 'fl oz', 'cup'],
      default: 'ml'
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  recipe: {
    ingredients: [{
      name: String,
      quantity: String
    }],
    instructions: [{
      step: Number,
      description: String
    }],
    prepTime: Number, // in minutes
    cookTime: Number, // in minutes
    servings: Number
  },
  cost: {
    value: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  photos: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isRecipe: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Meal notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals for total nutrition values
mealSchema.virtual('totalCalories').get(function() {
  return this.foods?.reduce((total, food) => total + (food.calories?.total || 0), 0) || 0;
});

mealSchema.virtual('totalProtein').get(function() {
  return this.foods?.reduce((total, food) => total + (food.macronutrients?.protein || 0), 0) || 0;
});

mealSchema.virtual('totalCarbohydrates').get(function() {
  return this.foods?.reduce((total, food) => total + (food.macronutrients?.carbohydrates || 0), 0) || 0;
});

mealSchema.virtual('totalFat').get(function() {
  return this.foods?.reduce((total, food) => total + (food.macronutrients?.fat?.total || 0), 0) || 0;
});

mealSchema.virtual('totalFiber').get(function() {
  return this.foods?.reduce((total, food) => total + (food.macronutrients?.fiber || 0), 0) || 0;
});

mealSchema.virtual('totalSugar').get(function() {
  return this.foods?.reduce((total, food) => total + (food.macronutrients?.sugar || 0), 0) || 0;
});

mealSchema.virtual('totalSodium').get(function() {
  return this.foods?.reduce((total, food) => total + (food.micronutrients?.sodium || 0), 0) || 0;
});

// Daily nutrition summary schema
const dailyNutritionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  meals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal'
  }],
  waterIntake: {
    total: {
      type: Number,
      min: 0,
      default: 0
    },
    unit: {
      type: String,
      enum: ['ml', 'l', 'fl oz', 'cup'],
      default: 'ml'
    },
    goal: {
      type: Number,
      min: 0
    }
  },
  goals: {
    calories: {
      type: Number,
      min: 0
    },
    protein: {
      type: Number,
      min: 0
    },
    carbohydrates: {
      type: Number,
      min: 0
    },
    fat: {
      type: Number,
      min: 0
    },
    fiber: {
      type: Number,
      min: 0
    }
  },
  supplements: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      value: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        enum: ['mg', 'g', 'ml', 'capsule', 'tablet', 'scoop'],
        required: true
      }
    },
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'before-workout', 'after-workout', 'before-meal', 'after-meal'],
      default: 'morning'
    },
    taken: {
      type: Boolean,
      default: false
    },
    notes: String
  }],
  bodyWeight: {
    value: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  symptoms: [{
    type: String,
    enum: [
      'bloating', 'nausea', 'headache', 'fatigue', 'energy-boost', 'good-mood',
      'digestive-issues', 'allergic-reaction', 'increased-focus', 'better-sleep', 'other'
    ]
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Daily notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for user and date
dailyNutritionSchema.index({ user: 1, date: 1 }, { unique: true });

// Virtual for goal achievement percentages
dailyNutritionSchema.virtual('goalProgress').get(function() {
  const meals = this.populated('meals') || [];
  const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.totalProtein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.totalCarbohydrates, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.totalFat, 0);
  const totalFiber = meals.reduce((sum, meal) => sum + meal.totalFiber, 0);

  return {
    calories: this.goals?.calories ? Math.round((totalCalories / this.goals.calories) * 100) : 0,
    protein: this.goals?.protein ? Math.round((totalProtein / this.goals.protein) * 100) : 0,
    carbohydrates: this.goals?.carbohydrates ? Math.round((totalCarbs / this.goals.carbohydrates) * 100) : 0,
    fat: this.goals?.fat ? Math.round((totalFat / this.goals.fat) * 100) : 0,
    fiber: this.goals?.fiber ? Math.round((totalFiber / this.goals.fiber) * 100) : 0,
    water: this.waterIntake?.goal ? Math.round((this.waterIntake.total / this.waterIntake.goal) * 100) : 0
  };
});

// Index for efficient queries
mealSchema.index({ user: 1, mealTime: -1 });
mealSchema.index({ user: 1, type: 1 });
mealSchema.index({ isPublic: 1, isRecipe: 1 });
mealSchema.index({ tags: 1 });

// Static methods for nutrition stats
mealSchema.statics.getNutritionStats = async function(userId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        mealTime: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalMeals: { $sum: 1 },
        averageCalories: { $avg: '$totalCalories' },
        averageProtein: { $avg: '$totalProtein' },
        averageCarbs: { $avg: '$totalCarbohydrates' },
        averageFat: { $avg: '$totalFat' },
        mealTypes: { $addToSet: '$type' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalMeals: 0,
    averageCalories: 0,
    averageProtein: 0,
    averageCarbs: 0,
    averageFat: 0,
    mealTypes: []
  };
};

// Instance methods
mealSchema.methods.calculateMacroRatio = function() {
  const totalCalories = this.totalCalories;
  if (totalCalories === 0) return { protein: 0, carbohydrates: 0, fat: 0 };

  const proteinCalories = this.totalProtein * 4;
  const carbCalories = this.totalCarbohydrates * 4;
  const fatCalories = this.totalFat * 9;

  return {
    protein: Math.round((proteinCalories / totalCalories) * 100),
    carbohydrates: Math.round((carbCalories / totalCalories) * 100),
    fat: Math.round((fatCalories / totalCalories) * 100)
  };
};

// Create models
const Meal = mongoose.model('Meal', mealSchema);
const DailyNutrition = mongoose.model('DailyNutrition', dailyNutritionSchema);

module.exports = { Meal, DailyNutrition };
