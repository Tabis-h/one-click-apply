// Validation utilities for profile forms

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateProfileForm = (formData) => {
  const errors = {};

  if (!validateRequired(formData.firstName)) {
    errors.firstName = 'First name is required';
  }

  if (!validateRequired(formData.lastName)) {
    errors.lastName = 'Last name is required';
  }

  if (!validateRequired(formData.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (formData.phone && !validatePhone(formData.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (formData.linkedin && !validateURL(formData.linkedin)) {
    errors.linkedin = 'Please enter a valid LinkedIn URL';
  }

  if (formData.github && !validateURL(formData.github)) {
    errors.github = 'Please enter a valid GitHub URL';
  }

  if (formData.website && !validateURL(formData.website)) {
    errors.website = 'Please enter a valid website URL';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateExperienceForm = (formData) => {
  const errors = {};

  if (!validateRequired(formData.company)) {
    errors.company = 'Company name is required';
  }

  if (!validateRequired(formData.position)) {
    errors.position = 'Position is required';
  }

  if (!validateRequired(formData.startDate)) {
    errors.startDate = 'Start date is required';
  }

  if (!formData.current && !validateRequired(formData.endDate)) {
    errors.endDate = 'End date is required if not current position';
  }

  if (formData.startDate && formData.endDate && !formData.current) {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (startDate >= endDate) {
      errors.endDate = 'End date must be after start date';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateFileUpload = (file, maxSizeInMB = 5, allowedTypes = ['pdf', 'doc', 'docx']) => {
  const errors = [];

  if (!file) {
    errors.push('Please select a file');
    return { isValid: false, errors };
  }

  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    errors.push(`File size must be less than ${maxSizeInMB}MB`);
  }

  // Check file type
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!allowedTypes.includes(fileExtension)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
