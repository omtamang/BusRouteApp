"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { getStopByRouteId } from "./api/ApiService"

// Enhanced SVG icons
const BusIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 6v6"></path>
    <path d="M15 6v6"></path>
    <path d="M2 12h19.6"></path>
    <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8L.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path>
    <circle cx="7" cy="18" r="2"></circle>
    <circle cx="15" cy="18" r="2"></circle>
  </svg>
)

const MapPinIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
)

const XIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>
)

const LocationIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
)

const RouteIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18"></path>
    <path d="m7 17 4-4 4 4 6-6"></path>
  </svg>
)

export default function StopsListPanel({ routeId, isOpen, onClose }) {
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [routeName, setRouteName] = useState("")

  const panelRef = useRef(null)
  const stopItemsRef = useRef([])
  const overlayRef = useRef(null)

  // Reset refs when stops change
  useEffect(() => {
    stopItemsRef.current = stopItemsRef.current.slice(0, stops.length)
  }, [stops])

  useEffect(() => {
    if (isOpen && routeId) {
      setLoading(true)
      setIsVisible(true)
      fetchStops()
    }
  }, [routeId, isOpen])

  // Handle close button click
  const handleClose = () => {
    if (isAnimating) return

    setIsAnimating(true)

    // Ensure onClose is called
    if (typeof onClose === "function") {
      // Animate panel out
      const tl = gsap.timeline({
        onComplete: () => {
          setIsVisible(false)
          setIsAnimating(false)
          onClose()
        },
      })

      tl.to(panelRef.current, {
        x: "-100%",
        duration: 0.4,
        ease: "power3.in",
      })

      if (overlayRef.current) {
        tl.to(
          overlayRef.current,
          {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
          },
          "-=0.3",
        )
      }
    } else {
      console.error("onClose is not a function")
      setIsVisible(false)
      setIsAnimating(false)
    }
  }

  // GSAP animation for panel sliding
  useEffect(() => {
    if (!panelRef.current) return

    setIsAnimating(true)

    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false)
      },
    })

    if (isOpen) {
      setIsVisible(true)

      // Panel slide in
      tl.fromTo(
        panelRef.current,
        { x: "-100%" },
        {
          x: 0,
          duration: 0.5,
          ease: "power3.out",
        },
      )

      // Fade in overlay
      if (overlayRef.current) {
        tl.fromTo(
          overlayRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
          },
          "-=0.4",
        )
      }

      // Animate stop items after panel slides in
      if (!loading && stops.length > 0) {
        tl.fromTo(
          stopItemsRef.current,
          {
            x: -50,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            stagger: 0.05,
            duration: 0.4,
            ease: "power2.out",
          },
          "-=0.2", // Start slightly before the panel animation finishes
        )
      }
    }
  }, [isOpen, loading, stops.length])

  async function fetchStops() {
    try {
      const response = await getStopByRouteId(routeId)

      if (response && response.data) {
        const stopsData = Array.isArray(response.data) ? response.data : [response.data]
        setStops(stopsData)

        // If we have stops and the first stop has a route with a name, set the route name
        if (stopsData.length > 0 && stopsData[0].route && stopsData[0].route.route_name) {
          setRouteName(stopsData[0].route.route_name)
        }
      }
    } catch (error) {
      console.error("Error fetching stops data:", error)
    } finally {
      setLoading(false)
    }
  }

  // If panel is not visible, don't render anything
  if (!isVisible) return null

  return (
    <>
      {/* Overlay to capture clicks outside the panel */}
      <div ref={overlayRef} className="fixed inset-0 bg-black/30 z-40" onClick={handleClose}></div>

      <div
        ref={panelRef}
        className="fixed top-0 left-0 h-full w-[40%] min-w-[300px] bg-gradient-to-br from-white to-gray-50 shadow-2xl transform -translate-x-full z-50 rounded-r-2xl overflow-hidden"
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full translate-x-5 translate-y-10"></div>

          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-1">Route Stops</h2>
            <div className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{stops.length} stops available</span>
              {routeName && <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">{routeName}</span>}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleClose()
            }}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/30 transition-colors z-20"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Stops List */}
        <div className="overflow-y-auto h-[calc(100%-64px)] pb-4">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 text-green-600">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium">Loading stops...</p>
            </div>
          ) : (
            <div>
              {stops.map((stop, index) => (
                <div
                  key={stop.stop_id}
                  ref={(el) => (stopItemsRef.current[index] = el)}
                  className="mx-3 my-3 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-4">
                    {/* Stop name and ID */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-br from-green-600 to-green-500 text-white p-2 rounded-lg mr-3 shadow-sm">
                          <MapPinIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{stop.stop_name}</h3>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>Stop ID: {stop.stop_id}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Coordinates */}
                    {stop.lat !== undefined && stop.lng !== undefined && (
                      <div className="pl-12 space-y-2">
                        <div className="flex items-center text-gray-700">
                          <LocationIcon className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">
                            Location:{" "}
                            <span className="font-medium">
                              {stop.lat.toFixed(6)}, {stop.lng.toFixed(6)}
                            </span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
