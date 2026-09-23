"use client";

import { useCallback, useState } from "react";

/**
 * Per-field validation errors for a form.
 *
 *   const { errors, validate, clear } = useFieldErrors();
 *   if (!validate(values, { email: validateEmail })) return;
 *
 * `validate` runs each rule against `values[field]`, stores any messages, and
 * returns true when everything passed. `clear(field)` removes one error —
 * call it when the user edits that field.
 */
export function useFieldErrors() {
  const [errors, setErrors] = useState({});

  const validate = useCallback((values, schema) => {
    const result = schema.safeParse(values);

    if (result.success) {
      setErrors({});
      return result.data;
    }

    const next = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field !== undefined && !next[field]) next[field] = issue.message;
    }
    setErrors(next);
    return null;
  }, []);

  const clear = useCallback((field) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  return { errors, validate, clear };
}
