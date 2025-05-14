"use client"

import { useState } from "react"
import { Formik, Form, Field } from "formik"
import { useNavigate, Link } from "react-router-dom"
import ReCAPTCHA from "react-google-recaptcha"
import { authenticate } from "../api/ApiService"
import { useAuth } from "../security/AuthProvider"

export default function AdminLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [capVal, setCapVal] = useState(null)

  const navigate = useNavigate()
  const { setToken } = useAuth()

  async function onSubmit(values) {
    const payload = {
      username: values.email,
      password: values.password,
    }
    setLoading(true)
    setError("")

    try {
      const response = await authenticate(payload)

      if (response.status === 200) {
        // Check if the email is the admin email
        if (values.email.toLowerCase() === "james@gmail.com") {
          setToken(response.data)
          navigate("/dashboard")
        } else {
          setError("Access denied. Admin privileges required.")
        }
      }
    } catch (error) {
      console.error(error)
      if (error.code === "ERR_NETWORK") {
        setError("Network error. Please try again later.")
      } else {
        setError("Invalid credentials. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-screen py-10 px-4">
      {/* Logo */}
      <div className="w-20 h-20">
        <img src="/images/Logo/logo.png" alt="Nepa Go Logo" className="w-full" />
      </div>

      {/* Main content */}
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold text-center mb-1">Admin Login</h1>
        <p className="text-[#45534A] text-sm text-center mb-6">Please login with admin credentials</p>

        <Formik initialValues={{ email: "", password: "" }} onSubmit={onSubmit}>
          {() => (
            <Form className="w-full max-w-md">
              {error && (
                <div className="text-center bg-red-200 border border-red-600 p-2 mb-3 rounded text-xs">
                  <p className="font-bold">{error}</p>
                </div>
              )}

              <div className="mb-3">
                <div className="flex items-center border border-[#45534A] rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mx-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <Field
                    className="flex-grow h-10 text-[#45534A] outline-none pl-2 text-xs sm:text-sm"
                    type="email"
                    name="email"
                    placeholder="Admin Email"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center border border-[#45534A] rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mx-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <Field
                    className="flex-grow h-10 text-[#45534A] outline-none pl-2 text-xs sm:text-sm"
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-center mb-4">
                <ReCAPTCHA sitekey="6LcZsKQqAAAAAPogApc4scGVCMoaeAglBDWB31nE" onChange={(val) => setCapVal(val)} />
              </div>

              <button
                className="bg-[#1D8F34] text-white text-sm sm:text-base w-full py-2 rounded-full disabled:opacity-50"
                type="submit"
                disabled={!capVal || loading}
              >
                {loading ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                  </div>
                ) : (
                  "Login as Admin"
                )}
              </button>

              <div className="flex items-center justify-center mt-4">
                <div className="border-t border-gray-300 flex-grow"></div>
                <span className="mx-4 text-xs text-gray-500">OR</span>
                <div className="border-t border-gray-300 flex-grow"></div>
              </div>

              <Link to="/login" className="block text-center">
                <button
                  type="button"
                  className="border border-[#45534A] text-[#45534A] text-sm sm:text-base w-full py-2 mt-4 rounded-full hover:bg-gray-50"
                >
                  Login as User
                </button>
              </Link>
            </Form>
          )}
        </Formik>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-[#45534A] text-xs sm:text-sm">
        Admin access only. Unauthorized access attempts will be logged.
      </div>
    </div>
  )
}
