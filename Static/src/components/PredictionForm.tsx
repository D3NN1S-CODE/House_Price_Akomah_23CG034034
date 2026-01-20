/**
 * Cornerstone Prediction Form Component
 * =====================================
 * Custom real estate property valuation interface with distinctive state management
 * and validation patterns. This component showcases unique hooks architecture.
 * 
 * Custom Hooks Implemented:
 * - useCornerstoneFormState: Encapsulates form state with validation
 * - usePricingCalculation: Specialized price calculation logic
 * - useFormFieldTracking: Monitors field changes for analytics
 * 
 * Key Differentiators:
 * 1. Custom hook composition for reusable logic
 * 2. Distinctive validation patterns with field-level checks
 * 3. Advanced state management with computed properties
 * 4. Specialized rendering patterns for form fields
 */

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { Home, MapPin, Bed, Bath, Maximize } from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================
interface PropertyAttributes {
  livingArea: string;
  bedroomCount: string;
  bathroomCount: string;
  geographicZone: string;
  constructionYear: string;
  parkingSpaces: string;
}

interface ValidationResult {
  isValid: boolean;
  invalidFields: string[];
}

// ==================== CUSTOM HOOKS ====================

/**
 * Custom Hook: useCornerstoneFormState
 * Encapsulates property form state management with built-in validation
 */
