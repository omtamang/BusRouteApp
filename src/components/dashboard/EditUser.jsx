"use client"

import { Field, Formik } from "formik"
import { useState, useEffect } from "react"
import { updateUser } from "../api/ApiService"
import { CheckCircle, XCircle } from "lucide-react"

export default function EditUser({ onClose, onRouteUpdated, userData }) {
  // Initialize state with the route data if provided
  const [initialValues, setInitialValues] = useState({
    passenger_id: "",
    passenger_name: "",
    email: "",
    password: "",
    verified: "true", // Default to true
  })

  // Update initialValues when routeData changes
  useEffect(() => {
    if (userData) {
        console.log(userData)
      setInitialValues({
        passenger_id: userData.passenger_id,
        passenger_name: userData.passenger_name || "",
        email: userData.email || "",
        password: userData.password || "",
        verified: userData.verified?.toString() || "true", // Convert to string for select
      })
    }
  }, [userData])

  async function onSubmit(values) {
    const user = {
      passenger_id: userData.passenger_id,
      passenger_name: values.passenger_name,
      email: values.email,
      password: values.password,
      verified: values.verified === "true", // Convert string back to boolean
    }

    try {
        console.log(values.passenger_id)
      const response = await updateUser(user, values.passenger_id)
      onRouteUpdated(user)
      onClose()
    } catch (err) {
      console.log(err)
    }
  }

  // Custom component for the verified status dropdown
  const VerifiedStatusSelect = ({ field, form }) => (
    <div className="relative">
      <select
        {...field}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pl-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 appearance-none"
      >
        <option value="true" className="bg-emerald-50 dark:bg-emerald-900">
          Verified ✓
        </option>
        <option value="false" className="bg-red-50 dark:bg-red-900">
          Not Verified ✗
        </option>
      </select>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        {field.value === "true" ? (
          <CheckCircle className="h-5 w-5 text-emerald-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-500 dark:text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  )

  return (
    <>
      {/* Blurred backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

      <div
        id="editRouteModal"
        tabIndex={-1}
        aria-hidden="true"
        className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full"
      >
        <div className="relative p-4 w-full max-w-2xl max-h-full">
          {/* Modal content */}
          <div className="relative p-4 bg-white rounded-none shadow dark:bg-gray-800 sm:p-5">
            {/* Modal header */}
            <div className="flex justify-between items-center pb-4 mb-4 rounded-none border-b sm:mb-5 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit User</h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-none text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={onClose}
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            {/* Modal body */}
            <Formik initialValues={initialValues} enableReinitialize={true} onSubmit={onSubmit}>
              {(props) => (
                <form onSubmit={props.handleSubmit}>
                  <div className="grid gap-4 mb-4 sm:grid-cols-2">
                    <fieldset>
                      <label
                        htmlFor="passenger_id"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Passenger ID
                      </label>
                      <Field
                        type="number"
                        name="passenger_id"
                        id="passenger_id"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter the passenger id"
                        required
                      />
                    </fieldset>
                    <fieldset>
                      <label
                        htmlFor="passenger_name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Passenger Name
                      </label>
                      <Field
                        type="text"
                        name="passenger_name"
                        id="passenger_name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter the passenger name"
                        required
                      />
                    </fieldset>
                    <fieldset>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Email
                      </label>
                      <Field
                        type="email"
                        name="email"
                        id="email"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter email address"
                        required
                      />
                    </fieldset>

                    <fieldset>
                      <label
                        htmlFor="password"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Password
                      </label>
                      <Field
                        type="password"
                        name="password"
                        id="password"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter password"
                        required
                      />
                    </fieldset>

                    <fieldset className="sm:col-span-2">
                      <label
                        htmlFor="verified"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Verification Status
                      </label>
                      <Field name="verified" component={VerifiedStatusSelect} />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {props.values.verified === "true"
                          ? "User has been verified and has full access to the system"
                          : "User has not been verified and may have limited access"}
                      </p>
                    </fieldset>
                  </div>

                  <div className="flex items-center space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-none border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="text-white inline-flex items-center bg-[#1D8F34] hover:bg-[#186434] focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-none text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 -ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path
                          fillRule="evenodd"
                          d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Update user
                    </button>
                  </div>
                </form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  )
}

