// Validation helpers. Each function returns an error message (a string)
// or an empty string "" when the value is valid

export function validateEmail(email) {
  if (!email.trim()) return "Email is required";
  // Simple pattern: text, then @, then text, a dot and more text, with no spaces
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email)) return "Enter a valid email address";
  return "";
}

export function validatePassword(password) {
    if (!password.trim()) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return "";
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return "";
}

// Generic rule: the value must not be empty. fieldName is used in the message.
export function validateRequired(value, fieldName) {
  if (!value.trim()) return `${fieldName} is required`;
  return "";
}

// Date of birth is optional, but if present it cannot be in the future.
// value is a Date object, or undefined when nothing is chosen.
export function validateBirthDate(value) {
  if (!value) return "";
  if (value > new Date()) return "Date of birth cannot be in the future";
  return "";
}