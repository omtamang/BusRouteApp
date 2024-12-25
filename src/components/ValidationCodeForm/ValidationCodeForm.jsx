import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { verifyEmail } from '../api/ApiService';

const ValidationCodeForm = () => {
  const [errors, setErrors] = useState({});
  const { email } = useParams();
  const navigate = useNavigate();

  const validateCode = (code) => {
    const errors = {};
    if (!code) {
      errors.code = 'Verification code is required';
    } else if (!/^\d{6}$/.test(code)) {
      errors.code = 'Verification code must be a 6-digit number';
    }
    return errors;
  };

  async function checkCode(values) {
    const details = {
      email: email,
      code: values.code,
    };

    try {
      const response = await verifyEmail(details);
      if (response.status === 202) {
        navigate('/login');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleSubmit = (values) => {
    const errors = validateCode(values.code);
    if (Object.keys(errors).length > 0) {
      setErrors(errors); // Set errors to be displayed
    } else {
      console.log('Verification code submitted:', values.code);
      checkCode(values);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-10/12 max-w-md mx-auto p-6 border border-gray-300 rounded-lg bg-gray-50 text-center shadow-md">
        <h2 className="text-2xl font-semibold mb-4">
          Verification Code sent to: <b>{email}</b>
        </h2>
        <Formik initialValues={{ code: '' }} onSubmit={handleSubmit}>
          {({ touched, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="flex flex-col items-start">
                <label htmlFor="code" className="font-medium mb-2">
                  Verification Code
                </label>
                <Field
                  id="code"
                  name="code"
                  placeholder="Enter 6-digit code"
                  className={`w-full p-3 border rounded-md ${
                    errors.code && touched.code
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  onChange={(e) => {
                    setFieldValue('code', e.target.value);
                    setErrors({}); // Clear errors when input changes
                  }}
                />
                {errors.code && touched.code && (
                  <div className="text-red-500 text-sm mt-2">{errors.code}</div>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#1D8F34] text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Verify
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="w-full py-3 bg-gray-300 text-gray-800 font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Back
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ValidationCodeForm;
