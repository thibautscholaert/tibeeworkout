'use client';

import { useEffect, useRef } from 'react';
import { getWithTTL, setWithTTL } from './storage';

interface FormField {
  name: string;
  value: any;
  type: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio';
}

interface FormState {
  [formId: string]: {
    [fieldName: string]: any;
  };
}

const FORM_STATE_KEY = 'app_form_state';
const FORM_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Get form state for a specific form
export function getFormState(formId: string): Record<string, any> {
  const formStates = getWithTTL<FormState>(FORM_STATE_KEY) || {};
  return formStates[formId] || {};
}

// Save form state for a specific form
export function saveFormState(formId: string, fieldName: string, value: any): void {
  const formStates = getWithTTL<FormState>(FORM_STATE_KEY) || {};

  if (!formStates[formId]) {
    formStates[formId] = {};
  }

  formStates[formId][fieldName] = value;
  setWithTTL(FORM_STATE_KEY, formStates, FORM_TTL);
}

// Clear form state for a specific form
export function clearFormState(formId: string): void {
  const formStates = getWithTTL<FormState>(FORM_STATE_KEY) || {};
  delete formStates[formId];
  setWithTTL(FORM_STATE_KEY, formStates, FORM_TTL);
}

// Clear all form states
export function clearAllFormStates(): void {
  localStorage.removeItem(FORM_STATE_KEY);
}

// Hook to automatically persist form state
export function useFormPersistence(formId: string, defaultValues: Record<string, any> = {}) {
  const initializedRef = useRef(false);

  // Load form state on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const savedState = getFormState(formId);
    const mergedValues = { ...defaultValues, ...savedState };

    // Restore form values
    Object.entries(mergedValues).forEach(([fieldName, value]) => {
      const field = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (field) {
        if (field.type === 'checkbox' || field.type === 'radio') {
          (field as HTMLInputElement).checked = Boolean(value);
        } else {
          field.value = value || '';
        }

        // Trigger change event for React forms
        const event = new Event('input', { bubbles: true });
        field.dispatchEvent(event);
      }
    });
  }, [formId, defaultValues]);

  // Set up event listeners for form fields
  useEffect(() => {
    const handleFieldChange = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (!target.name) return;

      let value: any;
      if (target.type === 'checkbox' || target.type === 'radio') {
        value = (target as HTMLInputElement).checked;
      } else if (target.type === 'number') {
        value = target.value ? parseFloat(target.value) : 0;
      } else {
        value = target.value;
      }

      saveFormState(formId, target.name, value);
    };

    // Add event listeners to all form fields
    const formElements = document.querySelectorAll('input, textarea, select');
    formElements.forEach(element => {
      element.addEventListener('input', handleFieldChange);
      element.addEventListener('change', handleFieldChange);
    });

    return () => {
      formElements.forEach(element => {
        element.removeEventListener('input', handleFieldChange);
        element.removeEventListener('change', handleFieldChange);
      });
    };
  }, [formId]);

  return {
    clearForm: () => clearFormState(formId),
    getState: () => getFormState(formId),
    saveField: (fieldName: string, value: any) => saveFormState(formId, fieldName, value)
  };
}

// Hook for React Hook Form integration
export function useReactFormPersistence(formId: string, defaultValues: Record<string, any> = {}) {
  const initializedRef = useRef(false);

  // Load saved state on mount
  const loadSavedValues = () => {
    if (initializedRef.current) return getFormState(formId);
    initializedRef.current = true;

    const savedState = getFormState(formId);
    return { ...defaultValues, ...savedState };
  };

  // Function to save form values
  const saveFormValues = (values: Record<string, any>) => {
    Object.entries(values).forEach(([fieldName, value]) => {
      saveFormState(formId, fieldName, value);
    });
  };

  return {
    loadSavedValues,
    saveFormValues,
    clearForm: () => clearFormState(formId)
  };
}
