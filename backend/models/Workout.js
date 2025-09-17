const mongoose = require('mongoose');

// Exercise schema for individual exercises within a workout
const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true,
    maxlength: [100, 'Exercise name cannot exceed 100 characters']
  },
  category: {
    type: String,
    enum: [
      'strength', 'cardio', 'flexibility', 'balance', 'sports', 
      'functional', 'plyometrics', 'bodyweight', 'weightlifting', 'other'
    ],
    default: 'other'
  },
  muscleGroups: [{
    type: String,
    enum: [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
      'core', 'abs', 'obliques', 'lower-back', 
      'quadriceps', 'hamstrings', 'calves', 'glutes',
      'full-body', 'cardio', 'other'
    ]
  }],
  sets: [{
    setNumber: {
      type: Number,
      required: true,
      min: 1
    },
    reps: {
      type: Number,
      min: 0
    },
    weight: {
      value: {
        type: Number,
        min: 0
      },
      unit: {
        type: String,
        enum: ['kg', 'lbs', 'bodyweight'],
        default: 'kg'
      }
    },
    duration: {
      value: {
        type: Number,
        min: 0
      },
      unit: {
        type: String,
        enum: ['seconds', 'minutes', 'hours'],
        default: 'seconds'
      }
    },
    distance: {
      value: {
        type: Number,
        min: 0
      },
      unit: {
        type: String,
        enum: ['m', 'km', 'ft', 'mi', 'yards'],
        default: 'km'
      }
    },
    restTime: {
      type: Number, // in seconds
      min: 0,
      default: 60
    },
    notes: {
      type: String,
      maxlength: [500, 'Set notes cannot exceed 500 characters']
    },
    completed: {
      type: Boolean,
      default: true
    }
  }],
  totalVolume: {
    type: Number,
    default: 0
  },
  personalRecord: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  notes: {
    type: String,
    maxlength: [1000, 'Exercise notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Main workout schema
const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Workout name is required'],
    trim: true,
    maxlength: [100, 'Workout name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Workout description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: [
      'strength', 'cardio', 'hiit', 'yoga', 'pilates', 'crossfit',
      'powerlifting', 'bodybuilding', 'endurance', 'flexibility',
      'sports', 'functional', 'circuit', 'other'
    ],
    default: 'other'
  },
  intensity: {
    type: String,
    enum: ['low', 'moderate', 'high', 'extreme'],
    default: 'moderate'
  },
  duration: {
    planned: {
      type: Number, // in minutes
      min: 0
    },
    actual: {
      type: Number, // in minutes
      min: 0
    }
  },
  exercises: [exerciseSchema],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  caloriesBurned: {
    type: Number,
    min: 0
  },
  location: {
    type: String,
    enum: ['gym', 'home', 'outdoor', 'studio', 'pool', 'track', 'other'],
    default: 'gym'
  },
  equipment: [{
    type: String,
    enum: [
      'barbell', 'dumbbell', 'kettlebell', 'resistance-band', 'cable-machine',
      'treadmill', 'stationary-bike', 'rowing-machine', 'elliptical',
      'pull-up-bar', 'yoga-mat', 'medicine-ball', 'foam-roller',
      'bodyweight', 'other', 'none'
    ]
  }],
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
  energyLevel: {
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
  weather: {
    condition: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'hot', 'cold', 'indoor'],
      default: 'indoor'
    },
    temperature: {
      value: Number,
      unit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      }
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateName: {
    type: String,
    maxlength: [100, 'Template name cannot exceed 100 characters']
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
  completionStatus: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'skipped'],
    default: 'planned'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Workout notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total workout duration in minutes
workoutSchema.virtual('totalDuration').get(function() {
  if (this.endTime && this.startTime) {
    return Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  return this.duration?.actual || 0;
});

// Virtual for total exercises count
workoutSchema.virtual('totalExercises').get(function() {
  return this.exercises?.length || 0;
});

// Virtual for total sets count
workoutSchema.virtual('totalSets').get(function() {
  return this.exercises?.reduce((total, exercise) => total + (exercise.sets?.length || 0), 0) || 0;
});

// Virtual for total volume (weight * reps across all exercises)
workoutSchema.virtual('totalVolume').get(function() {
  return this.exercises?.reduce((total, exercise) => {
    const exerciseVolume = exercise.sets?.reduce((setTotal, set) => {
      const weight = set.weight?.value || 0;
      const reps = set.reps || 0;
      return setTotal + (weight * reps);
    }, 0) || 0;
    return total + exerciseVolume;
  }, 0) || 0;
});

// Virtual for primary muscle groups worked
workoutSchema.virtual('primaryMuscleGroups').get(function() {
  const muscleGroups = new Set();
  this.exercises?.forEach(exercise => {
    exercise.muscleGroups?.forEach(group => muscleGroups.add(group));
  });
  return Array.from(muscleGroups);
});

// Pre-save middleware to calculate workout metrics
workoutSchema.pre('save', function(next) {
  // Calculate total volume for each exercise
  this.exercises?.forEach(exercise => {
    exercise.totalVolume = exercise.sets?.reduce((total, set) => {
      const weight = set.weight?.value || 0;
      const reps = set.reps || 0;
      return total + (weight * reps);
    }, 0) || 0;
  });

  // Set end time if workout is completed and no end time is set
  if (this.completionStatus === 'completed' && !this.endTime) {
    this.endTime = new Date();
  }

  // Calculate actual duration if not set
  if (this.endTime && this.startTime && !this.duration?.actual) {
    if (!this.duration) this.duration = {};
    this.duration.actual = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }

  next();
});

// Index for efficient queries
workoutSchema.index({ user: 1, createdAt: -1 });
workoutSchema.index({ user: 1, type: 1 });
workoutSchema.index({ user: 1, completionStatus: 1 });
workoutSchema.index({ isTemplate: 1, isPublic: 1 });
workoutSchema.index({ tags: 1 });

// Static methods
workoutSchema.statics.getWorkoutStats = async function(userId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        completionStatus: 'completed',
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalWorkouts: { $sum: 1 },
        totalDuration: { $sum: '$duration.actual' },
        totalCalories: { $sum: '$caloriesBurned' },
        averageIntensity: { $avg: { $switch: {
          branches: [
            { case: { $eq: ['$intensity', 'low'] }, then: 1 },
            { case: { $eq: ['$intensity', 'moderate'] }, then: 2 },
            { case: { $eq: ['$intensity', 'high'] }, then: 3 },
            { case: { $eq: ['$intensity', 'extreme'] }, then: 4 }
          ],
          default: 2
        }}},
        workoutTypes: { $addToSet: '$type' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalWorkouts: 0,
    totalDuration: 0,
    totalCalories: 0,
    averageIntensity: 0,
    workoutTypes: []
  };
};

// Instance methods
workoutSchema.methods.calculateCaloriesBurned = function(userWeight = 70) {
  // Simple calorie calculation based on workout type and duration
  const calorieRates = {
    'strength': 6, // calories per minute per kg
    'cardio': 8,
    'hiit': 10,
    'yoga': 3,
    'pilates': 4,
    'crossfit': 9,
    'powerlifting': 5,
    'bodybuilding': 6,
    'endurance': 7,
    'flexibility': 2,
    'sports': 8,
    'functional': 7,
    'circuit': 9,
    'other': 5
  };

  const rate = calorieRates[this.type] || 5;
  const duration = this.totalDuration || 0;
  return Math.round(rate * duration * (userWeight / 70));
};

module.exports = mongoose.model('Workout', workoutSchema);
