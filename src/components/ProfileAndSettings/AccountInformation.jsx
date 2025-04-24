"use client"

import { useEffect, useState, useRef } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { gsap } from "gsap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowLeft,
  faSave,
  faUser,
  faEnvelope,
  faLock,
  faCheckCircle,
  faTimesCircle,
  faEye,
  faEyeSlash,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons"
import { findByEmail, getPassenger, updateByUser, updateUser } from "../api/ApiService"
import { Formik, Form, ErrorMessage } from "formik"

export default function AccountInformation() {
  const [user, setUser] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { routeId } = useParams()

  const headerRef = useRef(null)
  const formCardRef = useRef(null)
  const formFieldsRef = useRef([])
  const successPopupRef = useRef(null)

  const validate = (values) => {
    const errors = {}
    if (!values.passenger_name) {
      errors.passenger_name = "Name is required"
    }
    if (!values.password) {
      errors.password = "Current password is required to update information"
    }
    if (values.newPassword && values.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters"
    }
    return errors
  }

  async function userInfo() {
    try {
      const response = await getPassenger()
      const res = await findByEmail(response.data)
      // The data is in an array, so we need to get the first element
      const userData = Array.isArray(res.data) ? res.data[0] : res.data
      setUser(userData)
      console.log("User data fetched:", res.data)
    } catch (error) {
      console.log(error)
    }
  }

  async function handleSubmit(values, { setSubmitting }) {
    // Reset any previous errors
    setError(null)

    try {
      const passengerId = user.passenger_id
      const passenger = {
        passenger_name: values.passenger_name,
        password: values.password,
        newPassword: values.newPassword,
        email: user.email,
        verified: user.verified,
      }

      console.log(passenger)

      const response = await updateByUser(passenger, passengerId)
      setShowSuccess(true)

      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } catch (error) {
      console.log(error)

      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 400) {
          if (error.response.data && error.response.data.message) {
            setError(error.response.data.message)
          } else {
            setError("Invalid request. Please check your information.")
          }
        } else if (error.response.status === 401 || (error.response.data && error.response.data.includes("password"))) {
          setError("Incorrect password. Please try again.")
        } else {
          setError("An error occurred while updating your information.")
        }
      } else {
        setError("Network error. Please try again later.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    userInfo()

    // Check if window width is desktop or mobile
    const isDesktop = window.innerWidth >= 768

    // Header animation
    gsap.fromTo(headerRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })

    // Form card animation
    gsap.fromTo(
      formCardRef.current,
      { y: isDesktop ? 0 : -30, opacity: 0, scale: isDesktop ? 0.95 : 1 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      },
    )

    // Form fields animation with stagger
    formFieldsRef.current.forEach((item, index) => {
      if (item) {
        gsap.fromTo(
          item,
          { x: isDesktop ? 30 : -20, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.5,
            delay: 0.3 + index * 0.1,
            ease: "power2.out",
          },
        )
      }
    })

    // Add resize listener for responsive animations
    const handleResize = () => {
      // Refresh animations on resize if needed
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle success popup animation with GSAP
  useEffect(() => {
    if (showSuccess && successPopupRef.current) {
      gsap.fromTo(
        successPopupRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
      )
    } else if (successPopupRef.current) {
      gsap.to(successPopupRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: "power3.in",
      })
    }
  }, [showSuccess])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* Header */}
      <div
        ref={headerRef}
        className={`sticky top-0 z-10 flex items-center justify-between p-4 md:p-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-md`}
      >
        <div className="flex items-center">
          <Link
            className={`text-xl ${
              darkMode ? "text-white" : "text-black"
            } hover:bg-opacity-10 hover:bg-black p-2 rounded-full transition-all`}
            to={`/profile/${routeId}`}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="align-middle hover:scale-110 transition-transform" />
          </Link>
          <span className={`text-xl pl-2 md:pl-4 font-medium ${darkMode ? "text-white" : "text-black"}`}>
            Account Information
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div
          ref={formCardRef}
          className={`max-w-2xl mx-auto rounded-2xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg overflow-hidden transition-all duration-300 p-6`}
        >
          <h3 className={`text-lg md:text-xl font-semibold mb-6 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Manage your personal information
          </h3>

          {user ? (
            <>
              {/* Verification Status */}
              <div
                ref={(el) => (formFieldsRef.current[0] = el)}
                className={`mb-6 p-3 rounded-lg flex items-center ${
                  user.verified
                    ? darkMode
                      ? "bg-green-900/30"
                      : "bg-green-50"
                    : darkMode
                      ? "bg-red-900/30"
                      : "bg-red-50"
                }`}
              >
                <FontAwesomeIcon
                  icon={user.verified ? faCheckCircle : faTimesCircle}
                  className={`mr-3 text-lg ${user.verified ? "text-green-500" : "text-red-500"}`}
                />
                <div>
                  <p
                    className={`font-medium ${
                      user.verified
                        ? darkMode
                          ? "text-green-300"
                          : "text-green-700"
                        : darkMode
                          ? "text-red-300"
                          : "text-red-700"
                    }`}
                  >
                    {user.verified ? "Verified Account" : "Not Verified"}
                  </p>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {user.verified
                      ? "Your account has been verified"
                      : "Please verify your account through the link sent to your email"}
                  </p>
                </div>
              </div>

              {/* User ID Display */}
              <div
                ref={(el) => (formFieldsRef.current[1] = el)}
                className={`mb-6 p-3 rounded-lg flex items-center ${darkMode ? "bg-gray-700/50" : "bg-gray-100"}`}
              >
                <FontAwesomeIcon
                  icon={faIdCard}
                  className={`mr-3 text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                />
                <div>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Account ID</p>
                  <p className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{user.passenger_id}</p>
                </div>
              </div>

              <Formik
                initialValues={{
                  passenger_name: user.passenger_name || "",
                  email: user.email || "",
                  password: "",
                  newPassword: "",
                }}
                validate={validate}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ isSubmitting, touched, errors, values, handleChange, setFieldValue }) => (
                  <Form className="space-y-6">
                    {error && (
                      <div
                        className={`p-3 rounded-lg ${darkMode ? "bg-red-900/30 border border-red-800" : "bg-red-50 border border-red-200"}`}
                      >
                        <p className={`text-sm ${darkMode ? "text-red-300" : "text-red-600"}`}>
                          <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                          {error}
                        </p>
                      </div>
                    )}
                    <div ref={(el) => (formFieldsRef.current[2] = el)} className="space-y-2">
                      <label
                        htmlFor="passenger_name"
                        className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FontAwesomeIcon
                            icon={faUser}
                            className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}
                          />
                        </div>
                        <input
                          type="text"
                          name="passenger_name"
                          id="passenger_name"
                          value={values.passenger_name}
                          onChange={handleChange}
                          className={`pl-10 block w-full rounded-lg py-3 ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-gray-50 border-gray-300 text-gray-900"
                          } ${
                            touched.passenger_name && errors.passenger_name ? "border-red-500" : "border-gray-300"
                          } focus:ring-green-500 focus:border-green-500`}
                        />
                      </div>
                      <ErrorMessage name="passenger_name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div ref={(el) => (formFieldsRef.current[3] = el)} className="space-y-2">
                      <label
                        htmlFor="email"
                        className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Email (Read only)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FontAwesomeIcon
                            icon={faEnvelope}
                            className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}
                          />
                        </div>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={values.email}
                          disabled
                          className={`pl-10 block w-full rounded-lg py-3 ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-gray-400"
                              : "bg-gray-100 border-gray-300 text-gray-500"
                          } cursor-not-allowed`}
                        />
                      </div>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Email cannot be changed
                      </p>
                    </div>

                    <div ref={(el) => (formFieldsRef.current[4] = el)} className="space-y-2">
                      <label
                        htmlFor="password"
                        className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Current Password *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FontAwesomeIcon
                            icon={faLock}
                            className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}
                          />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          id="password"
                          value={values.password}
                          onChange={handleChange}
                          className={`pl-10 pr-10 block w-full rounded-lg py-3 ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-gray-50 border-gray-300 text-gray-900"
                          } ${
                            touched.password && errors.password ? "border-red-500" : "border-gray-300"
                          } focus:ring-green-500 focus:border-green-500`}
                          placeholder="Enter current password"
                          required
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                            className={`${darkMode ? "text-gray-400" : "text-gray-500"} hover:text-gray-700`}
                          />
                        </button>
                      </div>
                      <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Required to update your information
                      </p>
                    </div>

                    <div ref={(el) => (formFieldsRef.current[5] = el)} className="space-y-2">
                      <label
                        htmlFor="newPassword"
                        className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FontAwesomeIcon
                            icon={faLock}
                            className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}
                          />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="newPassword"
                          id="newPassword"
                          value={values.newPassword}
                          onChange={handleChange}
                          className={`pl-10 pr-10 block w-full rounded-lg py-3 ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-gray-50 border-gray-300 text-gray-900"
                          } ${
                            touched.newPassword && errors.newPassword ? "border-red-500" : "border-gray-300"
                          } focus:ring-green-500 focus:border-green-500`}
                          placeholder="Enter new password (optional)"
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                            className={`${darkMode ? "text-gray-400" : "text-gray-500"} hover:text-gray-700`}
                          />
                        </button>
                      </div>
                      <ErrorMessage name="newPassword" component="div" className="text-red-500 text-sm mt-1" />
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Leave blank to keep current password
                      </p>
                    </div>

                    <div ref={(el) => (formFieldsRef.current[6] = el)} className="pt-4 flex gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setFieldValue("passenger_name", user.passenger_name || "")
                          setFieldValue("password", "")
                          setFieldValue("newPassword", "")
                        }}
                        className={`flex-1 py-3 px-4 rounded-lg ${
                          darkMode
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                        } transition-colors`}
                      >
                        Reset
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg ${
                          darkMode ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"
                        } text-white transition-colors ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                      >
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </>
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          )}
        </div>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            ref={successPopupRef}
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } p-4 rounded-lg shadow-lg border-l-4 border-green-500 max-w-sm`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Account information updated successfully!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
