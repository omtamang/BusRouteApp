"use client"

import { useEffect, useState, useRef } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { gsap } from "gsap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowLeft,
  faBell,
  faCheck,
  faIdCard,
  faRightFromBracket,
  faTrash,
  faXmark,
  faShield,
  faMoon,
  faGear,
} from "@fortawesome/free-solid-svg-icons"
import Logout from "../Logout/Logout"
import { deleteEmail, getPassenger } from "../api/ApiService"
import { useAuth } from "../security/AuthProvider"

export default function Profile() {
  const [user, setUser] = useState("")
  const [showPopup, setShowPopup] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const navigate = useNavigate()
  const popupRef = useRef(null)
  const profileCardRef = useRef(null)
  const menuItemsRef = useRef([])
  const { setToken } = useAuth()
  const { routeId } = useParams()

  async function userInfo() {
    try {
      const response = await getPassenger()
      setUser(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  async function deleteUser() {
    try {
      await deleteEmail(user)
      setShowDelete(true)
      setTimeout(() => {
        setShowDelete(false)
        setToken()
        navigate("/")
      }, 3000)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    userInfo()

    // Initial animations
    gsap.fromTo(profileCardRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" })

    menuItemsRef.current.forEach((item, index) => {
      gsap.fromTo(
        item,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.2 + index * 0.1,
          ease: "power2.out",
        },
      )
    })
  }, [])

  // Handle popup animation with GSAP
  useEffect(() => {
    if (showPopup) {
      gsap.fromTo(
        popupRef.current,
        { y: "100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.5, ease: "power3.out" },
      )
    } else if (popupRef.current) {
      gsap.to(popupRef.current, {
        y: "100%",
        opacity: 0,
        duration: 0.4,
        ease: "power3.in",
      })
    }
  }, [showPopup])

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"}`}
    >
      {/* Header */}
      <div className={`sticky top-0 z-10 flex items-center p-4 ${darkMode ? "bg-gray-800" : "bg-white"} shadow-md`}>
        <Link className={`text-xl ${darkMode ? "text-white" : "text-black"}`} to={`/map/${routeId}`}>
          <FontAwesomeIcon icon={faArrowLeft} className="align-middle hover:scale-110 transition-transform" />
        </Link>
        <span className={`text-xl pl-4 font-medium ${darkMode ? "text-white" : "text-black"}`}>
          Profile and settings
        </span>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Profile Card */}
        <div
          ref={profileCardRef}
          className={`rounded-2xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg p-6 mb-6 transition-all duration-300`}
        >
          <div className="relative">
            <div className={`h-24 rounded-t-xl ${darkMode ? "bg-indigo-900" : "bg-indigo-500"} mb-12`}></div>
            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-10">
              <div className={`p-1 rounded-full ${darkMode ? "bg-gray-700" : "bg-white"}`}>
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvetk9tOwHkQMwe1DfoxempOXosaikcVL5QQ&s"
                  alt="User"
                  className="rounded-full w-20 h-20 object-cover border-4 border-white"
                />
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <h2 className="text-xl font-bold truncate">{user || "User Name"}</h2>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Passenger</p>
          </div>

          <div className="flex justify-center mt-4 space-x-4">
            <div className={`text-center px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <p className="text-lg font-semibold">12</p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Trips</p>
            </div>
            <div className={`text-center px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <p className="text-lg font-semibold">4.8</p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Rating</p>
            </div>
            <div className={`text-center px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <p className="text-lg font-semibold">3</p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Years</p>
            </div>
          </div>
        </div>

        {/* Settings Menu */}
        <div className={`rounded-2xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg p-4 mb-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Settings</h3>

          <div className="space-y-3">
            <div
              ref={(el) => (menuItemsRef.current[0] = el)}
              className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors cursor-pointer`}
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? "bg-blue-900" : "bg-blue-100"}`}
                >
                  <FontAwesomeIcon icon={faIdCard} className={`${darkMode ? "text-blue-300" : "text-blue-600"}`} />
                </div>
                <span className="pl-4">Account Information</span>
              </div>
              <span className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}>&#11208;</span>
            </div>

            <div
              ref={(el) => (menuItemsRef.current[1] = el)}
              className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors cursor-pointer`}
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? "bg-purple-900" : "bg-purple-100"}`}
                >
                  <FontAwesomeIcon icon={faBell} className={`${darkMode ? "text-purple-300" : "text-purple-600"}`} />
                </div>
                <span className="pl-4">Set Notification</span>
              </div>
              <span className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}>&#11208;</span>
            </div>

            <div
              ref={(el) => (menuItemsRef.current[2] = el)}
              className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors cursor-pointer`}
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? "bg-green-900" : "bg-green-100"}`}
                >
                  <FontAwesomeIcon icon={faShield} className={`${darkMode ? "text-green-300" : "text-green-600"}`} />
                </div>
                <span className="pl-4">Privacy & Security</span>
              </div>
              <span className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}>&#11208;</span>
            </div>

            <div
              ref={(el) => (menuItemsRef.current[3] = el)}
              onClick={toggleDarkMode}
              className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors cursor-pointer`}
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? "bg-yellow-900" : "bg-yellow-100"}`}
                >
                  <FontAwesomeIcon icon={faMoon} className={`${darkMode ? "text-yellow-300" : "text-yellow-600"}`} />
                </div>
                <span className="pl-4">Dark Mode</span>
              </div>
              <div
                className={`w-12 h-6 rounded-full relative ${darkMode ? "bg-indigo-600" : "bg-gray-300"} transition-colors`}
              >
                <div
                  className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-transform ${darkMode ? "translate-x-6" : "translate-x-0.5"}`}
                ></div>
              </div>
            </div>

            <div
              ref={(el) => (menuItemsRef.current[4] = el)}
              className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors cursor-pointer`}
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? "bg-orange-900" : "bg-orange-100"}`}
                >
                  <FontAwesomeIcon icon={faGear} className={`${darkMode ? "text-orange-300" : "text-orange-600"}`} />
                </div>
                <span className="pl-4">App Settings</span>
              </div>
              <span className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}>&#11208;</span>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className={`rounded-2xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg p-4`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Account</h3>

          <div className="space-y-3">
            <div
              ref={(el) => (menuItemsRef.current[5] = el)}
              className={`flex items-center p-3 rounded-xl ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors cursor-pointer`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
              >
                <FontAwesomeIcon
                  icon={faRightFromBracket}
                  className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
                />
              </div>
              <div>
                <Logout darkMode={darkMode} />
              </div>
            </div>

            <div
              ref={(el) => (menuItemsRef.current[6] = el)}
              onClick={() => setShowPopup(true)}
              className={`flex items-center p-3 rounded-xl ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors cursor-pointer`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? "bg-red-900" : "bg-red-100"}`}
              >
                <FontAwesomeIcon icon={faTrash} className="text-red-500" />
              </div>
              <span className="pl-4 text-red-500">Delete Account</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
          <div
            ref={popupRef}
            className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"} p-6 rounded-t-3xl w-full max-w-md border-t-4 border-red-500`}
          >
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Delete account?</h1>
              <button
                onClick={() => setShowPopup(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"} transition-colors`}
              >
                <FontAwesomeIcon icon={faXmark} className="text-red-500" />
              </button>
            </div>

            <p className="text-lg mb-6">
              All data associated with your account will be permanently deleted. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                className={`flex-1 py-3 rounded-lg ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"} transition-colors`}
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                onClick={deleteUser}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"} p-6 rounded-lg max-w-xs w-full text-center shadow-xl`}
            style={{
              animation: "fadeInUp 0.5s ease-out forwards",
            }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faCheck} className="text-green-500 text-3xl" />
            </div>
            <h2 className="text-xl font-bold mb-2">Account Deleted</h2>
            <p className={`mb-0 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Your account has been successfully deleted.
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

