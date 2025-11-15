import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { RootState, AppDispatch } from '../../store';
import {
  createWeightEntry,
  updateWeightEntry,
  selectWeightLoading,
  selectWeightErrors,
  clearWeightErrors
} from '../../store/slices/weightSlice';

interface WeightEntryFormProps {
  entry?: any; // Existing entry for editing
  onSuccess?: () => void;
  onCancel?: () => void;
}

const WeightEntryForm: React.FC<WeightEntryFormProps> = ({
  entry,
  onSuccess,
  onCancel
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => selectWeightLoading(state));
  const errors = useSelector((state: RootState) => selectWeightErrors(state));

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Validation schema
  const validationSchema = Yup.object({
    weight: Yup.object({
      value: Yup.number()
        .required('Weight is required')
        .min(20, 'Weight must be at least 20')
        .max(500, 'Weight must be less than 500'),
      unit: Yup.string()
        .required('Weight unit is required')
        .oneOf(['kg', 'lbs'], 'Invalid weight unit')
    }),
    bodyFat: Yup.object({
      percentage: Yup.number()
        .nullable()
        .min(3, 'Body fat must be at least 3%')
        .max(60, 'Body fat must be less than 60%'),
      method: Yup.string()
        .nullable()
        .oneOf(['dexa', 'bod-pod', 'hydrostatic', 'bioelectrical', 'calipers', 'visual-estimate', 'other'])
    }),
    muscleMass: Yup.object({
      value: Yup.number()
        .nullable()
        .min(10, 'Muscle mass must be at least 10 kg'),
      unit: Yup.string().nullable().default('kg')
    }),
    waterPercentage: Yup.number()
      .nullable()
      .min(30, 'Water percentage must be at least 30%')
      .max(85, 'Water percentage must be less than 85%'),
    measuredAt: Yup.date().required('Date is required'),
    timeOfDay: Yup.string()
      .nullable()
      .oneOf(['morning', 'afternoon', 'evening', 'before-workout', 'after-workout', 'before-meal', 'after-meal']),
    notes: Yup.string().max(500, 'Notes must be less than 500 characters')
  });

  // Initial values
  const initialValues = {
    weight: {
      value: entry?.weight?.value || '',
      unit: entry?.weight?.unit || 'kg'
    },
    bodyFat: {
      percentage: entry?.bodyFat?.percentage || '',
      method: entry?.bodyFat?.method || ''
    },
    muscleMass: {
      value: entry?.muscleMass?.value || '',
      unit: entry?.muscleMass?.unit || 'kg'
    },
    waterPercentage: entry?.waterPercentage || '',
    measuredAt: entry?.measuredAt 
      ? new Date(entry.measuredAt).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    timeOfDay: entry?.timeOfDay || 'morning',
    notes: entry?.notes || ''
  };

  useEffect(() => {
    // Clear errors when component mounts
    dispatch(clearWeightErrors());
  }, [dispatch]);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      // Clean up values - remove empty strings
      const cleanedValues = {
        ...values,
        bodyFat: {
          percentage: values.bodyFat.percentage !== '' ? parseFloat(values.bodyFat.percentage) : undefined,
          method: values.bodyFat.method || undefined
        },
        muscleMass: {
          value: values.muscleMass.value !== '' ? parseFloat(values.muscleMass.value) : undefined,
          unit: values.muscleMass.unit || undefined
        },
        waterPercentage: values.waterPercentage !== '' ? parseFloat(values.waterPercentage) : undefined,
        timeOfDay: values.timeOfDay || undefined,
        notes: values.notes || undefined,
        measuredAt: new Date(values.measuredAt).toISOString()
      };

      if (entry) {
        await dispatch(updateWeightEntry({ id: entry._id, data: cleanedValues })).unwrap();
      } else {
        await dispatch(createWeightEntry(cleanedValues)).unwrap();
      }

      onSuccess?.();
    } catch (error) {
      console.error('Failed to save weight entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {entry ? 'Edit Weight Entry' : 'Add Weight Entry'}
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
        {({ isSubmitting, values, setFieldValue, handleSubmit, errors }) => (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Weight Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="weight.value" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight *
                </label>
                <Field
                  name="weight.value"
                  type="number"
                  step="0.1"
                  placeholder="Enter weight"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors?.weight && (errors as any)?.weight?.value && (
                  <div className="text-red-600 text-sm mt-1">{String((errors as any).weight.value)}</div>
                )}
              </div>

              <div>
                <label htmlFor="weight.unit" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <Field
                  as="select"
                  name="weight.unit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lbs">Pounds (lbs)</option>
                </Field>
                {errors?.weight && (errors as any)?.weight?.unit && (
                  <div className="text-red-600 text-sm mt-1">{String((errors as any).weight.unit)}</div>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="measuredAt" className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <Field
                  name="measuredAt"
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors?.measuredAt && (
                  <div className="text-red-600 text-sm mt-1">{String(errors.measuredAt)}</div>
                )}
              </div>

              <div>
                <label htmlFor="timeOfDay" className="block text-sm font-medium text-gray-700 mb-1">
                  Time of Day
                </label>
                <Field
                  as="select"
                  name="timeOfDay"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select time</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="before-workout">Before Workout</option>
                  <option value="after-workout">After Workout</option>
                  <option value="before-meal">Before Meal</option>
                  <option value="after-meal">After Meal</option>
                </Field>
                {errors?.timeOfDay && (
                  <div className="text-red-600 text-sm mt-1">{String(errors.timeOfDay)}</div>
                )}
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <span className="mr-1">
                  {showAdvanced ? '▼' : '▶'}
                </span>
                Advanced Body Composition
              </button>
            </div>

            {/* Advanced Body Composition */}
            {showAdvanced && (
              <div className="border-l-4 border-blue-500 pl-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bodyFat.percentage" className="block text-sm font-medium text-gray-700 mb-1">
                      Body Fat (%)
                    </label>
                    <Field
                      name="bodyFat.percentage"
                      type="number"
                      step="0.1"
                      placeholder="Body fat percentage"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {(errors as any)?.bodyFat?.percentage && (
                      <div className="text-red-600 text-sm mt-1">{String((errors as any).bodyFat.percentage)}</div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="bodyFat.method" className="block text-sm font-medium text-gray-700 mb-1">
                      Measurement Method
                    </label>
                    <Field
                      as="select"
                      name="bodyFat.method"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select method</option>
                      <option value="dexa">DEXA Scan</option>
                      <option value="bod-pod">Bod Pod</option>
                      <option value="hydrostatic">Hydrostatic Weighing</option>
                      <option value="bioelectrical">Bioelectrical Impedance</option>
                      <option value="calipers">Body Fat Calipers</option>
                      <option value="visual-estimate">Visual Estimate</option>
                      <option value="other">Other</option>
                    </Field>
                    {(errors as any)?.bodyFat?.method && (
                      <div className="text-red-600 text-sm mt-1">{String((errors as any).bodyFat.method)}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="muscleMass.value" className="block text-sm font-medium text-gray-700 mb-1">
                      Muscle Mass (kg)
                    </label>
                    <Field
                      name="muscleMass.value"
                      type="number"
                      step="0.1"
                      placeholder="Muscle mass"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {(errors as any)?.muscleMass?.value && (
                      <div className="text-red-600 text-sm mt-1">{String((errors as any).muscleMass.value)}</div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="waterPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                      Water Percentage (%)
                    </label>
                    <Field
                      name="waterPercentage"
                      type="number"
                      step="0.1"
                      placeholder="Water percentage"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors?.waterPercentage && (
                      <div className="text-red-600 text-sm mt-1">{String(errors.waterPercentage)}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <Field
                as="textarea"
                name="notes"
                rows={3}
                placeholder="Add any notes about this measurement..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              />
              {errors?.notes && (
                <div className="text-red-600 text-sm mt-1">{String(errors.notes)}</div>
              )}
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
                  entry ? 'Update Entry' : 'Add Entry'
                )}
              </button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default WeightEntryForm;
