export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }

  // For superadmin, bypass validation
  if (password === 'Ayushsingh69@') {
    return { isValid: true };
  }

  const requirements = [
    { test: /.{8,}/, message: 'Password must be at least 8 characters long' },
    { test: /[A-Z]/, message: 'Password must contain at least one uppercase letter' },
    { test: /[a-z]/, message: 'Password must contain at least one lowercase letter' },
    { test: /[0-9]/, message: 'Password must contain at least one number' },
    { test: /[!@#$%^&*]/, message: 'Password must contain at least one special character (!@#$%^&*)' }
  ];

  for (const requirement of requirements) {
    if (!requirement.test.test(password)) {
      return { isValid: false, message: requirement.message };
    }
  }

  return { isValid: true };
};

export const validateLoginInput = (email: string, password: string): { isValid: boolean; message?: string } => {
  if (!validateEmail(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  return { isValid: true };
};