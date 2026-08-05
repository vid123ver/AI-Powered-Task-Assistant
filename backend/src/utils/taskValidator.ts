const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 100;

interface ValidationResult {
  valid: boolean;
  message?: string;
  value?: string;
}

export const validateTitle = (title: unknown): ValidationResult => {
  if (title === undefined || title === null) {
    return { valid: false, message: "Title is required" };
  }

  if (typeof title !== "string") {
    return { valid: false, message: "Title must be a string" };
  }

  const trimmed = title.trim();

  if (trimmed.length === 0) {
    return { valid: false, message: "Title cannot be empty" };
  }

  if (trimmed.length < MIN_TITLE_LENGTH) {
    return {
      valid: false,
      message: `Title must be at least ${MIN_TITLE_LENGTH} characters`,
    };
  }

  if (trimmed.length > MAX_TITLE_LENGTH) {
    return {
      valid: false,
      message: `Title must be at most ${MAX_TITLE_LENGTH} characters`,
    };
  }

  return { valid: true, value: trimmed };
};

export const validateCompleted = (completed: unknown): ValidationResult => {
  if (completed === undefined) {
    return { valid: true };
  }

  if (typeof completed !== "boolean") {
    return { valid: false, message: "Completed must be true or false" };
  }

  return { valid: true };
};