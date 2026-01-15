import React from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Button } from '../common/Button';
import VoiceGuidedNavigation from './VoiceGuidedNavigation';

const AccessibilityControls = () => {
  const {
    fontSize,
    highContrast,
    screenReaderFriendly,
    reduceMotion,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleScreenReaderFriendly,
    toggleReduceMotion
  } = useAccessibility();

  return (
    <div className="accessibility-controls space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={decreaseFontSize}
          aria-label="Decrease font size"
        >
          A-
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={increaseFontSize}
          aria-label="Increase font size"
        >
          A+
        </Button>
      </div>

      <div className="space-y-2">
        <Button
          size="sm"
          variant={highContrast ? "primary" : "outline"}
          onClick={toggleHighContrast}
          fullWidth
        >
          High Contrast
        </Button>

        <Button
          size="sm"
          variant={reduceMotion ? "primary" : "outline"}
          onClick={toggleReduceMotion}
          fullWidth
        >
          Reduce Motion
        </Button>

        <Button
          size="sm"
          variant={screenReaderFriendly ? "primary" : "outline"}
          onClick={toggleScreenReaderFriendly}
          fullWidth
        >
          Screen Reader Friendly
        </Button>
      </div>
      
      <div className="pt-2 border-t border-gray-200">
        <VoiceGuidedNavigation />
      </div>
    </div>
  );
};

export default AccessibilityControls;