"use client"

import { useRef } from "react"
import Popup from "reactjs-popup"
import "reactjs-popup/dist/index.css"
import { useAuth } from "../security/AuthProvider"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { gsap } from "gsap"

export default function Logout({ darkMode }) {
  const { setToken } = useAuth()
  const navigate = useNavigate()
  const popupRef = useRef(null)

  async function handleLogout() {
    await setToken()
    navigate("/login")
  }

  // Animation for the popup
  const animatePopup = (open) => {
    if (!popupRef.current) return

    if (open) {
      gsap.fromTo(
        popupRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" },
      )
    } else {
      gsap.to(popupRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      })
    }
  }

  // Custom styles to override the default white background
  const popupStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modal: {
      background: "transparent",
      border: "none",
      boxShadow: "none",
      padding: 0,
      width: "auto",
      maxWidth: "400px",
    },
  }

  return (
    <div>
      <Popup
        trigger={
          <button
            className={`flex items-center font-medium transition duration-300 ${darkMode ? "text-white" : "text-gray-800"}`}
          >
            <span>Logout</span>
          </button>
        }
        modal
        nested
        onOpen={() => setTimeout(() => animatePopup(true), 0)}
        onClose={() => animatePopup(false)}
        contentStyle={popupStyles.modal}
        overlayStyle={popupStyles.overlay}
      >
        {(close) => (
          <div
            ref={popupRef}
            className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"} p-6 rounded-xl shadow-xl text-center mx-auto border-t-4 border-red-500`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Log Out</h2>
              <button
                onClick={close}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"} transition-colors`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faRightFromBracket} className="text-red-500 text-2xl" />
              </div>
              <p className="text-lg">Are you sure you want to log out of your account?</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={close}
                className={`flex-1 py-3 rounded-lg ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </Popup>

      {/* Add custom styles to override the default popup styles */}
      <style jsx global>{`
        /* Override the default white background of the popup */
        .popup-overlay {
          background: rgba(0, 0, 0, 0.5) !important;
        }
        
        /* Remove default popup content styles */
        .popup-content {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          width: auto !important;
          max-width: 400px !important;
          margin: auto !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  )
}

