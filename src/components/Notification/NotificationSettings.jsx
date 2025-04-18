"use client"

import { useState, useEffect, useRef } from "react"
import gsap from "gsap"
import { Link } from "react-router-dom"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useParams } from "react-router-dom"
import { getPassenger, getReminder } from "../api/ApiService"

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState([])
  const [user, setUser] = useState("")

  const [newNotification, setNewNotification] = useState({
    time: "",
    active: true,
    label: "",
  })

  const [isAdding, setIsAdding] = useState(false)
  const notificationListRef = useRef(null)
  const formRef = useRef(null)
  const { routeId } = useParams()

  async function getNotification(){

    async function getUser() {
        try{
            const response = await getPassenger()
            setUser(response.data)
        }catch(err){
            console.log(err)
        }
    }
    getUser()

    try{
        const response = await getReminder(user)
        console.log(response)
        setNotifications(response.data)
        console.log(notifications)
    }catch(err){
        console.log(err)
    }
  }

  useEffect(() => {
    getNotification()
  }, [])

  // Animation when component mounts
  useEffect(() => {
    const items = notificationListRef.current?.querySelectorAll(".notification-item")

    if (items) {
      gsap.from(items, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
      })
    }
  }, [])

  // Animation for adding/removing notifications
  useEffect(() => {
    if (isAdding) {
      gsap.fromTo(
        formRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" },
      )
    } else if (formRef.current) {
      gsap.to(formRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      })
    }
  }, [isAdding])

  const handleToggle = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, active: !notification.active } : notification,
      ),
    )

    // Animate the toggle
    const toggleElement = document.getElementById(`toggle-${id}`)
    if (toggleElement) {
      gsap.fromTo(toggleElement, { scale: 0.8 }, { scale: 1, duration: 0.2, ease: "elastic.out(1, 0.3)" })
    }
  }

  const handleTimeChange = (id, newTime) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, time: newTime } : notification)),
    )
  }

  const handleLabelChange = (id, newLabel) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, label: newLabel } : notification)),
    )
  }

  const handleDelete = (id) => {
    const itemToDelete = document.getElementById(`notification-${id}`)

    if (itemToDelete) {
      gsap.to(itemToDelete, {
        x: -100,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setNotifications((prev) => prev.filter((notification) => notification.id !== id))
        },
      })
    }
  }

  const handleAddNew = (e) => {
    e.preventDefault()

    if (!newNotification.time || !newNotification.label) return

    const newId = Date.now().toString()
    const newItem = { ...newNotification, id: newId }

    setNotifications((prev) => [...prev, newItem])
    setNewNotification({ time: "", active: true, label: "" })
    setIsAdding(false)

    // Animate the new item
    setTimeout(() => {
      const newElement = document.getElementById(`notification-${newId}`)
      if (newElement) {
        gsap.fromTo(newElement, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" })
      }
    }, 10)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header matching the design in the image */}
      <header className="flex items-center p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
                  <Link
                    className={`text-xl hover:bg-opacity-10 hover:bg-black p-2 rounded-full transition-all`}
                    to={`/profile/${routeId}`}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="align-middle hover:scale-110 transition-transform" />
                  </Link>
                  <span className={"text-xl pl-2 md:pl-4 font-medium"}>
                    Notification settings
                  </span>
                </div>
      </header>

      <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 md:mb-8">Notification Times</h2>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-8 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800">Configure Notifications</h3>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Configure when you want to receive notifications
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                <span className="text-sm text-gray-600">Inactive</span>
              </div>
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center justify-center h-10 px-4 rounded-md bg-green-500 text-white hover:bg-green-600 transition-all duration-200 ease-in-out shadow-sm hover:shadow"
              >
                <span className="text-lg mr-1">{isAdding ? "×" : "+"}</span>
                <span>{isAdding ? "Cancel" : "Add New"}</span>
              </button>
            </div>
          </div>

          {/* Add new notification form */}
          <form
            ref={formRef}
            onSubmit={handleAddNew}
            className={`mb-8 overflow-hidden ${isAdding ? "block" : "hidden"}`}
            style={{ height: 0, opacity: 0 }}
          >
            <div className="bg-blue-50 p-4 md:p-6 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-blue-800 mb-4">Add New Notification</h3>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-1">
                  <label htmlFor="new-label" className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Label
                  </label>
                  <input
                    id="new-label"
                    type="text"
                    value={newNotification.label}
                    onChange={(e) => setNewNotification((prev) => ({ ...prev, label: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                    placeholder="Enter notification label"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="new-time" className="block text-sm font-medium text-gray-700 mb-1">
                    Time (24-hour)
                  </label>
                  <input
                    id="new-time"
                    type="time"
                    value={newNotification.time}
                    onChange={(e) => setNewNotification((prev) => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex items-center h-10">
                    <button
                      type="button"
                      onClick={() => setNewNotification((prev) => ({ ...prev, active: !prev.active }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                        newNotification.active ? "bg-green-500" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${
                          newNotification.active ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="ml-2 text-sm text-gray-600">{newNotification.active ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow transition-all duration-200 ease-in-out"
                >
                  Add Notification
                </button>
              </div>
            </div>
          </form>

          {/* Notification list */}
          <div ref={notificationListRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notifications.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="text-gray-500 text-lg">No notifications set</p>
                <p className="text-gray-400 text-sm mt-1">
                  Click the "Add New" button to create your first notification
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  id={`notification-${notification.id}`}
                  className="notification-item bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow transition-all duration-200 ease-in-out"
                >
                  <div className="flex justify-between items-start mb-3">
                    <input
                      type="text"
                      value={notification.label}
                      onChange={(e) => handleLabelChange(notification.id, e.target.value)}
                      className="font-medium text-gray-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-1 text-base md:text-lg"
                    />
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200 ease-in-out p-1 rounded-full hover:bg-red-50"
                      aria-label="Delete notification"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-500 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <input
                        type="time"
                        value={notification.time}
                        onChange={(e) => handleTimeChange(notification.id, e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 px-2 py-1 text-gray-700"
                      />
                    </div>

                    <div className="flex items-center">
                      <button
                        id={`toggle-${notification.id}`}
                        type="button"
                        onClick={() => handleToggle(notification.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                          notification.active ? "bg-green-500" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${
                            notification.active ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="ml-2 text-sm text-gray-600">{notification.active ? "Active" : "Inactive"}</span>
                    </div>
                  </div>

                  <div
                    className={`mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center ${notification.active ? "text-green-600" : "text-gray-400"}`}
                  >
                    <span>{notification.active ? "Notification enabled" : "Notification disabled"}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">ID: {notification.id}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary section - desktop only */}
          <div className="hidden md:block mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-700">Notification Summary</h3>
                <p className="text-sm text-gray-500 mt-1">
                  You have {notifications.length} notification{notifications.length !== 1 ? "s" : ""} configured,
                  {notifications.filter((n) => n.active).length} active
                </p>
              </div>

              <div className="flex space-x-4">
                <button className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 ease-in-out">
                  Export Settings
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 ease-in-out">
                  Reset All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS animations keyframes */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}
