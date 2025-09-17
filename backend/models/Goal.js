const mongoose = require('mongoose');

// Milestone schema for tracking goal progress
const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Milestone title is required'],
    trim: true,
    maxlength: [100, 'Milestone title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Milestone description cannot exceed 500 characters']
  },
  targetValue: {
    type: Number,
    required: [true, 'Milestone target value is required']
  },
  currentValue: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Milestone unit is required']
  },
  targetDate: {
    type: Date
  },
  achievedDate: {
    type: Date
  },
  isAchieved: {
    type: Boolean,
    default: false
  },
  reward: {
    type: String,
    maxlength: [200, 'Reward description cannot exceed 200 characters']
  },
  notes: {
    type: String,
    maxlength: [500, 'Milestone notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Progress update schema for tracking goal updates
const progressUpdateSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: [true, 'Progress value is required']
  },
  unit: {
    type: String,
    required: [true, 'Progress unit is required']
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [500, 'Progress notes cannot exceed 500 characters']
  },
  mood: {
    type: Number,
    min: 1,
    max: 10
  },
  confidence: {
    type: Number,
    min: 1,
    max: 10
  },
  source: {
    type: String,
    enum: ['manual', 'workout', 'nutrition', 'weight', 'measurement', 'automatic'],
    default: 'manual'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'source'
  }
}, {
  timestamps: true
});

// Main goal schema
const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [100, 'Goal title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Goal description is required'],
    maxlength: [1000, 'Goal description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: [
      'weight-loss', 'weight-gain', 'muscle-gain', 'strength', 'endurance', 
      'flexibility', 'body-composition', 'nutrition', 'habit', 'performance', 
      'health', 'wellness', 'sport-specific', 'other'
    ],
    required: [true, 'Goal category is required']
  },
  type: {
    type: String,
    enum: ['target', 'habit', 'reduction', 'maintenance', 'challenge'],
    required: [true, 'Goal type is required'],
    default: 'target'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'abandoned', 'expired'],
    default: 'draft'
  },
  targetValue: {
    type: Number,
    required: [true, 'Target value is required']
  },
  currentValue: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Goal unit is required'],
    enum: [
      'kg', 'lbs', 'cm', 'in', '%', 'reps', 'sets', 'minutes', 'hours', 'days', 
      'weeks', 'calories', 'grams', 'liters', 'ml', 'times', 'points', 'level'
    ]
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: [true, 'Target date is required']
  },
  completedDate: {
    type: Date
  },
  timeframe: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
    default: 'monthly'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  visibility: {
    type: String,
    enum: ['private', 'friends', 'public'],
    default: 'private'
  },
  milestones: [milestoneSchema],
  progressUpdates: [progressUpdateSchema],
  trackingFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'as-needed'],
    default: 'weekly'
  },
  automaticTracking: {
    enabled: {
      type: Boolean,
      default: false
    },
    source: {
      type: String,
      enum: ['workouts', 'nutrition', 'weight', 'measurements']
    },
    metric: {
      type: String
    }
  },
  reminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'bi-weekly', 'monthly'],
      default: 'weekly'
    },
    time: {
      type: String, // HH:MM format
      default: '09:00'
    },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  },
  motivation: {
    why: {
      type: String,
      maxlength: [500, 'Motivation why cannot exceed 500 characters']
    },
    rewards: [{
      milestone: {
        type: Number // percentage of goal completion
      },
      reward: {
        type: String,
        maxlength: [200, 'Reward description cannot exceed 200 characters']
      }
    }],
    consequences: {
      type: String,
      maxlength: [500, 'Consequences description cannot exceed 500 characters']
    }
  },
  relatedGoals: [{
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal'
    },
    relationship: {
      type: String,
      enum: ['dependent', 'supporting', 'conflicting', 'related'],
      default: 'related'
    }
  }],
  obstacles: [{
    description: {
      type: String,
      required: true,
      maxlength: [300, 'Obstacle description cannot exceed 300 characters']
    },
    solution: {
      type: String,
      maxlength: [300, 'Solution description cannot exceed 300 characters']
    },
    encountered: {
      type: Boolean,
      default: false
    },
    overcomeDate: {
      type: Date
    }
  }],
  resources: [{
    type: {
      type: String,
      enum: ['article', 'video', 'book', 'app', 'website', 'person', 'equipment', 'other'],
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: [100, 'Resource title cannot exceed 100 characters']
    },
    url: {
      type: String
    },
    description: {
      type: String,
      maxlength: [300, 'Resource description cannot exceed 300 characters']
    },
    helpful: {
      type: Boolean,
      default: true
    }
  }],
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
  accountability: {
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    checkInFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'bi-weekly', 'monthly'],
      default: 'weekly'
    },
    lastCheckIn: {
      type: Date
    }
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for progress percentage
goalSchema.virtual('progressPercentage').get(function() {
  if (this.targetValue === 0) return 0;
  
  let progress = (this.currentValue / this.targetValue) * 100;
  
  // Handle reduction goals (e.g., weight loss)
  if (this.type === 'reduction') {
    const totalChange = Math.abs(this.targetValue);
    const currentChange = Math.abs(this.currentValue);
    progress = (currentChange / totalChange) * 100;
  }
  
  return Math.min(Math.max(progress, 0), 100);
});

// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
  if (!this.targetDate) return null;
  const now = new Date();
  const target = new Date(this.targetDate);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for days since start
goalSchema.virtual('daysSinceStart').get(function() {
  const now = new Date();
  const start = new Date(this.startDate);
  const diffTime = now - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 0);
});

// Virtual for total duration
goalSchema.virtual('totalDuration').get(function() {
  const start = new Date(this.startDate);
  const target = new Date(this.targetDate);
  const diffTime = target - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for time progress percentage
goalSchema.virtual('timeProgressPercentage').get(function() {
  const totalDays = this.totalDuration;
  const daysPassed = this.daysSinceStart;
  
  if (totalDays <= 0) return 0;
  return Math.min((daysPassed / totalDays) * 100, 100);
});

// Virtual for goal health status
goalSchema.virtual('healthStatus').get(function() {
  const timeProgress = this.timeProgressPercentage;
  const goalProgress = this.progressPercentage;
  
  if (this.status === 'completed') return 'completed';
  if (this.status === 'abandoned' || this.status === 'expired') return 'failed';
  
  // Behind schedule
  if (timeProgress > goalProgress + 20) return 'behind';
  // Ahead of schedule
  if (goalProgress > timeProgress + 20) return 'ahead';
  // On track
  if (Math.abs(timeProgress - goalProgress) <= 20) return 'on-track';
  // Slightly behind
  return 'caution';
});

// Virtual for next milestone
goalSchema.virtual('nextMilestone').get(function() {
  const unachievedMilestones = this.milestones
    .filter(m => !m.isAchieved)
    .sort((a, b) => a.targetValue - b.targetValue);
  
  return unachievedMilestones[0] || null;
});

// Virtual for recent progress updates
goalSchema.virtual('recentProgress').get(function() {
  return this.progressUpdates
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
});

// Indexes for efficient queries
goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ user: 1, category: 1 });
goalSchema.index({ user: 1, targetDate: 1 });
goalSchema.index({ status: 1, targetDate: 1 });
goalSchema.index({ tags: 1 });
goalSchema.index({ isTemplate: 1, visibility: 1 });
goalSchema.index({ createdAt: -1 });

