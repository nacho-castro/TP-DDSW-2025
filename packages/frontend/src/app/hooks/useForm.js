import { useState } from 'react';

export function useForm(initialValues, onSubmit, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValues = { ...values, [name]: value };
    setValues(newValues);

    
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    if (validate) {
      setErrors(validate(newValues));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    if (validate) {
      setErrors(validate(values));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTriedSubmit(true);
    const validationErrors = validate ? validate(values) : {};
    setErrors(validationErrors);
    setTouched(
      Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      await onSubmit(values);
      setIsSubmitting(false);
      setTriedSubmit(false);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setTriedSubmit(false);
  };

  
  const showError = (name) =>
    (touched[name] || triedSubmit) && errors[name] ? errors[name] : '';

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    showError,
  };
}