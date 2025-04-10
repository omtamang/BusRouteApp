"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap, Polyline } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBus,
  faCircleStop,
  faLocationCrosshairs,
  faChevronLeft,
  faChevronRight,
  faRoute,
} from "@fortawesome/free-solid-svg-icons"
import { Link, useParams } from "react-router-dom"
import { getBusByRouteId, getRouteByid, getStopByRouteId } from "./api/ApiService"
import gsap from "gsap"

// Constants
const DEFAULT_CENTER = { lat: 27.7172, lon: 85.324 } // Kathmandu

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Custom icons with absolute URLs to ensure they load
const iconPerson = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
})

const iconStart = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
})

const iconEnd = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
})

// Updated bus icon without background, ready for rotation
const createBusIcon = (busId, rotation = 0, isSelected = false) => {
  const uniqueId = `bus-icon-${busId}`

  return L.divIcon({
    html: `<div id="${uniqueId}" class="bus-icon-container ${isSelected ? "selected" : ""}" style="transform: rotate(${rotation}deg)">
      <div class="bus-icon flex items-center justify-center w-9 h-9">
        <img src="/images/Logo/bus.png" class="w-14 h-14"/>
      </div>
    </div>`,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

// Calculate bearing between two points
function calculateBearing(startLat, startLng, destLat, destLng) {
  startLat = (startLat * Math.PI) / 180
  startLng = (startLng * Math.PI) / 180
  destLat = (destLat * Math.PI) / 180
  destLng = (destLng * Math.PI) / 180

  const y = Math.sin(destLng - startLng) * Math.cos(destLat)
  const x =
    Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng)
  let bearing = (Math.atan2(y, x) * 180) / Math.PI
  bearing = (bearing + 360) % 360 // Normalize to 0-360
  return bearing
}

// Find the closest point on the route to a given position
function findClosestPointOnRoute(position, routeCoordinates) {
  if (!routeCoordinates || routeCoordinates.length === 0) return null

  let closestPoint = null
  let minDistance = Number.POSITIVE_INFINITY

  for (let i = 0; i < routeCoordinates.length; i++) {
    const routePoint = routeCoordinates[i]
    const distance = calculateDistance(position[0], position[1], routePoint[0], routePoint[1])

    if (distance < minDistance) {
      minDistance = distance
      closestPoint = routePoint
    }
  }

  return closestPoint
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

// Calculate the direction of the road at a specific point
function calculateRoadDirection(position, routeCoordinates) {
  if (!routeCoordinates || routeCoordinates.length < 2) return 0

  // Find the closest point on the route
  const closestPoint = findClosestPointOnRoute(position, routeCoordinates)
  if (!closestPoint) return 0

  // Find the index of the closest point
  const closestIndex = routeCoordinates.findIndex(
    (point) => point[0] === closestPoint[0] && point[1] === closestPoint[1],
  )

  if (closestIndex === -1) return 0

  // Get the next point on the route to determine direction
  // If we're at the end of the route, use the previous point
  const nextIndex = closestIndex < routeCoordinates.length - 1 ? closestIndex + 1 : closestIndex - 1
  const nextPoint = routeCoordinates[nextIndex]

  // Calculate bearing between closest point and next point
  const bearing = calculateBearing(closestPoint[0], closestPoint[1], nextPoint[0], nextPoint[1])

  return bearing
}

// Bus information card component
function BusInfoCard({ bus, route, stop, onPrevBus, onNextBus, buses }) {
  if (!bus) return null

  const busNo = bus.busNo || `Bus ${bus.busId || "Unknown"}`
  const busName = bus.name || "NepaGo"
  const busSpeed = Number.parseFloat(bus.speed) || 0
  const nextStop = stop?.name || "Jawalakhel"
  const arrivalTime = bus.approximate_arrival_time || "6 minute"
  const routeInfo = route ? `${route.route_name || route.start_name + " - " + route.end_name}` : "Unknown Route"

  return (
    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-md">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex items-center p-3">
            <div className="flex-shrink-0 bg-green-500 text-white p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faBus} className="text-lg" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-lg">{busNo}</div>
                  <div className="text-sm text-gray-600">{busName}</div>
                </div>
                <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                  <span className="text-sm font-medium">{busSpeed.toFixed(1)} km/hr</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3">
          <div className="flex items-center justify-between">
            <button
              className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full"
              onClick={onPrevBus}
              disabled={!buses || buses.length <= 1}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <div className="flex-1 mx-4 text-center">
              <div className="text-sm text-gray-600">Next Stop: {nextStop}</div>
              <div className="flex justify-center items-center mt-1">
                <div className="text-sm text-gray-600">Approx. Arrival Time:</div>
                <div className="ml-1 font-medium">{arrivalTime}</div>
              </div>
            </div>

            <button
              className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full"
              onClick={onNextBus}
              disabled={!buses || buses.length <= 1}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>

          <div className="mt-2 text-center text-sm text-gray-600">Route: {routeInfo}</div>
        </div>
      </div>
    </div>
  )
}

// Direct React component for bus markers with animation and rotation
function BusMarker({ bus, index, route, isSelected, onSelect, routeCoordinates }) {
  const markerRef = useRef(null)
  const prevPositionRef = useRef(null)
  const map = useMap()
  const [rotation, setRotation] = useState(0)
  const lastMovementBearingRef = useRef(0)

  const busId = bus.busId || `bus-${index}`
  const busNo = bus.busNo || `Bus ${busId}`
  const busSpeed = Number.parseFloat(bus.speed) || 0

  const [position, setPosition] = useState([
    Number.parseFloat(bus.latitude) || route.start_lat,
    Number.parseFloat(bus.longitude) || route.start_lng,
  ])

  // Store the previous position for animation
  useEffect(() => {
    if (!prevPositionRef.current) {
      prevPositionRef.current = [...position]
    }
  }, [])

  // Handle position updates with animation and rotation
  useEffect(() => {
    const newPosition = [
      Number.parseFloat(bus.latitude) || route.start_lat,
      Number.parseFloat(bus.longitude) || route.start_lng,
    ]

    // Only animate if position has actually changed
    if (
      prevPositionRef.current &&
      (prevPositionRef.current[0] !== newPosition[0] || prevPositionRef.current[1] !== newPosition[1])
    ) {
      // Calculate bearing/direction based on movement
      const movementBearing = calculateBearing(
        prevPositionRef.current[0],
        prevPositionRef.current[1],
        newPosition[0],
        newPosition[1],
      )

      // Store the movement bearing for reference
      lastMovementBearingRef.current = movementBearing

      // Calculate road direction at the new position
      let roadBearing = 0
      if (routeCoordinates && routeCoordinates.length > 0) {
        roadBearing = calculateRoadDirection(newPosition, routeCoordinates)
      }

      // Determine which bearing to use
      // If the bus is moving significantly, use movement bearing
      // Otherwise, align with the road
      const speed = Number.parseFloat(bus.speed) || 0
      const significantMovement = speed > 0.5 // Threshold for significant movement

      // Use movement bearing if moving significantly, otherwise use road bearing
      // Also check if the difference between movement and road bearing is reasonable
      // If the difference is too large, the bus might be off-route, so use movement bearing
      const bearingDifference = Math.abs(((roadBearing - movementBearing + 180) % 360) - 180)
      const isAlignedWithRoad = bearingDifference < 45 // Within 45 degrees

      let finalBearing
      if (significantMovement) {
        if (isAlignedWithRoad) {
          // Bus is moving and aligned with road, use road bearing for smoother movement
          finalBearing = roadBearing
        } else {
          // Bus is moving but not aligned with road (might be turning or off-route)
          finalBearing = movementBearing
        }
      } else {
        // Bus is not moving significantly, align with road if possible
        finalBearing = roadBearing || movementBearing
      }

      // Update rotation state
      setRotation(finalBearing)

      // Get the DOM element for the bus icon
      const iconElement = document.getElementById(`bus-icon-${busId}`)

      if (iconElement && markerRef.current) {
        // First, animate the icon to indicate movement
        gsap.to(iconElement, {
          scale: 1.2,
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(iconElement, {
              scale: 1,
              duration: 0.2,
              ease: "power2.in",
            })
          },
        })

        // Apply rotation to the icon
        iconElement.style.transform = `rotate(${finalBearing}deg)`

        // Create a smooth animation between positions
        const startTime = Date.now()
        const duration = 500 // 0.5 second animation for smoother 1-second updates
        const startPos = prevPositionRef.current
        const endPos = newPosition

        const animateMarker = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)

          // Ease function for smoother movement
          const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress

          // Calculate intermediate position
          const lat = startPos[0] + (endPos[0] - startPos[0]) * easeProgress
          const lng = startPos[1] + (endPos[1] - startPos[1]) * easeProgress

          // Update marker position
          markerRef.current.setLatLng([lat, lng])

          if (progress < 1) {
            requestAnimationFrame(animateMarker)
          } else {
            // Animation complete, update state
            setPosition(newPosition)
            prevPositionRef.current = newPosition
          }
        }

        // Start animation
        requestAnimationFrame(animateMarker)
      } else {
        // Fallback if animation can't be performed
        setPosition(newPosition)
        prevPositionRef.current = newPosition
      }
    } else if (!prevPositionRef.current) {
      // Initial position set
      setPosition(newPosition)
      prevPositionRef.current = newPosition

      // Set initial rotation based on road direction if available
      if (routeCoordinates && routeCoordinates.length > 0) {
        const initialRoadBearing = calculateRoadDirection(newPosition, routeCoordinates)
        setRotation(initialRoadBearing)
      }
    }
  }, [bus.latitude, bus.longitude, busId, route.start_lat, route.start_lng, routeCoordinates, bus.speed])

  const popupContent = `
    <div class="p-2">
      <strong class="font-bold">Bus: ${busNo}</strong><br/>
      <span>Speed: ${busSpeed.toFixed(1)} km/h</span><br/>
      <span>Last Updated: ${new Date(bus.lastUpdated || Date.now()).toLocaleTimeString()}</span>
    </div>
  `

  const handleMarkerClick = () => {
    onSelect(bus)
  }

  return (
    <Marker
      position={position}
      icon={createBusIcon(busId, rotation, isSelected)}
      zIndexOffset={isSelected ? 1000 : 900}
      ref={markerRef}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Popup>
        <div dangerouslySetInnerHTML={{ __html: popupContent }} />
      </Popup>
    </Marker>
  )
}