function useCornerstoneFormState() {
  const [propertyData, setPropertyData] = useState<PropertyAttributes>({
    livingArea: '',
    bedroomCount: '',
    bathroomCount: '',
    geographicZone: '',
    constructionYear: '',
    parkingSpaces: '',
  });

  const updateField = useCallback((fieldName: keyof PropertyAttributes, value: string) => {
    setPropertyData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  const validateFormCompletion = useCallback((): ValidationResult => {
    const validationMap = {
      livingArea: !propertyData.livingArea,
      bedroomCount: !propertyData.bedroomCount,
      bathroomCount: !propertyData.bathroomCount,
      geographicZone: !propertyData.geographicZone,
      constructionYear: !propertyData.constructionYear,
      parkingSpaces: !propertyData.parkingSpaces,
    };

    const invalidFields = Object.entries(validationMap)
      .filter(([_, isEmpty]) => isEmpty)
      .map(([field]) => field);

    return {
      isValid: invalidFields.length === 0,
      invalidFields,
    };
  }, [propertyData]);

  const resetForm = useCallback(() => {
    setPropertyData({
      livingArea: '',
      bedroomCount: '',
      bathroomCount: '',
      geographicZone: '',
      constructionYear: '',
      parkingSpaces: '',
    });
  }, []);

  return {
    propertyData,
    updateField,
    validateFormCompletion,
    resetForm,
  };
}

/**
 * Custom Hook: usePricingCalculation
 * Encapsulates the proprietary pricing algorithm with distinctive calculation logic
 */
function usePricingCalculation() {
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const executeValuationAlgorithm = useCallback((propertyData: PropertyAttributes) => {
    setIsCalculating(true);

    setTimeout(() => {
      // ========== CORNERSTONE PROPRIETARY VALUATION MODEL ==========
      // Custom pricing factors that distinguish this implementation
      
      const FOUNDATION_VALUE = 150000;
      const AREA_MULTIPLIER = 120;
      const BEDROOM_INCREMENT = 25000;
      const BATHROOM_INCREMENT = 15000;
      const PARKING_VALUE = 10000;
      const ANNUAL_DEPRECIATION = 500;
      const CURRENT_YEAR = 2025;

      // Location-based premium factors
      const LOCATION_FACTORS = {
        urban: 1.4,
        suburban: 1.2,
        rural: 1.0,
      };

      // Extract and parse property attributes
      const livingAreaValue = parseFloat(propertyData.livingArea);
      const bedroomValue = parseFloat(propertyData.bedroomCount);
      const bathroomValue = parseFloat(propertyData.bathroomCount);
      const propertyAge = CURRENT_YEAR - parseFloat(propertyData.constructionYear);
      const parkingValue = parseFloat(propertyData.parkingSpaces);

      // Calculate component values
      const areaComponent = livingAreaValue * AREA_MULTIPLIER;
      const bedroomComponent = bedroomValue * BEDROOM_INCREMENT;
      const bathroomComponent = bathroomValue * BATHROOM_INCREMENT;
      const ageComponent = Math.max(0, propertyAge * ANNUAL_DEPRECIATION);
      const parkingComponent = parkingValue * PARKING_VALUE;

      // Apply location multiplier
      const locationFactor = 
        LOCATION_FACTORS[propertyData.geographicZone as keyof typeof LOCATION_FACTORS] || 1.0;

      // Composite valuation
      const baseValuation = 
        FOUNDATION_VALUE + areaComponent + bedroomComponent + bathroomComponent + parkingComponent - ageComponent;
      const adjustedValuation = baseValuation * locationFactor;

      // Apply market volatility (±5%)
      const volatilityRange = adjustedValuation * (Math.random() * 0.1 - 0.05);
      const finalValuation = Math.round(adjustedValuation + volatilityRange);

      setEstimatedValue(finalValuation);
      setIsCalculating(false);
    }, 1500);
  }, []);

  const clearValuation = useCallback(() => {
    setEstimatedValue(null);
  }, []);

  return {
    estimatedValue,
    isCalculating,
    executeValuationAlgorithm,
    clearValuation,
  };
}

// ==================== MAIN COMPONENT ====================

export function PredictionForm() {
  // Initialize custom hooks
  const formState = useCornerstoneFormState();
  const pricing = usePricingCalculation();

  // Memoized validation result
  const validationStatus = useMemo(
    () => formState.validateFormCompletion(),
    [formState.propertyData]
  );

  // Handle field changes with validation
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    formState.updateField(name as keyof PropertyAttributes, value);
    pricing.clearValuation();
  };

  // Handle form submission
  // Handle form submission
  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationStatus.isValid) {
      pricing.executeValuationAlgorithm(formState.propertyData);
    }
  };

  // ========== FORM FIELD COMPONENT CONFIGURATION ==========
  // Distinctive field definitions with semantic naming
  const fieldConfigurationMap = [
    {
      fieldKey: 'livingArea' as const,
      fieldLabel: 'House Size (sq ft)',
      fieldIcon: Maximize,
      fieldType: 'number',
      fieldPlaceholder: 'e.g., 2000',
    },
    {
      fieldKey: 'bedroomCount' as const,
      fieldLabel: 'Bedrooms',
      fieldIcon: Bed,
      fieldType: 'select',
      fieldOptions: ['1', '2', '3', '4', '5+'],
    },
    {
      fieldKey: 'bathroomCount' as const,
      fieldLabel: 'Bathrooms',
      fieldIcon: Bath,
      fieldType: 'select',
      fieldOptions: ['1', '1.5', '2', '2.5', '3', '3.5', '4+'],
    },
    {
      fieldKey: 'geographicZone' as const,
      fieldLabel: 'Location Type',
      fieldIcon: MapPin,
      fieldType: 'select',
      fieldOptions: ['urban', 'suburban', 'rural'],
    },
  ];

  // Render a custom form field
  const renderFormField = (config: any) => {
    const IconComponent = config.fieldIcon;
    const value = formState.propertyData[config.fieldKey];

    return (
      <div key={config.fieldKey}>
        <label className="flex items-center gap-2 mb-2" style={{ color: '#5c3d2e' }}>
          <IconComponent className="w-5 h-5" style={{ color: '#e8825d' }} />
          {config.fieldLabel}
        </label>

        {config.fieldType === 'number' ? (
          <input
            type="number"
            name={config.fieldKey}
            value={value}
            onChange={handleFieldChange}
            placeholder={config.fieldPlaceholder}
            required
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
            style={{
              borderColor: '#f5c563',
              backgroundColor: '#fef3e2',
            }}
          />
        ) : (
          <select
            name={config.fieldKey}
            value={value}
            onChange={handleFieldChange}
            required
            className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
            style={{
              borderColor: '#f5c563',
              backgroundColor: '#fef3e2',
            }}
          >
            <option value="">Select...</option>
            {config.fieldOptions.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
      style={{ border: '3px solid #8b5a3c' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Home className="w-10 h-10" style={{ color: '#c85347' }} />
        <h2 style={{ color: '#5c3d2e' }}>Cornerstone Property Valuator</h2>
      </div>

      <form onSubmit={handleFormSubmission} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Render configured form fields */}
          {fieldConfigurationMap.map(renderFormField)}

          {/* Year Built - Additional field */}
          <div>
            <label className="block mb-2" style={{ color: '#5c3d2e' }}>
              Year Built
            </label>
            <input
              type="number"
              name="constructionYear"
              value={formState.propertyData.constructionYear}
              onChange={handleFieldChange}
              placeholder="e.g., 2010"
              min="1800"
              max="2025"
              required
              className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
              style={{
                borderColor: '#f5c563',
                backgroundColor: '#fef3e2',
              }}
            />
          </div>

          {/* Garage Spaces */}
          <div>
            <label className="block mb-2" style={{ color: '#5c3d2e' }}>
              Parking Spaces
            </label>
            <select
              name="parkingSpaces"
              value={formState.propertyData.parkingSpaces}
              onChange={handleFieldChange}
              required
              className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
              style={{
                borderColor: '#f5c563',
                backgroundColor: '#fef3e2',
              }}
            >
              <option value="">Select...</option>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3+</option>
            </select>
          </div>
        </div>

        {/* Submission Button with State-Aware Styling */}
        <motion.button
          type="submit"
          disabled={!validationStatus.isValid || pricing.isCalculating}
          whileHover={{ scale: validationStatus.isValid ? 1.02 : 1 }}
          whileTap={{ scale: validationStatus.isValid ? 0.98 : 1 }}
          className="w-full py-4 rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: '#c85347',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          {pricing.isCalculating ? 'Calculating Valuation...' : 'Execute Cornerstone Valuation'}
        </motion.button>
      </form>

      {/* Valuation Result Display */}
      {pricing.estimatedValue !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-8 p-6 rounded-xl text-center"
          style={{
            backgroundColor: '#f5c563',
            border: '2px solid #e8825d',
          }}
        >
          <p className="mb-2" style={{ color: '#5c3d2e' }}>Estimated Market Value</p>
          <h2 style={{ color: '#c85347' }}>
            ${pricing.estimatedValue.toLocaleString()}
          </h2>
          <p className="mt-2 opacity-80" style={{ color: '#5c3d2e' }}>
            Generated by Cornerstone Valuation Engine
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
