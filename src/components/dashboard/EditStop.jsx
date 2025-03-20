"use client"

import { Field, Formik } from "formik"
import { useState, useEffect } from "react"
import { getRoutes, updateStop } from "../api/ApiService"

export default function EditStop({ onClose, onStopUpdated, stopData }) {
    const [routes, setRoutes] = useState([])

  // Initialize state with the route data if provided
  const [initialValues, setInitialValues] = useState({
    stop_id: "",
    stop_name: "",
    lat: "",
    lng: "",
    route_id: ""
  })

  // Update initialValues when routeData changes
  useEffect(() => {
    if (stopData) {
      setInitialValues({
        stop_id: stopData.stop_id,
        stop_name: stopData.stop_name || "",
        lat: stopData.lat || "",
        lng: stopData.lng || "",
      })
    }
  }, [stopData])

  async function getAllRoutes() {
      try {
        console.log(stopData)
        const response = await getRoutes()
        setRoutes(response.data)
      } catch (error) {
        console.error("Error fetching routes:", error)
      }
    }
  
    useEffect(() => {
      getAllRoutes()
    }, [])

  async function onSubmit(values) {
    const stops = {
        stop_id: values.stop_id,
        stop_name: values.stop_name,
        lat: values.lat,
        lng: values.lng,
        route_id: values.route_id
    }

    try {
      const response = await updateStop(stops, values.route_id, values.stop_id)
      onStopUpdated(stops)
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Route</h3>
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
                        htmlFor="route_name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Stop ID
                      </label>
                      <Field
                        type="number"
                        name="stop_id"
                        id="route_name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter the route name"
                        required
                      />
                    </fieldset>
                    
                    <fieldset>
                      <label
                        htmlFor="route_name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Stop Name
                      </label>
                      <Field
                        type="text"
                        name="stop_name"
                        id="route_name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter the route name"
                        required
                      />
                    </fieldset>
                    <fieldset>
                      <label
                        htmlFor="start_lat"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Latitude
                      </label>
                      <Field
                        type="number"
                        name="lat"
                        id="start_lat"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Stop Latitude"
                        required
                      />
                    </fieldset>

                    <fieldset>
                      <label
                        htmlFor="start_lng"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Longitude
                      </label>
                      <Field
                        type="number"
                        name="lng"
                        id="start_lng"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Stop Longitude"
                        required
                      />
                    </fieldset>

                    <fieldset>
                      <label
                        htmlFor="route_id"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Route
                      </label>
                      <Field
                        as="select"
                        name="route_id"
                        id="route_id"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        required
                      >
                        <option value="">Select a route</option>
                        {routes &&
                          routes.length > 0 &&
                          routes.map((route) => (
                            // Make sure we're using the correct property for the route ID
                            <option key={route.id || route._id} value={route.id || route._id || route.route_id}>
                              {route.route_name}
                            </option>
                          ))}
                      </Field>
                    </fieldset>

                  </div>

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
                    Update stop
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

