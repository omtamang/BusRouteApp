"use client"

import { Field, Formik } from "formik"
import { useState, useEffect } from "react"
import { updateRoute } from "../api/ApiService"

export default function EditRoute({ onClose, onRouteUpdated, routeData }) {
    // Initialize state with the route data if provided
    const [initialValues, setInitialValues] = useState({
        route_name: '',
        start_lat: '',
        start_lng: '',
        end_lat: '',
        end_lng: '',
        no_of_buses: ''
    })

    // Update initialValues when routeData changes
    useEffect(() => {
        if (routeData) {
            setInitialValues({
                route_id: routeData.route_id,
                route_name: routeData.route_name || '',
                start_lat: routeData.start_lat || '',
                start_lng: routeData.start_lng || '',
                end_lat: routeData.end_lat || '',
                end_lng: routeData.end_lng || '',
                no_of_buses: routeData.no_of_buses || ''
            })
        }
    }, [routeData])

    async function onSubmit(values) {
        const route = {
            route_id: values.route_id, // Include the route_id for update
            route_name: values.route_name,
            start_lat: values.start_lat,
            start_lng: values.start_lng,
            end_lat: values.end_lat,
            end_lng: values.end_lng,
            no_of_buses: values.no_of_buses
        }

        try {
            const response = await updateRoute(route, values.route_id)
            onRouteUpdated(route)
            onClose()
        } catch(err) {
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
                    <div className="relative p-4 bg-white rounded-2xl shadow dark:bg-gray-800 sm:p-5">
                        {/* Modal header */}
                        <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Route</h3>
                            <button
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-full text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
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
                            initialValues={initialValues}
                            enableReinitialize={true}
                            onSubmit={onSubmit}
                        >
                            {
                                (props) => (
                                    <form onSubmit={props.handleSubmit}>
                                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                                        <fieldset>
                                                <label htmlFor="route_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    Route ID
                                                </label>
                                                <Field
                                                    type="number"
                                                    name="route_id"
                                                    id="route_name"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                    placeholder="Enter the route name"
                                                    required
                                                />
                                            </fieldset>
                                            <fieldset>
                                                <label htmlFor="route_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    Route Name
                                                </label>
                                                <Field
                                                    type="text"
                                                    name="route_name"
                                                    id="route_name"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                    placeholder="Enter the route name"
                                                    required
                                                />
                                            </fieldset>
                                            <fieldset>
                                                <label htmlFor="start_lat" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    Start Latitude
                                                </label>
                                                <Field
                                                    type="number"
                                                    name="start_lat"
                                                    id="start_lat"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                    placeholder="Starting latitude"
                                                    required
                                                />
                                            </fieldset>

                                            <fieldset>
                                                <label htmlFor="start_lng" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    Start Longitude
                                                </label>
                                                <Field
                                                    type="number"
                                                    name="start_lng"
                                                    id="start_lng"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                    placeholder="Starting longitude"
                                                    required
                                                />
                                            </fieldset>

                                            <fieldset>
                                                <label htmlFor="end_lat" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    End Latitude
                                                </label>
                                                <Field
                                                    type="number"
                                                    name="end_lat"
                                                    id="end_lat"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                    placeholder="Ending latitude"
                                                    required
                                                />
                                            </fieldset>

                                            <fieldset>
                                                <label htmlFor="end_lng" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    End Longitude
                                                </label>
                                                <Field
                                                    type="number"
                                                    name="end_lng"
                                                    id="end_lng"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                    placeholder="Ending longitude"
                                                    required
                                                />
                                            </fieldset>

                                            <fieldset>
                                                <label htmlFor="no_of_buses" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    No of buses
                                                </label>
                                                <Field
                                                    type="number"
                                                    name="no_of_buses"
                                                    id="no_of_buses"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                    placeholder="0"
                                                    required
                                                />
                                            </fieldset>
                                        </div>

                                        <button
                                            type="submit"
                                            className="text-white inline-flex items-center bg-[#1D8F34] hover:bg-[#186434] focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-xl text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
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
                                            Update route
                                        </button>
                                    </form>
                                )
                            }
                        </Formik>
                    </div>
                </div>
            </div>
        </>
    )
}
