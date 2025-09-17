import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { RootState, AppDispatch } from '../../store';
import {
  createGoal,
  updateGoal,
  selectGoalLoading,
  selectGoalErrors,
  clearGoalErrors
} from '../../store/slices/goalsSlice';

interface GoalFormProps {
  goal?: any; // Existing goal for editing
  onSuccess?: () => void;
  onCancel?: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({
  goal,
  onSuccess,
  onCancel
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => selectGoalLoading(state));
  const errors = useSelector((state: RootState) => selectGoalErrors(state));

  const [selectedType, setSelectedType] = useState(goal?.type || 'weight-loss');

  // Validation schema
  const validationSchema = Yup.object({
    type: Yup.string()
      .required('Goal type is required')
      .oneOf(['weight-loss', 'weight-gain', 'muscle-gain', 'fat-loss', 'strength', 'endurance', 'habit', 'custom']),
    title: Yup.string()
      .required('Goal title is required')
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be less than 100 characters'),
    description: Yup.string()
      .max(500, 'Description must be less than 500 characters'),
    priority: Yup.string()
      .required('Priority is required')
      .oneOf(['low', 'medium', 'high']),
    category: Yup.string()
      .oneOf(['fitness', 'nutrition', 'health', 'lifestyle', 'performance']),
    targetDate: Yup.date()
      .required('Target date is required')
      .min(new Date(), 'Target date must be in the future'),
    targetValue: Yup.number()
      .nullable()
      .min(0, 'Target value must be positive'),
    currentValue: Yup.number()
      .nullable()
      .min(0, 'Current value must be positive'),
    unit: Yup.string()
      .max(20, 'Unit must be less than 20 characters'),
    frequency: Yup.object({
      type: Yup.string()
        .nullable()
        .oneOf(['daily', 'weekly', 'monthly', 'once']),
      target: Yup.number()
        .nullable()
        .min(1, 'Frequency target must be at least 1')
    })
  });

  // Get goal type configuration
  const getGoalTypeConfig = (type: string) => {
    const configs = {
      'weight-loss': {
        defaultUnit: 'kg',
        requiresValue: true,
        category: 'fitness',
        description: 'Track weight loss progress'
      },
      'weight-gain': {
        defaultUnit: 'kg',
        requiresValue: true,
        category: 'fitness',
        description: 'Track weight gain progress'
      },
      'muscle-gain': {
        defaultUnit: 'kg',
        requiresValue: true,
        category: 'fitness',
        description: 'Track muscle mass increase'
      },
      'fat-loss': {
        defaultUnit: '%',
        requiresValue: true,
        category: 'fitness',
        description: 'Track body fat reduction'
      },
      'strength': {
        defaultUnit: 'kg',
        requiresValue: true,
        category: 'performance',
        description: 'Track strength improvements'
      },
      'endurance': {
        defaultUnit: 'min',
        requiresValue: true,
        category: 'performance',
        description: 'Track endurance improvements'
      },
      'habit': {
        defaultUnit: 'times',
        requiresValue: false,
        category: 'lifestyle',
        description: 'Build healthy habits'
      },
      'custom': {
        defaultUnit: '',
        requiresValue: false,
        category: 'lifestyle',
        description: 'Custom goal tracking'
      }
    };
    return configs[type] || configs.custom;
  };

  // Initial values
  const goalConfig = getGoalTypeConfig(selectedType);
  const initialValues = {
    type: goal?.type || 'weight-loss',
    title: goal?.title || '',
    description: goal?.description || '',
    priority: goal?.priority || 'medium',
    category: goal?.category || goalConfig.category,
    targetDate: goal?.targetDate 
      ? new Date(goal.targetDate).toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    targetValue: goal?.targetValue || '',
    currentValue: goal?.currentValue || 0,
    unit: goal?.unit || goalConfig.defaultUnit,
    frequency: {
      type: goal?.frequency?.type || 'once',
      target: goal?.frequency?.target || 1
    },
    notes: goal?.notes || ''
  };

  useEffect(() => {
    // Clear errors when component mounts
    dispatch(clearGoalErrors());
  }, [dispatch]);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      // Clean up values
      const cleanedValues = {
        ...values,
        targetValue: values.targetValue !== '' ? parseFloat(values.targetValue) : undefined,
        currentValue: values.currentValue !== '' ? parseFloat(values.currentValue) : undefined,
        unit: values.unit || undefined,
        description: values.description || undefined,
        notes: values.notes || undefined,
        frequency: values.frequency.type !== 'once' ? values.frequency : undefined,
        targetDate: new Date(values.targetDate).toISOString()
      };

      if (goal) {
        await dispatch(updateGoal({ id: goal._id, data: cleanedValues })).unwrap();
      } else {
        await dispatch(createGoal(cleanedValues)).unwrap();
      }

      onSuccess?.();
    } catch (error) {
      console.error('Failed to save goal:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {goal ? 'Edit Goal' : 'Create New Goal'}
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        )}
      </div>

