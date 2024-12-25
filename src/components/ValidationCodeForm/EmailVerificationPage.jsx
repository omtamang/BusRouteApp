import React from 'react';
import { Formik, Form, Field } from 'formik';
import { useNavigate } from 'react-router-dom';

const EmailVerificationPage = () => {
  const navigate = useNavigate();

  const validateEmail = (value) => {
    let error;
    if (!value) {
      error = 'Email is required';
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
    ) {
      error = 'Invalid email address';
    }
    return error;
  };

  const handleSubmit = (values) => {
    console.log('Email submitted for verification:', values.email);
    navigate('/verification/' + values.email);
  };

  const handleBack = () => {
    navigate(-1); // Go to the previous page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h1 className="text-xl font-bold mb-4 text-center">Verify Your Email</h1>
        <Formik
          initialValues={{ email: '' }}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <Field
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  validate={validateEmail}
                  className={`mt-1 block w-full px-4 py-2 border ${
                    errors.email && touched.email
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {errors.email && touched.email && (
                  <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-[#1D8F34] text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none"
              >
                Verify Email
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="w-full mt-2 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 focus:outline-none"
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

export default EmailVerificationPage;
