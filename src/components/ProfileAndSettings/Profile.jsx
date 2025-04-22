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
  faHistory,
  faEdit,
} from "@fortawesome/free-solid-svg-icons"
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
  const statsRef = useRef(null)
  const headerRef = useRef(null)
  const actionsRef = useRef(null)
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
      const response = await deleteEmail(user)
      console.log(response)
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

    // Check if window width is desktop or mobile
    const isDesktop = window.innerWidth >= 768

    // Header animation
    gsap.fromTo(headerRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })

    // Profile card animation
    gsap.fromTo(
      profileCardRef.current,
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

    // Stats animation
    gsap.fromTo(
      statsRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, delay: 0.4, ease: "back.out(1.7)" },
    )

    // Menu items animation with stagger
    menuItemsRef.current.forEach((item, index) => {
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
    })

    // Actions animation
    gsap.fromTo(
      actionsRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: 0.8, ease: "power3.out" },
    )

    // Add resize listener for responsive animations
    const handleResize = () => {
      // Refresh animations on resize if needed
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle popup animation with GSAP
  useEffect(() => {
    if (showPopup && popupRef.current) {
      gsap.fromTo(
        popupRef.current,
        { y: window.innerWidth >= 768 ? 50 : "100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.5, ease: "power3.out" },
      )
    } else if (popupRef.current) {
      gsap.to(popupRef.current, {
        y: window.innerWidth >= 768 ? 50 : "100%",
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
            to={`/map/${routeId}`}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="align-middle hover:scale-110 transition-transform" />
          </Link>
          <span className={`text-xl pl-2 md:pl-4 font-medium ${darkMode ? "text-white" : "text-black"}`}>
            Profile and settings
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              darkMode ? "border-gray-700 text-white" : "border-gray-300 text-gray-700"
            } hover:bg-opacity-10 hover:bg-black transition-colors`}
          >
            <FontAwesomeIcon icon={faMoon} className="w-4 h-4" />
            <span className="text-sm">{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button
            onClick={() => {
              setToken()
              navigate("/")
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Profile Card (Full width on mobile, 1/3 on desktop) */}
          <div className="w-full md:w-1/3">
            <div
              ref={profileCardRef}
              className={`rounded-2xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              } shadow-lg overflow-hidden transition-all duration-300`}
            >
              <div className="h-32 md:h-40 bg-green-500 relative">
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/50 to-transparent">
                  <h2 className="text-xl md:text-2xl font-bold text-white">{user || "User Name"}</h2>
                  <p className="text-sm text-white/80">Passenger</p>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <div className="flex items-center mb-4 md:mb-6">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvetk9tOwHkQMwe1DfoxempOXosaikcVL5QQ&s"
                    alt="User"
                    className="rounded-full w-16 h-16 md:w-20 md:h-20 object-cover border-4 border-white shadow-md"
                  />
                  <div className="ml-4">
                    <button className="px-3 py-1.5 rounded-lg border border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors text-sm">
                      <FontAwesomeIcon icon={faEdit} className="mr-2" />
                      Edit Profile
                    </button>
                  </div>
                </div>

                <div ref={statsRef} className="grid grid-cols-3 gap-2 md:gap-4">
                  <div className={`text-center p-2 md:p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                    <p className="text-lg md:text-2xl font-semibold">12</p>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Trips</p>
                  </div>
                  <div className={`text-center p-2 md:p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                    <p className="text-lg md:text-2xl font-semibold">4.8</p>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Rating</p>
                  </div>
                  <div className={`text-center p-2 md:p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                    <p className="text-lg md:text-2xl font-semibold">3</p>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Years</p>
                  </div>
                </div>

                <div ref={actionsRef} className="mt-4 md:mt-6 space-y-2 md:space-y-3">
                  <button className="w-full py-2 px-4 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors">
                    <FontAwesomeIcon icon={faHistory} className="mr-2" />
                    View Trip History
                  </button>
                  <button
                    className="w-full py-2 px-4 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    onClick={() => setShowPopup(true)}
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Settings (Full width on mobile, 2/3 on desktop) */}
          <div className="w-full md:w-2/3 mt-6 md:mt-0">
            <div className={`rounded-2xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg p-4 md:p-6`}>
              <h3
                className={`text-lg md:text-xl font-semibold mb-4 md:mb-6 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Settings
              </h3>

              <div className="grid gap-3 md:gap-4">
                <div
                  ref={(el) => (menuItemsRef.current[0] = el)}
                  className={`flex items-center justify-between p-3 md:p-4 rounded-xl ${
                    darkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"
                  } transition-colors cursor-pointer`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                        darkMode ? "bg-green-900" : "bg-green-100"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faIdCard}
                        className={`text-sm md:text-base ${darkMode ? "text-green-300" : "text-green-600"}`}
                      />
                    </div>
                    <div className="ml-3 md:ml-4">
                      <h4 className="font-medium text-sm md:text-base">Account Information</h4>
                      <p className={`text-xs md:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Manage your personal information
                      </p>
                    </div>
                  </div>
                  <span className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}>&#11208;</span>
                </div>

                <div
                  ref={(el) => (menuItemsRef.current[1] = el)}
                  className={`flex items-center justify-between p-3 md:p-4 rounded-xl ${
                    darkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"
                  } transition-colors cursor-pointer`}
                >
                  <div className="flex items-center" onClick={() => {
                    navigate(`/notification/${routeId}`)
                  }}>
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                        darkMode ? "bg-green-900" : "bg-green-100"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faBell}
                        className={`text-sm md:text-base ${darkMode ? "text-green-300" : "text-green-600"}`}
                      />
                    </div>
                    <div className="ml-3 md:ml-4">
                      <h4 className="font-medium text-sm md:text-base">Notifications</h4>
                      <p className={`text-xs md:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Configure your notification preferences
                      </p>
                    </div>
                  </div>
                  <span className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}>&#11208;</span>
                </div>

                <div
                  ref={(el) => (menuItemsRef.current[2] = el)}
                  className={`flex items-center justify-between p-3 md:p-4 rounded-xl ${
                    darkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"
                  } transition-colors cursor-pointer`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                        darkMode ? "bg-green-900" : "bg-green-100"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faShield}
                        className={`text-sm md:text-base ${darkMode ? "text-green-300" : "text-green-600"}`}
                      />
                    </div>
                    <div className="ml-3 md:ml-4">
                      <h4 className="font-medium text-sm md:text-base">Privacy & Security</h4>
                      <p className={`text-xs md:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Manage your security preferences
                      </p>
                    </div>
                  </div>
                  <span className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}>&#11208;</span>
                </div>

                <div
                  ref={(el) => (menuItemsRef.current[3] = el)}
                  onClick={toggleDarkMode}
                  className={`flex items-center justify-between p-3 md:p-4 rounded-xl ${
                    darkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"
                  } transition-colors cursor-pointer md:hidden`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                        darkMode ? "bg-green-900" : "bg-green-100"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faMoon}
                        className={`text-sm md:text-base ${darkMode ? "text-green-300" : "text-green-600"}`}
                      />
                    </div>
                    <div className="ml-3 md:ml-4">
                      <h4 className="font-medium text-sm md:text-base">Dark Mode</h4>
                      <p className={`text-xs md:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Toggle dark mode appearance
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-10 h-5 md:w-12 md:h-6 rounded-full relative ${
                      darkMode ? "bg-green-600" : "bg-gray-300"
                    } transition-colors`}
                  >
                    <div
                      className={`absolute w-4 h-4 md:w-5 md:h-5 rounded-full bg-white top-0.5 transition-transform ${
                        darkMode ? "translate-x-5 md:translate-x-6" : "translate-x-0.5"
                      }`}
                    ></div>
                  </div>
                </div>

                <div
                  ref={(el) => (menuItemsRef.current[4] = el)}
                  className={`flex items-center justify-between p-3 md:p-4 rounded-xl ${
                    darkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"
                  } transition-colors cursor-pointer`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                        darkMode ? "bg-green-900" : "bg-green-100"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faGear}
                        className={`text-sm md:text-base ${darkMode ? "text-green-300" : "text-green-600"}`}
                      />
                    </div>
                    <div className="ml-3 md:ml-4">
                      <h4 className="font-medium text-sm md:text-base">App Settings</h4>
                      <p className={`text-xs md:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Configure app preferences
                      </p>
                    </div>
                  </div>
                  <span className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}>&#11208;</span>
                </div>

                {/* Mobile-only logout button */}
                <div
                  ref={(el) => (menuItemsRef.current[5] = el)}
                  onClick={() => {
                    setToken()
                    navigate("/")
                  }}
                  className={`md:hidden flex items-center p-3 md:p-4 rounded-xl ${
                    darkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"
                  } transition-colors cursor-pointer`}
                >
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                      darkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={faRightFromBracket}
                      className={`text-sm md:text-base ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                    />
                  </div>
                  <div className="ml-3 md:ml-4">
                    <h4 className="font-medium text-sm md:text-base">Logout</h4>
                    <p className={`text-xs md:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Sign out of your account
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4">
          <div
            ref={popupRef}
            className={`${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            } p-5 md:p-6 rounded-t-3xl md:rounded-3xl w-full max-w-sm md:max-w-md border-t-4 border-green-500 md:transform md:translate-y-0`}
          >
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl md:text-2xl font-bold">Delete account?</h1>
              <button
                onClick={() => setShowPopup(false)}
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
                  darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                } transition-colors`}
              >
                <FontAwesomeIcon icon={faXmark} className="text-red-500" />
              </button>
            </div>

            <p className="text-base md:text-lg mb-5 md:mb-6">
              All data associated with your account will be permanently deleted. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                className={`flex-1 py-2.5 md:py-3 rounded-lg text-sm md:text-base ${
                  darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                } transition-colors`}
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2.5 md:py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors text-sm md:text-base"
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div
            className={`${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            } p-5 md:p-6 rounded-lg max-w-xs w-full text-center shadow-xl`}
            style={{
              animation: "fadeInUp 0.5s ease-out forwards",
            }}
          >
            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faCheck} className="text-green-500 text-2xl md:text-3xl" />
            </div>
            <h2 className="text-lg md:text-xl font-bold mb-2">Account Deleted</h2>
            <p className={`text-sm md:text-base mb-0 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
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
