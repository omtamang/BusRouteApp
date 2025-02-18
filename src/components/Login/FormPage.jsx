"use client"

import { useState } from "react"
import { Formik, Form, Field } from "formik"
import { Link, useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons"
import { authenticate } from "../api/ApiService"
import { useAuth } from "../security/AuthProvider"
import ReCAPTCHA from "react-google-recaptcha"

export default function FormPage() {
  const [loading, setLoading] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [capVal, setCapVal] = useState(null)
  const [verified, setVerified] = useState(true)

  const navigate = useNavigate()
  const { setToken } = useAuth()

  function verifyAccount() {
    navigate("/login/verification")
  }

  async function onSubmit(values) {
    const payload = {
      username: values.name,
      password: values.password,
    }
    setLoading(true)

    try {
      const response = await authenticate(payload)
      if (response.status === 200) {
        setInvalid(false)
        setToken(response.data)
        navigate("/bus-route")
      }
    } catch (error) {
      console.log(error.code)
      if (error.status === 406) {
        setVerified(false)
        setInvalid(false)
      }
      if (error.code === "ERR_NETWORK") {
        setInvalid(true)
        setVerified(true)
      }
      setLoading(false)
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
        <h1 className="text-center text-xl sm:text-2xl font-semibold mb-1">Login</h1>
        <p className="text-center text-[#45534A] text-xs sm:text-sm mb-4">Please login to continue with the app</p>

        <Formik initialValues={{ name: "", password: "" }} onSubmit={onSubmit}>
          {() => (
            <Form className="w-full max-w-xs mx-auto text-xs sm:text-sm text-[#45534A]">
              {invalid && (
                <div className="text-center bg-red-200 border border-red-600 p-1 mb-2 rounded text-xs">
                  <p className="font-bold">Wrong Credentials</p>
                  <p>Invalid User or Password</p>
                </div>
              )}

              {!verified && (
                <div className="text-center bg-red-200 border border-red-600 p-1 mb-2 rounded text-xs">
                  <p className="font-bold">Email not verified</p>
                  <button className="text-blue-500 underline" onClick={verifyAccount}>
                    Verify
                  </button>
                </div>
              )}

              <div className="mb-2">
                <div className="flex items-center border border-[#45534A] rounded-xl">
                  <FontAwesomeIcon icon={faEnvelope} className="p-2 text-sm" />
                  <Field
                    className="flex-grow h-8 sm:h-10 text-[#45534A] outline-none pl-2 text-xs sm:text-sm"
                    type="text"
                    name="name"
                    placeholder="Email Address"
                    required
                  />
                </div>
              </div>

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

              <div className="text-right text-xs mb-2">Forgot password?</div>

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
                  "Login"
                )}
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <div className="flex-shrink-0">
        <div className="text-center text-xs sm:text-sm text-[#45534A] mb-2">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#AC1A0F]">
            Sign Up
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
    </div>
  )
}

