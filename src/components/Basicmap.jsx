"use client"

import { useState, useEffect, useCallback } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap, Polyline } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBus, faCircleStop, faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons"
import { Link, useParams } from "react-router-dom"
import { getRouteByid, getStopByRouteId } from "./api/ApiService"

// Constants
const DEFAULT_CENTER = { lat: 27.7172, lon: 85.324 } // Kathmandu

const iconPerson = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + "/images/Logo/current_location.png",
  iconSize: [45, 45],
})

const iconStart = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + "/images/Logo/start.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
})

const iconEnd = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + "/images/Logo/end.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
})

function RoutingMachine() {
  const map = useMap()
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const [route, setRoute] = useState(null)
  const [stop, setStop] = useState(null)
  const { routeId } = useParams()

  useEffect(() => {
    async function fetchRouteData() {
      try {
        const response = await getRouteByid(routeId)
        const res = await getStopByRouteId(routeId)
        console.log(res)
        setRoute(response.data)
        setStop(res.data)
        console.log(stop)
      } catch (error) {
        console.error("Error fetching route:", error)
      }
    }
    fetchRouteData()
  }, [routeId])

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
            map.fitBounds(L.latLngBounds(coordinates))
          }
        } catch (error) {
          console.error("Error fetching route coordinates:", error)
        }
      }

      fetchRoute()
    }
  }, [route, map])

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
    </>
  )
}

function MapController({ center }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lon], map.getZoom())
    }
  }, [center, map])

  return null
}

export default function BasicMap() {
  const [center, setCenter] = useState(DEFAULT_CENTER)
  const [userLocation, setUserLocation] = useState(null)
  const [error, setError] = useState(null)

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

  const handleCenterOnDefault = useCallback(() => {
    setCenter(DEFAULT_CENTER)
  }, [])

  const handleCenterOnUser = useCallback(() => {
    if (userLocation) {
      setCenter(userLocation)
    }
  }, [userLocation])

  const { routeId } = useParams()

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
        <div className="cursor-pointer" onClick={handleCenterOnDefault}>
          <FontAwesomeIcon icon={faBus} className="bg-[#1D8F34] rounded-full p-2" />
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
        <RoutingMachine />
        <MapController center={center} />
      </MapContainer>

      {error && <div className="absolute top-5 left-5 bg-red-500 text-white p-2">{error}</div>}
    </div>
  )
}