function RoutingMachine({ onSelectBus, selectedBusId }) {
  const map = useMap()
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const [route, setRoute] = useState(null)
  const [stop, setStop] = useState(null)
  const [buses, setBuses] = useState([])
  const { routeId } = useParams()
  const prevBusesRef = useRef([])
  const routeBoundsRef = useRef(null)
  const hasInitiallyFocused = useRef(false)

  useEffect(() => {
    async function fetchRouteData() {
      try {
        const response = await getRouteByid(routeId)
        const res = await getStopByRouteId(routeId)
        const re = await getBusByRouteId(routeId)
        console.log("API Response:", re)
        setRoute(response.data)
        setStop(res.data)

        // Check if the API returned bus data in the expected format
        if (re && re.data) {
          console.log("Setting bus data:", re.data)
          const busData = Array.isArray(re.data) ? re.data : [re.data]
          setBuses(busData)
          prevBusesRef.current = busData

          // Select the first bus by default if none is selected
          if (!selectedBusId && busData.length > 0) {
            onSelectBus(busData[0])
          }
        } else {
          console.error("Invalid bus data format:", re)
        }
      } catch (error) {
        console.error("Error fetching route:", error)
      }
    }
    fetchRouteData()

    // Set up polling for bus data every 1 second
    const intervalId = setInterval(async () => {
      try {
        const re = await getBusByRouteId(routeId)
        console.log("Updated bus data:", re)
        if (re && re.data) {
          const busData = Array.isArray(re.data) ? re.data : [re.data]
          setBuses(busData)

          // If there's a selected bus, update its data
          if (selectedBusId) {
            const updatedSelectedBus = busData.find((b) => (b.busId || "") === selectedBusId)
            if (updatedSelectedBus) {
              onSelectBus(updatedSelectedBus)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching updated bus data:", error)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [routeId, onSelectBus, selectedBusId])

  useEffect(() => {
    if (route) {
      const fetchRoute = async () => {
        const start = `${route.start_lng},${route.start_lat}`
        const end = `${route.end_lng},${route.end_lat}`
        const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`

        try {
          const response = await fetch(url)
          const data = await response.json()
          if (data.routes && data.routes.length > 0) {
            const coordinates = data.routes[0].geometry.coordinates.map((coord) => [coord[1], coord[0]])
            setRouteCoordinates(coordinates)

            // Create a bounds object that includes the entire route
            const bounds = L.latLngBounds(coordinates)

            // Add some padding to the bounds
            const paddedBounds = bounds.pad(0.2) // 20% padding around the route

            // Store the route bounds for reference
            routeBoundsRef.current = paddedBounds

            // Fit the map to show the entire route with padding ONLY on initial load
            if (!hasInitiallyFocused.current) {
              map.fitBounds(paddedBounds)
              hasInitiallyFocused.current = true
            }
          }
        } catch (error) {
          console.error("Error fetching route coordinates:", error)
        }
      }

      fetchRoute()
    }
  }, [route, map])

  // For debugging - add test buses if none are available
  useEffect(() => {
    if (route && (!buses || buses.length === 0)) {
      console.log("No bus data found, adding test buses for debugging")
      // This is just for debugging - will be removed in production
      const testBuses = [
        {
          busId: "B757",
          busNo: "B757",
          name: "Sajha",
          latitude: route.start_lat,
          longitude: route.start_lng,
          speed: 1.5, // 5.5 km/h when multiplied by 3.6
          lastUpdated: new Date().toISOString(),
          arrivalTime: "6 minute",
        },
        {
          busId: "B998",
          busNo: "B998",
          name: "Mahanagar",
          latitude: Number.parseFloat(route.start_lat) + 0.005,
          longitude: Number.parseFloat(route.start_lng) + 0.005,
          speed: 0.8,
          lastUpdated: new Date().toISOString(),
          arrivalTime: "12 minute",
        },
      ]
      console.log("Adding test buses:", testBuses)
      setBuses(testBuses)
      prevBusesRef.current = testBuses

      // Select the first bus by default
      if (!selectedBusId) {
        onSelectBus(testBuses[0])
      }
    }
  }, [route, buses, onSelectBus, selectedBusId])

  // Function to reset the map view to show the entire route
  const resetMapToRouteBounds = useCallback(() => {
    if (routeBoundsRef.current) {
      map.fitBounds(routeBoundsRef.current)
    }
  }, [map])

  // Expose the reset function to the parent component
  if (window) {
    window.resetMapToRouteBounds = resetMapToRouteBounds
  }

  if (!route || routeCoordinates.length === 0) return null

  return (
    <>
      <Polyline positions={routeCoordinates} color="blue" />
      <Marker position={[route.start_lat, route.start_lng]} icon={iconStart} zIndexOffset={1000}>
        <Popup>Start: {route.start_name || "Sundarijal Buspark"}</Popup>
      </Marker>
      <Marker position={[route.end_lat, route.end_lng]} icon={iconEnd} zIndexOffset={1000}>
        <Popup>End: {route.end_name || "Ratnapark"}</Popup>
      </Marker>

      {/* Render each bus as a separate marker component */}
      {buses &&
        buses.length > 0 &&
        buses.map((bus, index) => (
          <BusMarker
            key={bus.busId || `bus-${index}`}
            bus={bus}
            index={index}
            route={route}
            isSelected={selectedBusId === (bus.busId || `bus-${index}`)}
            onSelect={onSelectBus}
            routeCoordinates={routeCoordinates}
          />
        ))}
    </>
  )
}

function MapController({ center, shouldCenter }) {
  const map = useMap()
  const userInteractedRef = useRef(false)

  // Track user interactions with the map
  useEffect(() => {
    const handleUserInteraction = () => {
      userInteractedRef.current = true
    }

    map.on("drag", handleUserInteraction)
    map.on("zoom", handleUserInteraction)

    return () => {
      map.off("drag", handleUserInteraction)
      map.off("zoom", handleUserInteraction)
    }
  }, [map])

  // Only center if explicitly requested and user hasn't interacted
  useEffect(() => {
    if (center && shouldCenter) {
      map.setView([center.lat, center.lon], map.getZoom())
      // Reset the interaction flag after explicit centering
      userInteractedRef.current = false
    }
  }, [center, shouldCenter, map])

  return null
}

export default function BasicMap() {
  const [center, setCenter] = useState(DEFAULT_CENTER)
  const [userLocation, setUserLocation] = useState(null)
  const [error, setError] = useState(null)
  const [selectedBus, setSelectedBus] = useState(null)
  const [buses, setBuses] = useState([])
  const [currentBusIndex, setCurrentBusIndex] = useState(0)
  const [shouldCenterOnBus, setShouldCenterOnBus] = useState(false)
  const { routeId } = useParams()
  const [route, setRoute] = useState(null)
  const [stop, setStop] = useState(null)
  const mapRef = useRef(null)

  // Fetch route and stop data
  useEffect(() => {
    async function fetchData() {
      try {
        const routeResponse = await getRouteByid(routeId)
        const stopResponse = await getStopByRouteId(routeId)
        const busResponse = await getBusByRouteId(routeId)

        if (routeResponse && routeResponse.data) {
          setRoute(routeResponse.data)
        }

        if (stopResponse && stopResponse.data) {
          setStop(stopResponse.data)
        }

        if (busResponse && busResponse.data) {
          const busData = Array.isArray(busResponse.data) ? busResponse.data : [busResponse.data]
          setBuses(busData)
        }
      } catch (error) {
        console.error("Error fetching route or stop data:", error)
      }
    }

    fetchData()

    // Set up polling for bus data
    const intervalId = setInterval(async () => {
      try {
        const busResponse = await getBusByRouteId(routeId)
        if (busResponse && busResponse.data) {
          const busData = Array.isArray(busResponse.data) ? busResponse.data : [busResponse.data]
          setBuses(busData)
        }
      } catch (error) {
        console.error("Error fetching updated bus data:", error)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [routeId])

  // Add global styles for Leaflet icons and animations
  useEffect(() => {
    // Create a style element for Leaflet icons and animations
    const styleEl = document.createElement("style")
    styleEl.textContent = `
      .leaflet-marker-icon {
        visibility: visible !important;
        opacity: 1 !important;
      }
      .leaflet-marker-icon div {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
      }
      .bus-icon-container {
        transform-origin: center center;
        transition: transform 0.3s ease;
      }
      .bus-icon-container.selected::after {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        z-index: -1;
      }
      .bus-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .bus-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    `
    document.head.appendChild(styleEl)

    // Cleanup function
    return () => {
      document.head.removeChild(styleEl)
    }
  }, [])

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (err) => {
          setError(err.message)
        },
        { enableHighAccuracy: true },
      )

      return () => navigator.geolocation.clearWatch(watchId)
    } else {
      setError("Geolocation is not supported by this browser.")
    }
  }, [])

  const handleCenterOnUser = useCallback(() => {
    if (userLocation) {
      setCenter({ lat: userLocation.lat, lon: userLocation.lon })
      setShouldCenterOnBus(true)
    }
  }, [userLocation])

  const handleCenterOnBus = useCallback(() => {
    if (selectedBus) {
      const busLat = Number.parseFloat(selectedBus.latitude) || DEFAULT_CENTER.lat
      const busLon = Number.parseFloat(selectedBus.longitude) || DEFAULT_CENTER.lon
      setCenter({ lat: busLat, lon: busLon })
      setShouldCenterOnBus(true)
    }
  }, [selectedBus])

  const handleCenterOnRoute = useCallback(() => {
    // Only reset to route bounds when explicitly requested by user
    if (window.resetMapToRouteBounds) {
      window.resetMapToRouteBounds()
    }
    setShouldCenterOnBus(false)
  }, [])

  const handleSelectBus = useCallback(
    (bus) => {
      setSelectedBus(bus)

      // Find the index of the selected bus
      if (buses && buses.length > 0) {
        const index = buses.findIndex((b) => (b.busId || "") === (bus.busId || ""))
        if (index !== -1) {
          setCurrentBusIndex(index)
        }
      }

      // Don't automatically center on the bus when it's selected
    },
    [buses],
  )

  const handlePrevBus = useCallback(() => {
    if (buses && buses.length > 0) {
      const newIndex = (currentBusIndex - 1 + buses.length) % buses.length
      setCurrentBusIndex(newIndex)
      setSelectedBus(buses[newIndex])
    }
  }, [buses, currentBusIndex])

  const handleNextBus = useCallback(() => {
    if (buses && buses.length > 0) {
      const newIndex = (currentBusIndex + 1) % buses.length
      setCurrentBusIndex(newIndex)
      setSelectedBus(buses[newIndex])
    }
  }, [buses, currentBusIndex])

  // Set the first bus as selected when buses are loaded
  useEffect(() => {
    if (buses && buses.length > 0 && !selectedBus) {
      setSelectedBus(buses[0])
      setCurrentBusIndex(0)
    }
  }, [buses, selectedBus])

  return (
    <div className="relative w-full h-screen">
      <Link to={`/profile/${routeId}`}>
        <div className="w-14 text-center h-14 absolute top-20 left-5 z-50 flex items-center justify-center">
          <img
            src={process.env.PUBLIC_URL + "/images/Logo/profile.png" || "/placeholder.svg"}
            alt="profile logo"
            className="rounded-full"
          />
        </div>
      </Link>

      <div className="absolute top-2/4 left-5 text-4xl z-50 text-center space-y-4 text-white">
        <div className="cursor-pointer" onClick={handleCenterOnUser}>
          <FontAwesomeIcon icon={faLocationCrosshairs} className="bg-[#1D8F34] rounded-full p-2" />
        </div>
        <div className="cursor-pointer" onClick={handleCenterOnBus}>
          <FontAwesomeIcon icon={faBus} className="bg-[#1D8F34] rounded-full p-2" />
        </div>
        <div className="cursor-pointer" onClick={handleCenterOnRoute}>
          <FontAwesomeIcon icon={faRoute} className="bg-[#1D8F34] rounded-full p-2" />
        </div>
        <div className="cursor-pointer">
          <FontAwesomeIcon icon={faCircleStop} className="bg-[#1D8F34] rounded-full p-2" />
        </div>
      </div>

      <MapContainer
        center={[center.lat, center.lon]}
        zoom={14}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lon]} icon={iconPerson}>
            <Popup>Hello, you are here</Popup>
          </Marker>
        )}
        <RoutingMachine onSelectBus={handleSelectBus} selectedBusId={selectedBus?.busId || null} />
        <MapController center={center} shouldCenter={shouldCenterOnBus} />
      </MapContainer>

      {/* Bus Information Card */}
      <BusInfoCard
        bus={selectedBus}
        route={route}
        stop={stop}
        onPrevBus={handlePrevBus}
        onNextBus={handleNextBus}
        buses={buses}
      />

      {error && <div className="absolute top-5 left-5 bg-red-500 text-white p-2 rounded">{error}</div>}
    </div>
  )
}
