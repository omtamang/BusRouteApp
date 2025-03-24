"use client"

import { Field, Formik } from "formik"
import { useState, useEffect, useRef } from "react"
import { addRoute } from "../api/ApiService"

export default function AddRoute({ onClose, onRouteAdded }) {
  const [route_name, setRouteName] = useState("")
  const [start_lat, setStartLat] = useState("")
  const [start_lng, setStartLng] = useState("")
  const [end_lat, setEndLat] = useState("")
  const [end_lng, setEndLng] = useState("")
  const [no_of_buses, setNoOfBuses] = useState("")
  const [mapLoaded, setMapLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [startAddress, setStartAddress] = useState("")
  const [endAddress, setEndAddress] = useState("")
  const [mapError, setMapError] = useState(false)

  // Current pin position
  const [currentPin, setCurrentPin] = useState(null)
  const [currentPinLat, setCurrentPinLat] = useState("")
  const [currentPinLng, setCurrentPinLng] = useState("")
  const [currentPinAddress, setCurrentPinAddress] = useState("")

  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const startMarkerRef = useRef(null)
  const endMarkerRef = useRef(null)
  const currentPinRef = useRef(null)

  // Load Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      initializeMap()
      return
    }

    // Replace YOUR_API_KEY with your actual Google Maps API key
    const apiKey = "AIzaSyBsp1XtGRf8lxdDfVg9_My4MWACU8ge59w"

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=Function.prototype`
    script.async = true
    script.defer = true
    script.onload = () => {
      initializeMap()
    }
    script.onerror = () => {
      setMapError(true)
    }
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize the map
    const mapOptions = {
      center: { lat: 27.7172, lng: 85.324 }, // Kathmandu coordinates
      zoom: 12, // Closer zoom for city view
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    }

    try {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions)

      // Add click listener to map for pin placement
      mapInstanceRef.current.addListener("click", (event) => {
        placePin(event.latLng)
      })

      setMapLoaded(true)
      setupAutocomplete()
    } catch (error) {
      console.error("Error initializing map:", error)
      setMapError(true)
    }
  }

  // Add this function after initializeMap
  const setupAutocomplete = () => {
    if (!mapLoaded || !window.google) return

    const input = document.getElementById("map-search-input")
    if (!input) return

    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      fields: ["formatted_address", "geometry", "name"],
      strictBounds: false,
    })

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()

      if (!place.geometry || !place.geometry.location) {
        // User entered the name of a Place that was not suggested
        alert("No details available for input: '" + place.name + "'")
        return
      }

      // Move map to the selected place
      mapInstanceRef.current.setCenter(place.geometry.location)
      mapInstanceRef.current.setZoom(15)

      // Place pin at the location
      placePin(place.geometry.location)

      // Update search query with the selected place name
      setSearchQuery(place.formatted_address || place.name)
    })
  }

  const placePin = (location) => {
    // Remove existing pin if any
    if (currentPinRef.current) {
      currentPinRef.current.setMap(null)
    }

    // Create new pin
    currentPinRef.current = new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      title: "Selected Location",
      draggable: true,
      animation: window.google.maps.Animation.DROP,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      },
    })

    // Update state with pin coordinates
    setCurrentPinLat(location.lat())
    setCurrentPinLng(location.lng())
    setCurrentPin(location)

    // Add drag event for pin
    currentPinRef.current.addListener("dragend", () => {
      const newPosition = currentPinRef.current.getPosition()
      setCurrentPinLat(newPosition.lat())
      setCurrentPinLng(newPosition.lng())
      setCurrentPin(newPosition)
      getAddressFromLatLng(newPosition)
    })

    // Get address for the location
    getAddressFromLatLng(location)

    // Show info window with coordinates
    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div class="p-2">
                  <p class="font-bold text-sm">Selected Location</p>
                  <p class="text-xs">Lat: ${location.lat().toFixed(6)}</p>
                  <p class="text-xs">Lng: ${location.lng().toFixed(6)}</p>
                  <p class="text-xs mt-1">Drag pin to adjust position</p>
                </div>`,
    })

    infoWindow.open(mapInstanceRef.current, currentPinRef.current)

    // Keep info window open
    currentPinRef.current.addListener("click", () => {
      infoWindow.open(mapInstanceRef.current, currentPinRef.current)
    })
  }

  const getAddressFromLatLng = (latLng) => {
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results[0]) {
        setCurrentPinAddress(results[0].formatted_address)
      } else {
        // If geocoding fails, at least show the coordinates
        setCurrentPinAddress(`Location at ${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}`)
      }
    })
  }

  const handleSearchSubmit = () => {
    if (!searchQuery.trim() || !mapLoaded) return

    // Use Geocoding API to find the location
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location

        // Move map to the location
        mapInstanceRef.current.setCenter(location)
        mapInstanceRef.current.setZoom(15)

        // Place pin at the location
        placePin(location)

        // Clear the search query
        setSearchQuery("")
      } else {
        // Handle geocoding error
        alert("Location not found. Please try a different search term.")
      }
    })
  }

  const setAsStart = () => {
    if (!currentPin) return

    // Set start location
    setStartLat(currentPin.lat())
    setStartLng(currentPin.lng())
    setStartAddress(currentPinAddress)

    // Create or update start marker
    if (startMarkerRef.current) {
      startMarkerRef.current.setMap(null)
    }

    startMarkerRef.current = new window.google.maps.Marker({
      position: currentPin,
      map: mapInstanceRef.current,
      title: "Start Location",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
      },
    })
  }

  const setAsEnd = () => {
    if (!currentPin) return

    // Set end location
    setEndLat(currentPin.lat())
    setEndLng(currentPin.lng())
    setEndAddress(currentPinAddress)

    // Create or update end marker
    if (endMarkerRef.current) {
      endMarkerRef.current.setMap(null)
    }

    endMarkerRef.current = new window.google.maps.Marker({
      position: currentPin,
      map: mapInstanceRef.current,
      title: "End Location",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      },
    })
  }

  const handleMapTypeChange = (type) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type)
    }
  }

  async function onSubmit(values) {
    const route = {
      route_name: values.route_name,
      start_lat: values.start_lat,
      start_lng: values.start_lng,
      end_lat: values.end_lat,
      end_lng: values.end_lng,
      no_of_buses: values.no_of_buses,
    }

    try {
      const response = await addRoute(route)
      onRouteAdded()
      onClose()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <>
      {/* Blurred backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

      <div
        id="createProductModal"
        tabIndex={-1}
        aria-hidden="true"
        className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full"
      >
        <div className="relative p-4 w-full max-w-4xl max-h-full">
          {/* Modal content */}
          <div className="relative p-4 bg-white rounded-none shadow dark:bg-gray-800 sm:p-5">
            {/* Modal header */}
            <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Route</h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-none text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-target="createProductModal"
                data-modal-toggle="createProductModal"
                onClick={onClose}
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            {/* Map section */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      id="map-search-input"
                      type="text"
                      placeholder="Search for a location (e.g., 'New York City' or an address)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleSearchSubmit()
                        }
                      }}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {/* Map type selector */}
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => handleMapTypeChange("roadmap")}
                  className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Road
                </button>
                <button
                  type="button"
                  onClick={() => handleMapTypeChange("satellite")}
                  className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Satellite
                </button>
                <button
                  type="button"
                  onClick={() => handleMapTypeChange("hybrid")}
                  className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Hybrid
                </button>
                <button
                  type="button"
                  onClick={() => handleMapTypeChange("terrain")}
                  className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Terrain
                </button>
              </div>

              <div className="w-full h-64 bg-gray-200 mb-4">
                {mapError ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-4">
                      <p className="text-red-500 font-medium mb-2">Unable to load Google Maps</p>
                      <p className="text-sm text-gray-600">
                        Please check your API key and make sure billing is enabled.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div ref={mapRef} className="w-full h-full"></div>
                )}
              </div>

              {/* Current pin information */}
              {currentPin && (
                <div className="mb-4 p-3 border border-blue-200 bg-blue-50">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-900">Selected Pin Location:</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={setAsStart}
                        className="px-3 py-1 text-xs font-medium bg-green-600 text-white hover:bg-green-700"
                      >
                        Set as Start
                      </button>
                      <button
                        type="button"
                        onClick={setAsEnd}
                        className="px-3 py-1 text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                      >
                        Set as End
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{currentPinAddress}</p>
                  <p className="text-xs text-gray-500">
                    Coordinates: {Number.parseFloat(currentPinLat).toFixed(6)},{" "}
                    {Number.parseFloat(currentPinLng).toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 italic">
                    Click on the map to place a pin or drag the existing pin to adjust its position
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Start Location:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{startAddress || "Not selected"}</p>
                  {start_lat && start_lng && (
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates: {Number.parseFloat(start_lat).toFixed(6)}, {Number.parseFloat(start_lng).toFixed(6)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">End Location:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{endAddress || "Not selected"}</p>
                  {end_lat && end_lng && (
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates: {Number.parseFloat(end_lat).toFixed(6)}, {Number.parseFloat(end_lng).toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form section */}
            <Formik
              initialValues={{
                route_name,
                start_lat,
                start_lng,
                end_lat,
                end_lng,
                no_of_buses,
              }}
              enableReinitialize={true}
              onSubmit={onSubmit}
            >
              {(props) => (
                <form onSubmit={props.handleSubmit}>
                  <div className="grid gap-4 mb-4 sm:grid-cols-2">
                    <fieldset>
                      <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Route Name
                      </label>
                      <Field
                        type="text"
                        name="route_name"
                        id="name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter the route name"
                        required
                      />
                    </fieldset>

                    <fieldset>
                      <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        No of buses
                      </label>
                      <Field
                        type="number"
                        name="no_of_buses"
                        id="price"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="0"
                        required
                      />
                    </fieldset>

                    {/* Hidden fields for coordinates */}
                    <Field type="hidden" name="start_lat" />
                    <Field type="hidden" name="start_lng" />
                    <Field type="hidden" name="end_lat" />
                    <Field type="hidden" name="end_lng" />
                  </div>

                  <button
                    type="submit"
                    disabled={!start_lat || !start_lng || !end_lat || !end_lng}
                    className="text-white inline-flex items-center bg-[#1D8F34] hover:bg-[#186434] focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-none text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="mr-1 -ml-1 w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add new route
                  </button>
                </form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  )
}

