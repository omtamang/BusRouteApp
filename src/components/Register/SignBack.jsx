"use client"

import { useState } from "react"
import { Formik, Form, Field } from "formik"
import { Link, useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faLock, faUser } from "@fortawesome/free-solid-svg-icons"
import { signup } from "../api/ApiService"
import ReCAPTCHA from "react-google-recaptcha"

export default function SignBack() {
  const [userExist, setExist] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [capVal, setCapVal] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(values) {
    const passenger = {
      passenger_name: values.name,
      email: values.email,
      password: values.password,
    }
    setLoading(true)
    try {
      const response = await signup(passenger)
      if (response.status === 201) {
        setShowPopup(true)
        setTimeout(() => {
          setShowPopup(false)
          navigate("/verification/" + values.email)
        }, 3000)
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setExist(true)
        setLoading(false)
      } else {
        console.log(error)
      }
    }
  }

  const googleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google"
  }

  return (
    <div className="flex flex-col justify-between h-screen p-4 overflow-hidden">
      <div className="flex-shrink-0">
        <img src="/images/Logo/logo.png" alt="logo" className="mx-auto w-12 sm:w-16" />
      </div>

      <div className="flex-grow flex flex-col justify-center">
        <h1 className="text-center text-xl sm:text-2xl font-semibold mb-1">Sign Up</h1>
        <p className="text-center text-[#45534A] text-xs sm:text-sm mb-4">
          Fill up the details to continue with our app
        </p>

        <Formik initialValues={{ name: "", email: "", password: "" }} onSubmit={onSubmit}>
          {() => (
            <Form className="w-full max-w-xs mx-auto text-xs sm:text-sm text-[#45534A]">
              <div className="mb-2">
                <div className="flex items-center border border-[#45534A] rounded-xl">
                  <FontAwesomeIcon icon={faUser} className="p-2 text-sm" />
                  <Field
                    className="flex-grow h-8 sm:h-10 text-[#45534A] outline-none pl-2 text-xs sm:text-sm"
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    required
                  />
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center border border-[#45534A] rounded-xl">
                  <FontAwesomeIcon icon={faEnvelope} className="p-2 text-sm" />
                  <Field
                    className="flex-grow h-8 sm:h-10 text-[#45534A] outline-none pl-2 text-xs sm:text-sm"
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                  />
                </div>
              </div>

              {userExist && <div className="text-red-500 text-xs mb-2">Email already exists.</div>}

              <div className="mb-1">
                <div className="flex items-center border border-[#45534A] rounded-xl">
                  <FontAwesomeIcon icon={faLock} className="p-2 text-sm" />
                  <Field
                    className="flex-grow h-8 sm:h-10 text-[#45534A] outline-none pl-2 text-xs sm:text-sm"
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>

              <div className="text-xs mb-2">Password must be 8 characters</div>

              <div className="flex justify-center mb-2 transform scale-75 origin-top">
                <ReCAPTCHA sitekey="6LcZsKQqAAAAAPogApc4scGVCMoaeAglBDWB31nE" onChange={(val) => setCapVal(val)} />
              </div>

              <button
                className="bg-[#1D8F34] text-white text-sm sm:text-base w-full py-2 rounded-full disabled:opacity-50"
                type="submit"
                disabled={!capVal}
              >
                {loading ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                  </div>
                ) : (
                  "Sign Up"
                )}
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <div className="flex-shrink-0">
        <div className="text-center text-xs sm:text-sm text-[#45534A] mb-2">
          Already have an account?{" "}
          <Link to="/login" className="text-[#AC1A0F]">
            Login
          </Link>
        </div>

        <div className="flex items-center justify-center mb-2">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="px-2 text-xs text-gray-500">Or</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <button
          onClick={googleLogin}
          className="flex items-center justify-center border border-gray-300 rounded-full py-2 px-4 w-full max-w-xs mx-auto text-xs sm:text-sm"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
            className="w-4 h-4 mr-2"
            alt="Google Icon"
          />
          <span className="font-semibold">Continue with Google</span>
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg w-64 text-center">
            <h2 className="text-base font-bold mb-2 text-green-600">Details Received!</h2>
            <div className="flex items-center justify-center mb-2">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-green-600"></div>
            </div>
            <p className="text-xs text-gray-700">Please verify your email...</p>
          </div>
        </div>
      )}
    </div>
  )
}

