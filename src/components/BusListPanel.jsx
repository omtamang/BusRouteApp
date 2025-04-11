"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"

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

const ClockIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
)

const SpeedIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 14 4-4"></path>
    <path d="M3.34 19a10 10 0 1 1 17.32 0"></path>
  </svg>
)

export default function BusListPanel({ routeId, isOpen, onClose, getRouteByid, getStopByRouteId, getBusByRouteId }) {
  const [route, setRoute] = useState(null)
  const [stop, setStop] = useState(null)
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const panelRef = useRef(null)
  const busItemsRef = useRef([])
  const overlayRef = useRef(null)

  // Reset refs when buses change
  useEffect(() => {
    busItemsRef.current = busItemsRef.current.slice(0, buses.length)
  }, [buses])

  useEffect(() => {
    if (isOpen && routeId) {
      setLoading(true)
      setIsVisible(true)
      fetchData()
    }
  }, [routeId, isOpen])

  // Handle close button click
  const handleClose = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    
    // Ensure onClose is called
    if (typeof onClose === 'function') {
      // Animate panel out
      const tl = gsap.timeline({
        onComplete: () => {
          setIsVisible(false);
          setIsAnimating(false);
          onClose();
        },
      });

      tl.to(panelRef.current, {
        x: "-100%",
        duration: 0.4,
        ease: "power3.in",
      });

      if (overlayRef.current) {
        tl.to(
          overlayRef.current,
          {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
          },
          "-=0.3"
        );
      }
    } else {
      console.error("onClose is not a function");
      setIsVisible(false);
      setIsAnimating(false);
    }
  };

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

      // Animate bus items after panel slides in
      if (!loading && buses.length > 0) {
        tl.fromTo(
          busItemsRef.current,
          {
            x: -50,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.4,
            ease: "power2.out",
          },
          "-=0.2", // Start slightly before the panel animation finishes
        )
      }
    }
  }, [isOpen, loading, buses.length])

  async function fetchData() {
    try {
      const routeResponse = await getRouteByid(routeId)
      const busResponse = await getBusByRouteId(routeId)

      if (routeResponse && routeResponse.data) {
        setRoute(routeResponse.data)
      }

      if (busResponse && busResponse.data) {
        const busData = Array.isArray(busResponse.data) ? busResponse.data : [busResponse.data]
        setBuses(busData)
      }
    } catch (error) {
      console.error("Error fetching route or stop data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Get color based on arrival time
  const getArrivalTimeColor = (time) => {
    if (time === null) return "text-gray-400"
    if (time <= 3) return "text-red-500"
    if (time <= 10) return "text-amber-500"
    return "text-green-500"
  }

  // Get speed indicator
  const getSpeedIndicator = (speed) => {
    if (speed >= 40) return "bg-green-500"
    if (speed >= 25) return "bg-amber-500"
    return "bg-red-500"
  }

  // Format arrival time to display "-- minutes" if null
  const formatArrivalTime = (time) => {
    if (time === null) return "-- "
    return `${time} `
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
            <h2 className="text-xl font-bold mb-1">Nearest Bus Route</h2>
            <div className="flex items-center">
              <BusIcon className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{buses.length} buses available</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/30 transition-colors z-20"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Bus List */}
        <div className="overflow-y-auto h-[calc(100%-64px)] pb-4">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 text-green-600">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium">Loading buses...</p>
            </div>
          ) : (
            <div>
              {buses.map((bus, index) => (
                <div
                  key={bus.id}
                  ref={(el) => (busItemsRef.current[index] = el)}
                  className="mx-3 my-3 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-4">
                    {/* Bus number and speed */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-br from-green-600 to-green-500 text-white p-2 rounded-lg mr-3 shadow-sm">
                          <BusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">Bus {bus.busNo}</h3>
                          <div className="flex items-center text-xs text-gray-500">
                            <div className={`w-2 h-2 rounded-full ${getSpeedIndicator(bus.speed)} mr-1`}></div>
                            <span>Moving</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center bg-gray-100 px-2 py-1 rounded-lg">
                        <SpeedIcon className="w-4 h-4 text-gray-500 mr-1" />
                        <span className="text-sm font-medium">{parseFloat(bus.speed).toFixed(1)} km/h</span>
                      </div>
                    </div>

                    {/* Next stop and arrival time */}
                    <div className="pl-12 space-y-2">
                      <div className="flex items-center text-gray-700">
                        <MapPinIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">
                          Next Stop: <span className="font-medium">{bus.nextStop}</span>
                        </span>
                      </div>

                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">Arrival: </span> 
                        <span className={`text-sm font-bold ml-1 ${getArrivalTimeColor(bus.arrivalTime)}`}>
                          {formatArrivalTime(bus.approximate_arrival_time)}
                          <span className="font-normal">minutes</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress bar for arrival time */}
                    {bus.arrivalTime !== null && (
                      <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getArrivalTimeColor(bus.approximate_arrival_time)}`}
                          style={{
                            width: `${Math.max(5, 100 - bus.arrivalTime * 10)}%`,
                            transition: "width 1s ease-in-out",
                          }}
                        ></div>
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