// Static methods for goal analytics
goalSchema.statics.getGoalStats = async function(userId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalGoals: { $sum: 1 },
        activeGoals: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        completedGoals: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        abandonedGoals: {
          $sum: { $cond: [{ $eq: ['$status', 'abandoned'] }, 1, 0] }
        },
        avgProgressPercentage: {
          $avg: {
            $multiply: [
              { $divide: ['$currentValue', '$targetValue'] },
              100
            ]
          }
        },
        categoriesCount: {
          $addToSet: '$category'
        }
      }
    },
    {
      $addFields: {
        completionRate: {
          $multiply: [
            { $divide: ['$completedGoals', '$totalGoals'] },
            100
          ]
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    abandonedGoals: 0,
    avgProgressPercentage: 0,
    completionRate: 0,
    categoriesCount: []
  };
};

goalSchema.statics.getGoalsByCategory = async function(userId) {
  const pipeline = [
    {
      $match: {
        user: mongoose.Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        avgProgress: {
          $avg: {
            $multiply: [
              { $divide: ['$currentValue', '$targetValue'] },
              100
            ]
          }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ];

  return await this.aggregate(pipeline);
};

// Instance methods
goalSchema.methods.updateProgress = function(value, notes = '', source = 'manual', relatedId = null) {
  this.currentValue = value;
  
  // Add progress update
  this.progressUpdates.push({
    value,
    unit: this.unit,
    notes,
    source,
    relatedId
  });

  // Check if goal is completed
  if (this.progressPercentage >= 100 && this.status === 'active') {
    this.status = 'completed';
    this.completedDate = new Date();
  }

  // Check milestones
  this.milestones.forEach(milestone => {
    if (!milestone.isAchieved && value >= milestone.targetValue) {
      milestone.isAchieved = true;
      milestone.achievedDate = new Date();
    }
  });

  return this.save();
};

goalSchema.methods.addMilestone = function(milestoneData) {
  this.milestones.push(milestoneData);
  this.milestones.sort((a, b) => a.targetValue - b.targetValue);
  return this.save();
};

goalSchema.methods.generateRecommendations = function() {
  const recommendations = [];
  const progress = this.progressPercentage;
  const timeProgress = this.timeProgressPercentage;
  const daysRemaining = this.daysRemaining;

  // Progress-based recommendations
  if (progress < 25 && timeProgress > 50) {
    recommendations.push({
      type: 'warning',
      title: 'You\'re falling behind!',
      message: 'Consider breaking down your goal into smaller, more manageable steps.',
      action: 'Add milestones'
    });
  }

  if (progress > 75 && daysRemaining > 30) {
    recommendations.push({
      type: 'success',
      title: 'Great progress!',
      message: 'You\'re ahead of schedule. Consider setting a more challenging target.',
      action: 'Adjust target'
    });
  }

  // Frequency-based recommendations
  const lastUpdate = this.progressUpdates[this.progressUpdates.length - 1];
  if (lastUpdate) {
    const daysSinceUpdate = (new Date() - lastUpdate.date) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 14) {
      recommendations.push({
        type: 'reminder',
        title: 'Time for an update',
        message: `It's been ${Math.round(daysSinceUpdate)} days since your last progress update.`,
        action: 'Log progress'
      });
    }
  }

  return recommendations;
};

goalSchema.methods.calculateExpectedProgress = function() {
  const timeProgress = this.timeProgressPercentage / 100;
  const expectedValue = this.targetValue * timeProgress;
  const difference = this.currentValue - expectedValue;
  
  return {
    expected: expectedValue,
    actual: this.currentValue,
    difference,
    isAhead: difference > 0,
    percentageDifference: this.targetValue > 0 ? (difference / this.targetValue) * 100 : 0
  };
};

// Pre-save middleware
goalSchema.pre('save', function(next) {
  // Auto-set status based on dates and progress
  const now = new Date();
  
  if (this.status === 'active') {
    if (this.targetDate < now && this.progressPercentage < 100) {
      this.status = 'expired';
    } else if (this.progressPercentage >= 100) {
      this.status = 'completed';
      if (!this.completedDate) {
        this.completedDate = now;
      }
    }
  }
  
  // Sort progress updates by date
  this.progressUpdates.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  next();
});

module.exports = mongoose.model('Goal', goalSchema);
