"use client"

import { Field, Formik } from "formik"
import { useEffect, useState } from "react"
import { addBus, getRoutes } from "../api/ApiService"
import { CheckCircle, XCircle } from "lucide-react"

export default function AddUser({ onClose, onBusAdded }) {
  const [deviceId, setDeviceId] = useState("")
  const [busNo, setBusNo] = useState("")
  const [status, setStatus] = useState(true)
  const [routes, setRoutes] = useState([])

  async function onSubmit(values) {
    console.log("Submitting with values:", values)
    console.log("Route ID:", values.routeId)

    const bus = {
      deviceId: values.deviceId,
      busNo: values.busNo,
      status: values.status === "true" || values.status === true, // Convert to boolean
    }

    try {
      const response = await addBus(bus, values.routeId)
      onBusAdded()
      onClose()
    } catch (err) {
      console.log(err)
    }
  }

  async function getRoute() {
    try {
      const re = await getRoutes()
      console.log("Routes fetched:", re.data)
      setRoutes(re.data)
    } catch (error) {
      console.error("Error fetching routes:", error)
    }
  }

  useEffect(() => {
    getRoute()
  }, []) // Add empty dependency array to run only once

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
        {field.value === "true" || field.value === true ? (
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

  const RouteSelect = ({ field, form }) => {
    console.log("Routes in select:", routes)
    return (
      <div className="relative">
        <select
          {...field}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 appearance-none"
          onChange={(e) => {
            // Set the value explicitly to ensure it's the ID
            form.setFieldValue(field.name, e.target.value)
          }}
        >
          <option value="">Select a route</option>
          {routes && routes.length > 0 ? (
            routes.map((route) => (
              <option key={route.route_id} value={route.route_id}>
                {route.route_name}
              </option>
            ))
          ) : (
            <option value="" disabled>
              No routes available
            </option>
          )}
        </select>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Bus</h3>
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
              initialValues={{
                deviceId: deviceId || "",
                busNo: busNo || "",
                status: status,
                routeId: "", // Add routeId to initialValues
              }}
              enableReinitialize={true}
              onSubmit={onSubmit}
            >
              {(props) => (
                <form onSubmit={props.handleSubmit}>
                  <div className="grid gap-4 mb-4 sm:grid-cols-2">
                    <fieldset>
                      <label
                        htmlFor="deviceId"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Device ID
                      </label>
                      <Field
                        type="text"
                        name="deviceId"
                        id="deviceId"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter the device ID"
                        required
                      />
                    </fieldset>
                    <fieldset>
                      <label htmlFor="busNo" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Bus Number
                      </label>
                      <Field
                        type="text"
                        name="busNo"
                        id="busNo"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter Bus Number"
                        required
                      />
                    </fieldset>
                    <fieldset>
                      <label htmlFor="routeId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Route
                      </label>
                      <Field name="routeId" component={RouteSelect} />
                    </fieldset>

                    <fieldset className="sm:col-span-2">
                      <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Verification Status
                      </label>
                      <Field name="status" component={VerifiedStatusSelect} />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {props.values.status === "true" || props.values.status === true
                          ? "Bus has been verified and is active in the system"
                          : "Bus has not been verified and may have limited access"}
                      </p>
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
                    Add new bus
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
