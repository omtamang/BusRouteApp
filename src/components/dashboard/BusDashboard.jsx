"use client"

import { useEffect, useRef, useState } from "react"
import { deleteBus, deleteUser, getBus, getUsers } from "../api/ApiService"
import gsap from "gsap"
import AddBus from "./AddBus"
import EditBus from "./EditBus"

export default function BusDashboard({ darkMode }) {
  const [bus, setBus] = useState([])
  const [loading, setLoading] = useState(true)
  const popupRef = useRef(null)
  const [showPopup, setShowPopup] = useState(false)
  const [busToDelete, setBusToDelete] = useState(null)
  const [showAddPopup, setShowAddPopup] = useState(false)
  const [showEditPopup, setShowEditPopup] = useState(false)
  const [busToEdit, setBusToEdit] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const notificationRef = useRef(null)

  async function getAllBus() {
    try {
      const response = await getBus()
      setBus(response.data)
      setLoading(false)
      console.log("Bus loaded:", response.data)
    } catch (error) {
      console.error("Error fetching buses:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllBus()
  }, []) // Runs only on component mount (load)

  // Notification animation effect
  useEffect(() => {
    if (notification.show) {
      // Animate notification in
      gsap.fromTo(notificationRef.current, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })

      // Set timeout to hide notification after 30 seconds
      const timer = setTimeout(() => {
        gsap.to(notificationRef.current, {
          opacity: 0,
          y: -100,
          duration: 0.5,
          onComplete: () => setNotification({ show: false, message: "", type: "" }),
        })
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [notification.show])

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false)
      }
    }

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showPopup])

  const handleDeleteClick = (user) => {
    setBusToDelete(user)
    console.log(user)
    setShowPopup(true)
  }

  const handleRouteUpdated = (updatedRoute) => {
    getAllBus()
    // Show success notification
    setNotification({
      show: true,
      message: `Route "${updatedRoute.route_name}" (ID: ${updatedRoute.route_id}) successfully updated`,
      type: "success",
    })
  }

  const handleEditClick = (bus) => {
    setBusToEdit(bus)
    setShowEditPopup(true)
  }

  const handleAddClick = () => {
    setShowAddPopup(true)
  }

  const handleBusAdded = () => {
    getAllBus()
    // Show success notification
    setNotification({
      show: true,
      message: "Bus successfully added to the database",
      type: "success",
    })
  }

  async function deleteBusById() {
    try {
      if (!busToDelete) return

      console.log("Deleting bus with ID:", busToDelete.busId)
      const response = await deleteBus(busToDelete.busId)

      // Update the UI by removing the deleted route
      setBus(bus.filter((user) => user.busId !== busToDelete.busId))

      // Show success notification with route ID and name
      setNotification({
        show: true,
        message: `Bus "${busToDelete.busNo}" (ID: ${busToDelete.busId}) successfully deleted`,
        type: "success",
      })

      setBusToDelete(null)
    } catch (err) {
      console.error("Error deleting route:", err)
      // Show error notification
      setNotification({
        show: true,
        message: busToDelete
          ? `Failed to delete bus "${busToDelete.busNo}" (ID: ${busToDelete.busId})`
          : "Failed to delete bus",
        type: "error",
      })
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteBusById()
    } catch (error) {
      console.error("Error deleting bus:", error)
    }
  }

  return (
    <section className={`${darkMode ? "bg-gray-900" : "bg-gray-50"} p-3 sm:p-5 antialiased`}>
      {/* Notification */}
      {notification.show && (
        <div
          ref={notificationRef}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-none shadow-lg ${
            notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          <p className="font-medium">{notification.message}</p>
        </div>
      )}

      <div className="mx-auto max-w-screen-2xl px-4 lg:px-12">
        <div
          className={`${darkMode ? "bg-gray-800 text-white" : "bg-white"} relative shadow-md sm:rounded-none overflow-hidden`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4 p-4"></div>
          <div
            className={`flex flex-col md:flex-row items-stretch md:items-center md:space-x-3 space-y-3 md:space-y-0 justify-between mx-4 py-4 border-t ${darkMode ? "border-gray-700" : ""}`}
          >
            <div className="w-full md:w-1/2">
              <form className="flex items-center">
                <label htmlFor="simple-search" className="sr-only">
                  Search
                </label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      aria-hidden="true"
                      className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="simple-search"
                    placeholder="Search for users"
                    required=""
                    className={`border text-sm rounded-none block w-full pl-10 p-2 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-primary-500 focus:border-primary-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500"
                    }`}
                  />
                </div>
              </form>
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
              <button
                type="button"
                id="createProductButton"
                data-modal-toggle="createProductModal"
                className="flex items-center justify-center text-white bg-[#1D8F34] hover:bg-[#186434] focus:ring-4 focus:ring-primary-300 font-medium rounded-none text-sm px-4 py-2 focus:outline-none"
                onClick={() => {
                  handleAddClick()
                }}
              >
                <svg
                  className="h-3.5 w-3.5 mr-1.5 -ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  />
                </svg>
                Add bus
              </button>
              <button
                id="filterDropdownButton"
                data-dropdown-toggle="filterDropdown"
                className={`w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium rounded-none border hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 focus:z-10 ${
                  darkMode
                    ? "bg-gray-800 text-white border-gray-600 hover:text-white hover:bg-gray-700 focus:ring-gray-700"
                    : "bg-white text-gray-900 border-gray-200 hover:text-primary-700"
                }`}
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className={`h-4 w-4 mr-1.5 -ml-1 ${darkMode ? "text-gray-400" : "text-gray-400"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                    clipRule="evenodd"
                  />
                </svg>
                Filter options
                <svg
                  className="-mr-1 ml-1.5 w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  />
                </svg>
              </button>
              <div
                id="filterDropdown"
                className="z-10 hidden px-3 pt-1 bg-white rounded-none shadow w-80 dark:bg-gray-700 right-0"
              >
                <div className="flex items-center justify-between pt-2">
                  <h6 className="text-sm font-medium text-black dark:text-white">Filters</h6>
                  <div className="flex items-center space-x-3">
                    <a
                      href="#"
                      className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-500 hover:underline"
                    >
                      Save view
                    </a>
                    <a
                      href="#"
                      className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-500 hover:underline"
                    >
                      Clear all
                    </a>
                  </div>
                </div>
                <div className="pt-3 pb-2">
                  <label htmlFor="input-group-search" className="sr-only">
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="input-group-search"
                      className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-none bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder="Search keywords..."
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <button
                  id="actionsDropdownButton"
                  data-dropdown-toggle="actionsDropdown"
                  className={`w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium rounded-none border focus:outline-none focus:ring-4 ${
                    darkMode
                      ? "bg-gray-800 text-gray-400 border-gray-600 hover:text-white hover:bg-gray-700 focus:ring-gray-700"
                      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:ring-gray-200"
                  }`}
                  type="button"
                >
                  Actions
                  <svg
                    className="-mr-1 ml-1.5 w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    />
                  </svg>
                </button>
                <div
                  id="actionsDropdown"
                  className="hidden z-10 w-44 bg-white rounded-none divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600"
                >
                  <ul className="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="actionsDropdownButton">
                    <li>
                      <a
                        href="#"
                        className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Mass Edit
                      </a>
                    </li>
                  </ul>
                  <div className="py-1">
                    <a
                      href="#"
                      className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                    >
                      Delete all
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className={`w-full text-sm text-left ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              <thead
                className={`text-xs uppercase ${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-50 text-gray-700"}`}
              >
                <tr>
                  <th scope="col" className="p-4">
                    <div className="flex items-center">
                      <input
                        id="checkbox-all"
                        type="checkbox"
                        className={`w-4 h-4 rounded-none focus:ring-2 ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 focus:ring-primary-600 ring-offset-gray-800"
                            : "bg-gray-100 border-gray-300 focus:ring-primary-500"
                        } text-primary-600`}
                      />
                      <label htmlFor="checkbox-all" className="sr-only">
                        checkbox
                      </label>
                    </div>
                  </th>
                  <th scope="col" className="p-4">
                    Bus No
                  </th>
                  <th scope="col" className="p-4">
                    DeviceId
                  </th>
                  <th scope="col" className="p-4">
                    Latitude
                  </th>
                  <th scope="col" className="p-4">
                    Longitude
                  </th>
                  <th scope="col" className="p-4">
                    Speed
                  </th>
                  <th scope="col" className="p-4">
                    Next Stop
                  </th>
                  <th scope="col" className="p-4">
                    Status
                  </th>
                  <th scope="col" className="p-4">
                    Arrival time
                  </th>
                  <th scope="col" className="p-4">
                    Last Updated
                  </th>
                  <th scope="col" className="p-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className={`border-b ${darkMode ? "border-gray-600" : ""}`}>
                    <td colSpan="9" className="px-4 py-3 text-center">
                      Loading route data...
                    </td>
                  </tr>
                ) : bus.length === 0 ? (
                  <tr className={`border-b ${darkMode ? "border-gray-600" : ""}`}>
                    <td colSpan="9" className="px-4 py-3 text-center">
                      No bus found
                    </td>
                  </tr>
                ) : (
                  bus.map((buses, index) => (
                    <tr
                      key={index}
                      className={`border-b ${darkMode ? "border-gray-600 hover:bg-gray-700" : "hover:bg-gray-100"}`}
                    >
                      <td className="p-4 w-4">
                        <div className="flex items-center">
                          <input
                            id={`checkbox-table-${index}`}
                            type="checkbox"
                            onClick={(e) => e.stopPropagation()}
                            className={`w-4 h-4 rounded-none focus:ring-2 ${
                              darkMode
                                ? "bg-gray-700 border-gray-600 focus:ring-primary-600 ring-offset-gray-800"
                                : "bg-gray-100 border-gray-300 focus:ring-primary-500"
                            } text-primary-600`}
                          />
                          <label htmlFor={`checkbox-table-${index}`} className="sr-only">
                            checkbox
                          </label>
                        </div>
                      </td>
                      <th
                        scope="row"
                        className={`px-4 py-3 font-medium whitespace-nowrap ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        <div className="flex items-center mr-3">{buses.busNo}</div>
                      </th>
                      <td
                        className={`px-4 py-3 font-medium whitespace-nowrap ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {buses.deviceId}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium whitespace-nowrap ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {buses.latitude}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium whitespace-nowrap ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {buses.longitude}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium whitespace-nowrap ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {buses.speed}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium whitespace-nowrap ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {buses.nextStop}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium whitespace-nowrap ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {buses.status ? 'Yes' : 'No'}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium whitespace-nowrap ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {buses.approximate_arrival_time}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium whitespace-nowrap ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {buses.lastUpdated}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium whitespace-nowrap ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        <div className="flex items-center space-x-4">
                          <button
                            type="button"
                            data-drawer-target="drawer-update-product"
                            data-drawer-show="drawer-update-product"
                            aria-controls="drawer-update-product"
                            onClick={() => handleEditClick(buses)}
                            className="py-2 px-3 flex items-center text-sm font-medium text-center text-white bg-[#1D8F34] rounded-none hover:bg-[#186434] focus:ring-4 focus:outline-none focus:ring-primary-300"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-2 -ml-0.5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                              <path
                                fillRule="evenodd"
                                d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            type="button"
                            className={`flex items-center text-red-700 border border-red-700 hover:bg-red-800 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-none text-sm px-3 py-2 text-center ${
                              darkMode
                                ? "border-red-500 text-red-500 hover:text-white hover:bg-red-600 focus:ring-red-900"
                                : ""
                            }`}
                            onClick={() => handleDeleteClick(buses)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-2 -ml-0.5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <nav
            className={`flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            aria-label="Table navigation"
          >
            <span className={`text-sm font-normal ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Showing
              <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {" "}
                {bus.length > 0 ? `1-${Math.min(bus.length, 10)}` : "0"}{" "}
              </span>
              of
              <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}> {bus.length} </span>
            </span>
            <ul className="inline-flex items-stretch -space-x-px">
              <li>
                <a
                  href="#"
                  className={`flex items-center justify-center h-full py-1.5 px-3 ml-0 rounded-none border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center justify-center text-sm py-2 px-3 leading-tight border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  1
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center justify-center text-sm py-2 px-3 leading-tight border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  2
                </a>
              </li>
              <li>
                <a
                  href="#"
                  aria-current="page"
                  className={`flex items-center justify-center text-sm z-10 py-2 px-3 leading-tight ${
                    darkMode
                      ? "border-gray-700 bg-gray-700 text-white"
                      : "text-primary-600 bg-primary-50 border border-primary-300 hover:bg-primary-100 hover:text-primary-700"
                  }`}
                >
                  3
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center justify-center text-sm py-2 px-3 leading-tight border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  ...
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center justify-center text-sm py-2 px-3 leading-tight border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  100
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center justify-center h-full py-1.5 px-3 leading-tight rounded-none border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div id="deleteModal" ref={popupRef} className="relative p-4 w-full max-w-md">
            {/* Modal content */}
            <div
              className={`relative p-4 text-center rounded-none shadow sm:p-5 ${darkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <svg
                className={`${darkMode ? "text-gray-500" : "text-gray-400"} w-11 h-11 mb-3.5 mx-auto`}
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                Are you sure you want to delete this route?
              </p>
              <div className="flex justify-center items-center space-x-4">
                <button
                  type="button"
                  className={`py-2 px-3 text-sm font-medium rounded-none border focus:ring-4 focus:outline-none focus:z-10 ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 border-gray-500 hover:text-white hover:bg-gray-600 focus:ring-gray-600"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-900 focus:ring-primary-300"
                  }`}
                  onClick={() => setShowPopup(false)}
                >
                  No, cancel
                </button>
                <button
                  type="button"
                  className="py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-none hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900"
                  onClick={() => {
                    handleConfirmDelete()
                    setShowPopup(false)
                  }}
                >
                  Yes, I'm sure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add route modal */}
      {showAddPopup && (
        <AddBus onClose={() => setShowAddPopup(false)} onBusAdded={handleBusAdded} darkMode={darkMode} />
      )}

      {/* Edit route modal */}
      {showEditPopup && (
        <EditBus
          onClose={() => setShowEditPopup(false)}
          onRouteUpdated={handleRouteUpdated}
          busData={busToEdit}
          darkMode={darkMode}
        />
      )}
    </section>
  )
}

