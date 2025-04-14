"use client"

import { Field, Formik } from "formik"
import { useState } from "react"
import { addUser } from "../api/ApiService"

export default function AddUser({ onClose, onUserAdded }) {
  const [passenger_name, setPassengerName] = useState()
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const [verified, setVerified] = useState(true)

  async function onSubmit(values) {
    const route = {
      passenger_name: values.passenger_name,
      email: values.email,
      password: values.password,
      verified: verified
    }

    try {
      const response = await addUser(route)
      onUserAdded()
      onClose()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <>
      {/* Blurred backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

      <div
        id="createProductModal"
        tabIndex={-1}
        aria-hidden="true"
        className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full"
      >
        <div className="relative p-4 w-full max-w-2xl max-h-full">
          {/* Modal content */}
          <div className="relative p-4 bg-white rounded-none shadow dark:bg-gray-800 sm:p-5">
            {/* Modal header */}
            <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add User</h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-none text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-target="createProductModal"
                data-modal-toggle="createProductModal"
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
            <Formik
              initialValues={{ passenger_name, email, password }}
              enableReinitialize={true}
              onSubmit={onSubmit}
            >
              {(props) => (
                <form onSubmit={props.handleSubmit}>
                  <div className="grid gap-4 mb-4 sm:grid-cols-2">
                    <fieldset>
                      <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Passenger Name
                      </label>
                      <Field
                        type="text"
                        name="passenger_name"
                        id="name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter the route name"
                        required
                      />
                    </fieldset>
                    <fieldset>
                      <label htmlFor="brand" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Email
                      </label>
                      <Field
                        type="email"
                        name="email"
                        id="brand"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter Email"
                        required
                      />
                    </fieldset>

                    <fieldset>
                      <label htmlFor="brand" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Password
                      </label>
                      <Field
                        type="password"
                        name="password"
                        id="brand"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter strong password"
                        required
                      />
                    </fieldset>
                  </div>

                  <button
                    type="submit"
                    className="text-white inline-flex items-center bg-[#1D8F34] hover:bg-[#186434] focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-none text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                  >
                    <svg
                      className="mr-1 -ml-1 w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add new user
                  </button>
                </form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  )
}