"use client"

import { Field, Formik } from "formik"
import { useState, useEffect, useRef } from "react"
import { getRoutes, updateStop } from "../api/ApiService"

export default function EditStop({ onClose, onStopUpdated, stopData }) {
  const [routes, setRoutes] = useState([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [stopAddress, setStopAddress] = useState("")
  const [mapError, setMapError] = useState(false)

  // Map references
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const stopMarkerRef = useRef(null)

  // Initialize state with the route data if provided
  const [initialValues, setInitialValues] = useState({
    stop_id: "",
    stop_name: "",
    lat: "",
    lng: "",
    route_id: "",
  })

  // Update initialValues when stopData changes
  useEffect(() => {
    if (stopData) {
      setInitialValues({
        stop_id: stopData.stop_id,
        stop_name: stopData.stop_name || "",
        lat: stopData.lat || "",
        lng: stopData.lng || "",
        route_id: stopData.route_id || "",
      })

      // If map is loaded and we have coordinates, update the map
      if (mapLoaded && mapInstanceRef.current && stopData.lat && stopData.lng) {
        const position = new window.google.maps.LatLng(Number.parseFloat(stopData.lat), Number.parseFloat(stopData.lng))
        mapInstanceRef.current.setCenter(position)
        placeStopMarker(position)

        // Get address for the location
        getAddressFromLatLng(position)
      }
    }
  }, [stopData, mapLoaded])

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

    // Default to Kathmandu
    let initialCenter = { lat: 27.7172, lng: 85.324 }
    let initialZoom = 12

    // If we have existing coordinates, use them as the center
    if (stopData && stopData.lat && stopData.lng) {
      initialCenter = {
        lat: Number.parseFloat(stopData.lat),
        lng: Number.parseFloat(stopData.lng),
      }
      initialZoom = 15 // Closer zoom when we have a specific location
    }

    // Initialize the map
    const mapOptions = {
      center: initialCenter,
      zoom: initialZoom,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    }

    try {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions)

      // Add click listener to map for pin placement
      mapInstanceRef.current.addListener("click", (event) => {
        placeStopMarker(event.latLng)
      })

      setMapLoaded(true)
      setupAutocomplete()

      // If we have existing coordinates, place a marker
      if (stopData && stopData.lat && stopData.lng) {
        // Use setTimeout to ensure the map is fully loaded
        setTimeout(() => {
          const position = new window.google.maps.LatLng(
            Number.parseFloat(stopData.lat),
            Number.parseFloat(stopData.lng),
          )
          placeStopMarker(position)
          getAddressFromLatLng(position)
        }, 300)
      }
    } catch (error) {
      console.error("Error initializing map:", error)
      setMapError(true)
    }
  }

  // Add autocomplete functionality
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

      // Place marker at the location
      placeStopMarker(place.geometry.location)

      // Update search query with the selected place name
      setSearchQuery(place.formatted_address || place.name)

      // Update the form values
      setInitialValues((prev) => ({
        ...prev,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        stop_name: prev.stop_name || place.name || place.formatted_address.split(",")[0],
      }))
    })
  }

  const placeStopMarker = (location) => {
    // Remove existing marker if any
    if (stopMarkerRef.current) {
      stopMarkerRef.current.setMap(null)
    }

    // Create new marker with bounce animation
    stopMarkerRef.current = new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      title: "Stop Location",
      draggable: true,
      animation: window.google.maps.Animation.BOUNCE,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      },
    })

    // Stop the bounce after 2 seconds
    setTimeout(() => {
      if (stopMarkerRef.current) {
        stopMarkerRef.current.setAnimation(null)
      }
    }, 2000)

    // Update form values with coordinates
    setInitialValues((prev) => ({
      ...prev,
      lat: location.lat(),
      lng: location.lng(),
    }))

    // Add drag event for marker
    stopMarkerRef.current.addListener("dragend", () => {
      const newPosition = stopMarkerRef.current.getPosition()
      setInitialValues((prev) => ({
        ...prev,
        lat: newPosition.lat(),
        lng: newPosition.lng(),
      }))
      getAddressFromLatLng(newPosition)
    })

    // Get address for the location
    getAddressFromLatLng(location)

    // Show info window with coordinates
    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div class="p-2">
                <p class="font-bold text-sm">Stop Location</p>
                <p class="text-xs">Lat: ${location.lat().toFixed(6)}</p>
                <p class="text-xs">Lng: ${location.lng().toFixed(6)}</p>
                <p class="text-xs mt-1">Drag marker to adjust position</p>
              </div>`,
    })

    infoWindow.open(mapInstanceRef.current, stopMarkerRef.current)

    // Keep info window open on click
    stopMarkerRef.current.addListener("click", () => {
      infoWindow.open(mapInstanceRef.current, stopMarkerRef.current)
    })
  }

  const getAddressFromLatLng = (latLng) => {
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results[0]) {
        setStopAddress(results[0].formatted_address)
        // Optionally update the stop name if it's empty
        if (!initialValues.stop_name) {
          setInitialValues((prev) => ({
            ...prev,
            stop_name: results[0].formatted_address.split(",")[0],
          }))
        }
      } else {
        // If geocoding fails, at least show the coordinates
        setStopAddress(`Location at ${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}`)
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

        // Move map to the location with smooth animation
        mapInstanceRef.current.panTo(location)
        mapInstanceRef.current.setZoom(15)

        // Place marker at the location
        placeStopMarker(location)

        // Clear the search query
        setSearchQuery("")
      } else {
        // Handle geocoding error
        alert("Location not found. Please try a different search term.")
      }
    })
  }

  const handleMapTypeChange = (type) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type)
    }
  }

  async function getAllRoutes() {
    try {
      console.log(stopData)
      const response = await getRoutes()
      setRoutes(response.data)
    } catch (error) {
      console.error("Error fetching routes:", error)
    }
  }

  useEffect(() => {
    getAllRoutes()
  }, [])

  async function onSubmit(values) {
    const stops = {
      stop_id: values.stop_id,
      stop_name: values.stop_name,
      lat: values.lat,
      lng: values.lng,
      route_id: values.route_id,
    }

    try {
      const response = await updateStop(stops, values.route_id, values.stop_id)
      onStopUpdated(stops)
      onClose()
    } catch (err) {
      console.log(err)
    }
  }

  // Handle the case when map loads after stopData is available
  useEffect(() => {
    if (mapLoaded && stopData && stopData.lat && stopData.lng && mapInstanceRef.current) {
      const position = new window.google.maps.LatLng(Number.parseFloat(stopData.lat), Number.parseFloat(stopData.lng))
      mapInstanceRef.current.setCenter(position)
      placeStopMarker(position)
      getAddressFromLatLng(position)
    }
  }, [mapLoaded, stopData])

  return (
    <>
      {/* Blurred backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

      <div
        id="editRouteModal"
        tabIndex={-1}
        aria-hidden="true"
        className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full"
      >
        <div className="relative p-4 w-full max-w-2xl max-h-full">
          {/* Modal content */}
          <div className="relative p-4 bg-white rounded-none shadow dark:bg-gray-800 sm:p-5">
            {/* Modal header */}
            <div className="flex justify-between items-center pb-4 mb-4 rounded-none border-b sm:mb-5 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Stop</h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-none text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
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

              {/* Map instructions */}
              <div className="mb-2 p-2 bg-blue-50 border border-blue-100 text-xs text-gray-600">
                <p>
                  Search for a location using the search box above, or click directly on the map to place a stop marker.
                  You can drag the marker to fine-tune its position.
                </p>
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

              {/* Location information */}
              {initialValues.lat && initialValues.lng && (
                <div className="mb-4 p-3 border border-blue-200 bg-blue-50">
                  <p className="text-sm font-medium text-gray-900 mb-1">Selected Stop Location:</p>
                  <p className="text-sm text-gray-600 mb-1">{stopAddress || "Custom location"}</p>
                  <p className="text-xs text-gray-500">
                    Coordinates: {Number.parseFloat(initialValues.lat).toFixed(6)},{" "}
                    {Number.parseFloat(initialValues.lng).toFixed(6)}
                  </p>
                </div>
              )}
            </div>

            {/* Modal body */}
            <Formik initialValues={initialValues} enableReinitialize={true} onSubmit={onSubmit}>
              {(props) => (
                <form onSubmit={props.handleSubmit}>
                  <div className="grid gap-4 mb-4 sm:grid-cols-2">
                    <fieldset>
                      <label htmlFor="stop_id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Stop ID
                      </label>
                      <Field
                        type="number"
                        name="stop_id"
                        id="stop_id"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter the stop ID"
                        required
                      />
                    </fieldset>

                    <fieldset>
                      <label
                        htmlFor="stop_name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Stop Name
                      </label>
                      <Field
                        type="text"
                        name="stop_name"
                        id="stop_name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter the stop name"
                        required
                      />
                    </fieldset>
                    <fieldset>
                      <label htmlFor="lat" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Latitude
                      </label>
                      <Field
                        type="number"
                        name="lat"
                        id="lat"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Stop Latitude"
                        required
                      />
                    </fieldset>

                    <fieldset>
                      <label htmlFor="lng" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Longitude
                      </label>
                      <Field
                        type="number"
                        name="lng"
                        id="lng"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Stop Longitude"
                        required
                      />
                    </fieldset>

                    <fieldset>
                      <label
                        htmlFor="route_id"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Route
                      </label>
                      <Field
                        as="select"
                        name="route_id"
                        id="route_id"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        required
                      >
                        <option value="">Select a route</option>
                        {routes &&
                          routes.length > 0 &&
                          routes.map((route) => (
                            // Make sure we're using the correct property for the route ID
                            <option key={route.id || route._id} value={route.id || route._id || route.route_id}>
                              {route.route_name}
                            </option>
                          ))}
                      </Field>
                    </fieldset>
                  </div>

                  <button
                    type="submit"
                    className="text-white inline-flex items-center bg-[#1D8F34] hover:bg-[#186434] focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-none text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 -ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Update stop
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

