const mongoose = require('mongoose');

// Body measurements schema for comprehensive tracking
const bodyMeasurementsSchema = new mongoose.Schema({
  chest: {
    value: {
      type: Number,
      min: [10, 'Chest measurement must be at least 10 cm']
    },
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm'
    }
  },
  waist: {
    value: {
      type: Number,
      min: [10, 'Waist measurement must be at least 10 cm']
    },
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm'
    }
  },
  hips: {
    value: {
      type: Number,
      min: [10, 'Hip measurement must be at least 10 cm']
    },
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm'
    }
  },
  thigh: {
    left: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      }
    },
    right: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      }
    }
  },
  bicep: {
    left: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      }
    },
    right: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      }
    }
  },
  forearm: {
    left: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      }
    },
    right: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      }
    }
  },
  neck: {
    value: Number,
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm'
    }
  },
  calf: {
    left: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      }
    },
    right: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      }
    }
  }
}, {
  _id: false
});

// Main weight entry schema
const weightEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: {
    value: {
      type: Number,
      required: [true, 'Weight value is required'],
      min: [20, 'Weight must be at least 20 kg'],
      max: [500, 'Weight cannot exceed 500 kg']
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      required: [true, 'Weight unit is required'],
      default: 'kg'
    }
  },
  bodyFat: {
    percentage: {
      type: Number,
      min: [3, 'Body fat percentage must be at least 3%'],
      max: [60, 'Body fat percentage cannot exceed 60%']
    },
    method: {
      type: String,
      enum: ['dexa', 'bod-pod', 'hydrostatic', 'bioelectrical', 'calipers', 'visual-estimate', 'other'],
      default: 'visual-estimate'
    }
  },
  muscleMass: {
    value: {
      type: Number,
      min: [10, 'Muscle mass must be at least 10 kg']
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  boneMass: {
    value: {
      type: Number,
      min: [1, 'Bone mass must be at least 1 kg']
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  waterPercentage: {
    type: Number,
    min: [30, 'Water percentage must be at least 30%'],
    max: [85, 'Water percentage cannot exceed 85%']
  },
  visceralFat: {
    rating: {
      type: Number,
      min: [1, 'Visceral fat rating must be at least 1'],
      max: [30, 'Visceral fat rating cannot exceed 30']
    }
  },
  metabolicAge: {
    type: Number,
    min: [10, 'Metabolic age must be at least 10'],
    max: [100, 'Metabolic age cannot exceed 100']
  },
  bodyMeasurements: bodyMeasurementsSchema,
  measuredAt: {
    type: Date,
    default: Date.now
  },
  timeOfDay: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'before-workout', 'after-workout', 'before-meal', 'after-meal'],
    default: 'morning'
  },
  conditions: {
    hydrationLevel: {
      type: String,
      enum: ['dehydrated', 'normal', 'well-hydrated', 'over-hydrated'],
      default: 'normal'
    },
    sleepQuality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      default: 'good'
    },
    stressLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    menstrualCycle: {
      phase: {
        type: String,
        enum: ['menstrual', 'follicular', 'ovulation', 'luteal', 'not-applicable'],
        default: 'not-applicable'
      }
    }
  },
  equipment: {
    scale: {
      type: String,
      enum: ['digital', 'analog', 'smart-scale', 'gym-scale', 'medical-scale', 'other'],
      default: 'digital'
    },
    calibrated: {
      type: Boolean,
      default: false
    }
  },
  photos: [{
    url: String,
    angle: {
      type: String,
      enum: ['front', 'side', 'back', 'progress-comparison'],
      required: true
    },
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  mood: {
    type: Number,
    min: 1,
    max: 10
  },
  energyLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for BMI calculation
weightEntrySchema.virtual('bmi').get(function() {
  if (!this.populated('user') && !this.user?.height?.value) return null;
  
  const weight = this.weight.unit === 'lbs' ? this.weight.value * 0.453592 : this.weight.value;
  const height = this.user.height.unit === 'ft' ? this.user.height.value * 0.3048 : this.user.height.value / 100;
  
  if (height && weight) {
    return Math.round((weight / (height * height)) * 10) / 10;
  }
  return null;
});

// Virtual for BMI category
weightEntrySchema.virtual('bmiCategory').get(function() {
  const bmi = this.bmi;
  if (!bmi) return null;
  
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
});

// Virtual for lean body mass calculation
weightEntrySchema.virtual('leanBodyMass').get(function() {
  if (!this.bodyFat?.percentage) return null;
  
  const weight = this.weight.unit === 'lbs' ? this.weight.value * 0.453592 : this.weight.value;
  const leanMass = weight * (1 - (this.bodyFat.percentage / 100));
  
  return {
    value: Math.round(leanMass * 10) / 10,
    unit: 'kg'
  };
});

// Virtual for body fat mass calculation
weightEntrySchema.virtual('bodyFatMass').get(function() {
  if (!this.bodyFat?.percentage) return null;
  
  const weight = this.weight.unit === 'lbs' ? this.weight.value * 0.453592 : this.weight.value;
  const fatMass = weight * (this.bodyFat.percentage / 100);
  
  return {
    value: Math.round(fatMass * 10) / 10,
    unit: 'kg'
  };
});

// Virtual for weight in preferred unit
weightEntrySchema.virtual('weightInPreferredUnit').get(function() {
  if (!this.user?.preferredWeightUnit) return this.weight;
  
  const preferredUnit = this.user.preferredWeightUnit;
  if (preferredUnit === this.weight.unit) return this.weight;
  
  let convertedValue = this.weight.value;
  if (this.weight.unit === 'kg' && preferredUnit === 'lbs') {
    convertedValue = this.weight.value * 2.20462;
  } else if (this.weight.unit === 'lbs' && preferredUnit === 'kg') {
    convertedValue = this.weight.value * 0.453592;
  }
  
  return {
    value: Math.round(convertedValue * 10) / 10,
    unit: preferredUnit
  };
});

// Indexes for efficient queries
weightEntrySchema.index({ user: 1, measuredAt: -1 });
weightEntrySchema.index({ user: 1, 'weight.value': 1 });
weightEntrySchema.index({ createdAt: -1 });
weightEntrySchema.index({ tags: 1 });
weightEntrySchema.index({ isPublic: 1 });

// Static methods for weight analytics
weightEntrySchema.statics.getWeightTrends = async function(userId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        measuredAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $sort: { measuredAt: 1 }
    },
    {
      $group: {
        _id: {
          year: { $year: '$measuredAt' },
          month: { $month: '$measuredAt' },
          day: { $dayOfMonth: '$measuredAt' }
        },
        avgWeight: { $avg: '$weight.value' },
        minWeight: { $min: '$weight.value' },
        maxWeight: { $max: '$weight.value' },
        avgBodyFat: { $avg: '$bodyFat.percentage' },
        avgMuscleMass: { $avg: '$muscleMass.value' },
        count: { $sum: 1 },
        date: { $first: '$measuredAt' }
      }
    },
    {
      $sort: { date: 1 }
    }
  ];

  const trends = await this.aggregate(pipeline);
  
  // Calculate weight change statistics
  if (trends.length > 1) {
    const firstEntry = trends[0];
    const lastEntry = trends[trends.length - 1];
    const totalChange = lastEntry.avgWeight - firstEntry.avgWeight;
    const timeSpan = (lastEntry.date - firstEntry.date) / (1000 * 60 * 60 * 24); // days
    const avgChangePerWeek = (totalChange / timeSpan) * 7;
    
    return {
      trends,
      statistics: {
        totalChange,
        avgChangePerWeek,
        timeSpan,
        currentWeight: lastEntry.avgWeight,
        startingWeight: firstEntry.avgWeight
      }
    };
  }
  
  return { trends, statistics: null };
};

weightEntrySchema.statics.getWeightStats = async function(userId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        measuredAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        avgWeight: { $avg: '$weight.value' },
        minWeight: { $min: '$weight.value' },
        maxWeight: { $max: '$weight.value' },
        avgBodyFat: { $avg: '$bodyFat.percentage' },
        avgMuscleMass: { $avg: '$muscleMass.value' },
        avgWaterPercentage: { $avg: '$waterPercentage' },
        firstEntry: { $min: '$measuredAt' },
        lastEntry: { $max: '$measuredAt' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalEntries: 0,
    avgWeight: 0,
    minWeight: 0,
    maxWeight: 0,
    avgBodyFat: 0,
    avgMuscleMass: 0,
    avgWaterPercentage: 0
  };
};

// Instance methods
weightEntrySchema.methods.calculateProgressMetrics = function(previousEntry) {
  if (!previousEntry) return null;
  
  const weightChange = this.weight.value - previousEntry.weight.value;
  const bodyFatChange = (this.bodyFat?.percentage || 0) - (previousEntry.bodyFat?.percentage || 0);
  const muscleMassChange = (this.muscleMass?.value || 0) - (previousEntry.muscleMass?.value || 0);
  
  const timeDiff = (this.measuredAt - previousEntry.measuredAt) / (1000 * 60 * 60 * 24); // days
  const weeklyWeightChange = timeDiff > 0 ? (weightChange / timeDiff) * 7 : 0;
  
  return {
    weightChange,
    bodyFatChange,
    muscleMassChange,
    weeklyWeightChange,
    daysBetween: Math.round(timeDiff),
    improvement: {
      weight: Math.abs(weightChange) > 0.1 ? (weightChange > 0 ? 'increased' : 'decreased') : 'stable',
      bodyFat: Math.abs(bodyFatChange) > 0.5 ? (bodyFatChange > 0 ? 'increased' : 'decreased') : 'stable',
      muscleMass: Math.abs(muscleMassChange) > 0.1 ? (muscleMassChange > 0 ? 'increased' : 'decreased') : 'stable'
    }
  };
};

module.exports = mongoose.model('WeightEntry', weightEntrySchema);