      {errors.create && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.create}
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue, errors: formErrors }) => {
          const currentGoalConfig = getGoalTypeConfig(values.type);

          return (
            <Form className="space-y-6">
              {/* Goal Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Type *
                </label>
                <Field
                  as="select"
                  name="type"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const newType = e.target.value;
                    setFieldValue('type', newType);
                    setSelectedType(newType);
                    const newConfig = getGoalTypeConfig(newType);
                    setFieldValue('category', newConfig.category);
                    setFieldValue('unit', newConfig.defaultUnit);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="weight-loss">Weight Loss</option>
                  <option value="weight-gain">Weight Gain</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="fat-loss">Fat Loss</option>
                  <option value="strength">Strength Training</option>
                  <option value="endurance">Endurance</option>
                  <option value="habit">Habit Building</option>
                  <option value="custom">Custom Goal</option>
                </Field>
                <p className="mt-1 text-sm text-gray-500">{currentGoalConfig.description}</p>
                <ErrorMessage name="type" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              {/* Title and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Title *
                  </label>
                  <Field
                    name="title"
                    type="text"
                    placeholder="Enter your goal title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage name="title" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority *
                  </label>
                  <Field
                    as="select"
                    name="priority"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Field>
                  <ErrorMessage name="priority" component="div" className="text-red-600 text-sm mt-1" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Field
                  as="textarea"
                  name="description"
                  rows={3}
                  placeholder="Describe your goal in detail..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                />
                <ErrorMessage name="description" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              {/* Target Values and Date */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {currentGoalConfig.requiresValue && (
                  <>
                    <div>
                      <label htmlFor="targetValue" className="block text-sm font-medium text-gray-700 mb-1">
                        Target Value
                      </label>
                      <Field
                        name="targetValue"
                        type="number"
                        step="0.1"
                        placeholder="Target"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage name="targetValue" component="div" className="text-red-600 text-sm mt-1" />
                    </div>

                    <div>
                      <label htmlFor="currentValue" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Value
                      </label>
                      <Field
                        name="currentValue"
                        type="number"
                        step="0.1"
                        placeholder="Current"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage name="currentValue" component="div" className="text-red-600 text-sm mt-1" />
                    </div>

                    <div>
                      <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <Field
                        name="unit"
                        type="text"
                        placeholder="Unit"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <ErrorMessage name="unit" component="div" className="text-red-600 text-sm mt-1" />
                    </div>
                  </>
                )}

                <div className={currentGoalConfig.requiresValue ? '' : 'md:col-span-2'}>
                  <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Date *
                  </label>
                  <Field
                    name="targetDate"
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage name="targetDate" component="div" className="text-red-600 text-sm mt-1" />
                </div>
              </div>

              {/* Frequency (for habit goals) */}
              {values.type === 'habit' && (
                <div className="border-l-4 border-green-500 pl-4 space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Frequency Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="frequency.type" className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency Type
                      </label>
                      <Field
                        as="select"
                        name="frequency.type"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="once">One-time Goal</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </Field>
                      <ErrorMessage name="frequency.type" component="div" className="text-red-600 text-sm mt-1" />
                    </div>

                    {values.frequency.type !== 'once' && (
                      <div>
                        <label htmlFor="frequency.target" className="block text-sm font-medium text-gray-700 mb-1">
                          Target per {values.frequency.type?.replace('ly', '') || 'period'}
                        </label>
                        <Field
                          name="frequency.target"
                          type="number"
                          min="1"
                          placeholder="How many times"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <ErrorMessage name="frequency.target" component="div" className="text-red-600 text-sm mt-1" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <Field
                    as="select"
                    name="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="fitness">Fitness</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="health">Health</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="performance">Performance</option>
                  </Field>
                  <ErrorMessage name="category" component="div" className="text-red-600 text-sm mt-1" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <Field
                  as="textarea"
                  name="notes"
                  rows={3}
                  placeholder="Any additional notes about this goal..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                />
                <ErrorMessage name="notes" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || loading.create || loading.update}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    goal ? 'Update Goal' : 'Create Goal'
                  )}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default GoalForm;
