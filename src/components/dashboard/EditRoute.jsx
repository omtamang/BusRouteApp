"use client"

import { Field, Formik } from "formik"
import { useState, useEffect, useRef } from "react"
import { updateRoute } from "../api/ApiService"

export default function EditRoute({ onClose, onRouteUpdated, routeData }) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [startAddress, setStartAddress] = useState("")
  const [endAddress, setEndAddress] = useState("")
  const [mapError, setMapError] = useState(false)
  const [currentPin, setCurrentPin] = useState(null)
  const [currentPinAddress, setCurrentPinAddress] = useState("")

  // Map references
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const startMarkerRef = useRef(null)
  const endMarkerRef = useRef(null)
  const currentPinRef = useRef(null)

  // Initialize state with the route data if provided
  const [initialValues, setInitialValues] = useState({
    route_name: "",
    start_lat: "",
    start_lng: "",
    end_lat: "",
    end_lng: "",
    no_of_buses: "",
  })

  // Update initialValues when routeData changes
  useEffect(() => {
    if (routeData) {
      setInitialValues({
        route_id: routeData.route_id,
        route_name: routeData.route_name || "",
        start_lat: routeData.start_lat || "",
        start_lng: routeData.start_lng || "",
        end_lat: routeData.end_lat || "",
        end_lng: routeData.end_lng || "",
        no_of_buses: routeData.no_of_buses || "",
      })
    }
  }, [routeData])

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

    // Initialize the map centered on Kathmandu
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

      // If we have existing coordinates, place markers and fit bounds
      if (routeData && routeData.start_lat && routeData.start_lng && routeData.end_lat && routeData.end_lng) {
        setTimeout(() => {
          const startPosition = new window.google.maps.LatLng(
            Number.parseFloat(routeData.start_lat),
            Number.parseFloat(routeData.start_lng),
          )

          const endPosition = new window.google.maps.LatLng(
            Number.parseFloat(routeData.end_lat),
            Number.parseFloat(routeData.end_lng),
          )

          // Place start and end markers
          placeStartMarker(startPosition)
          placeEndMarker(endPosition)

          // Fit bounds to show both markers
          const bounds = new window.google.maps.LatLngBounds()
          bounds.extend(startPosition)
          bounds.extend(endPosition)
          mapInstanceRef.current.fitBounds(bounds)

          // Get addresses for both locations
          getAddressFromLatLng(startPosition, "start")
          getAddressFromLatLng(endPosition, "end")
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

      // Place pin at the location
      placePin(place.geometry.location)

      // Update search query with the selected place name
      setSearchQuery(place.formatted_address || place.name)
    })
  }

  const placePin = (location) => {
    // Remove existing current pin if any
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
    setCurrentPin(location)

    // Add drag event for pin
    currentPinRef.current.addListener("dragend", () => {
      const newPosition = currentPinRef.current.getPosition()
      setCurrentPin(newPosition)
      getAddressFromLatLng(newPosition, "current")
    })

    // Get address for the location
    getAddressFromLatLng(location, "current")

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

    // Keep info window open on click
    currentPinRef.current.addListener("click", () => {
      infoWindow.open(mapInstanceRef.current, currentPinRef.current)
    })
  }

  const placeStartMarker = (location) => {
    // Remove existing start marker if any
    if (startMarkerRef.current) {
      startMarkerRef.current.setMap(null)
    }

    // Create new marker
    startMarkerRef.current = new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      title: "Start Location",
      draggable: true,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
      },
    })

    // Update form values with coordinates
    setInitialValues((prev) => ({
      ...prev,
      start_lat: location.lat(),
      start_lng: location.lng(),
    }))

    // Add drag event for marker
    startMarkerRef.current.addListener("dragend", () => {
      const newPosition = startMarkerRef.current.getPosition()
      setInitialValues((prev) => ({
        ...prev,
        start_lat: newPosition.lat(),
        start_lng: newPosition.lng(),
      }))
      getAddressFromLatLng(newPosition, "start")
    })

    // Show info window with coordinates
    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div class="p-2">
                  <p class="font-bold text-sm">Start Location</p>
                  <p class="text-xs">Lat: ${location.lat().toFixed(6)}</p>
                  <p class="text-xs">Lng: ${location.lng().toFixed(6)}</p>
                  <p class="text-xs mt-1">Drag marker to adjust position</p>
                </div>`,
    })

    infoWindow.open(mapInstanceRef.current, startMarkerRef.current)

    // Keep info window open on click
    startMarkerRef.current.addListener("click", () => {
      infoWindow.open(mapInstanceRef.current, startMarkerRef.current)
    })
  }

  const placeEndMarker = (location) => {
    // Remove existing end marker if any
    if (endMarkerRef.current) {
      endMarkerRef.current.setMap(null)
    }

    // Create new marker
    endMarkerRef.current = new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      title: "End Location",
      draggable: true,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      },
    })

    // Update form values with coordinates
    setInitialValues((prev) => ({
      ...prev,
      end_lat: location.lat(),
      end_lng: location.lng(),
    }))

    // Add drag event for marker
    endMarkerRef.current.addListener("dragend", () => {
      const newPosition = endMarkerRef.current.getPosition()
      setInitialValues((prev) => ({
        ...prev,
        end_lat: newPosition.lat(),
        end_lng: newPosition.lng(),
      }))
      getAddressFromLatLng(newPosition, "end")
    })

    // Show info window with coordinates
    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div class="p-2">
                  <p class="font-bold text-sm">End Location</p>
                  <p class="text-xs">Lat: ${location.lat().toFixed(6)}</p>
                  <p class="text-xs">Lng: ${location.lng().toFixed(6)}</p>
                  <p class="text-xs mt-1">Drag marker to adjust position</p>
                </div>`,
    })

    infoWindow.open(mapInstanceRef.current, endMarkerRef.current)

    // Keep info window open on click
    endMarkerRef.current.addListener("click", () => {
      infoWindow.open(mapInstanceRef.current, endMarkerRef.current)
    })
  }

  const getAddressFromLatLng = (latLng, type) => {
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results[0]) {
        const address = results[0].formatted_address
        if (type === "start") {
          setStartAddress(address)
        } else if (type === "end") {
          setEndAddress(address)
        } else if (type === "current") {
          setCurrentPinAddress(address)
        }
      } else {
        // If geocoding fails, at least show the coordinates
        const fallbackAddress = `Location at ${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}`
        if (type === "start") {
          setStartAddress(fallbackAddress)
        } else if (type === "end") {
          setEndAddress(fallbackAddress)
        } else if (type === "current") {
          setCurrentPinAddress(fallbackAddress)
        }
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

  const handleMapTypeChange = (type) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type)
    }
  }

  const setAsStart = () => {
    if (!currentPin) return
    placeStartMarker(currentPin)
  }

  const setAsEnd = () => {
    if (!currentPin) return
    placeEndMarker(currentPin)
  }

  // Handle the case when map loads after routeData is available
  useEffect(() => {
    if (mapLoaded && routeData && mapInstanceRef.current) {
      if (routeData.start_lat && routeData.start_lng && routeData.end_lat && routeData.end_lng) {
        const startPosition = new window.google.maps.LatLng(
          Number.parseFloat(routeData.start_lat),
          Number.parseFloat(routeData.start_lng),
        )

        const endPosition = new window.google.maps.LatLng(
          Number.parseFloat(routeData.end_lat),
          Number.parseFloat(routeData.end_lng),
        )

        // Place start and end markers
        placeStartMarker(startPosition)
        placeEndMarker(endPosition)

        // Fit bounds to show both markers
        const bounds = new window.google.maps.LatLngBounds()
        bounds.extend(startPosition)
        bounds.extend(endPosition)
        mapInstanceRef.current.fitBounds(bounds)

        // Get addresses for both locations
        getAddressFromLatLng(startPosition, "start")
        getAddressFromLatLng(endPosition, "end")
      }
    }
  }, [mapLoaded, routeData])

  async function onSubmit(values) {
    const route = {
      route_id: values.route_id, // Include the route_id for update
      route_name: values.route_name,
      start_lat: values.start_lat,
      start_lng: values.start_lng,
      end_lat: values.end_lat,
      end_lng: values.end_lng,
      no_of_buses: values.no_of_buses,
    }

    try {
      const response = await updateRoute(route, values.route_id)
      onRouteUpdated(route)
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
        id="editRouteModal"
        tabIndex={-1}
        aria-hidden="true"
        className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full"
      >
        <div className="relative p-4 w-full max-w-4xl max-h-full">
          {/* Modal content */}
          <div className="relative p-4 bg-white rounded-none shadow dark:bg-gray-800 sm:p-5">
            {/* Modal header */}
            <div className="flex justify-between items-center pb-4 mb-4 rounded-none border-b sm:mb-5 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Route</h3>
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
                  Search for a location using the search box above, or click directly on the map to place a pin. You can
                  then set the pin as the start or end point of your route.
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
                    Coordinates: {currentPin.lat().toFixed(6)}, {currentPin.lng().toFixed(6)}
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Start Location:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{startAddress || "Not selected"}</p>
                  {initialValues.start_lat && initialValues.start_lng && (
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates: {Number.parseFloat(initialValues.start_lat).toFixed(6)},{" "}
                      {Number.parseFloat(initialValues.start_lng).toFixed(6)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">End Location:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{endAddress || "Not selected"}</p>
                  {initialValues.end_lat && initialValues.end_lng && (
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates: {Number.parseFloat(initialValues.end_lat).toFixed(6)},{" "}
                      {Number.parseFloat(initialValues.end_lng).toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal body */}
            <Formik initialValues={initialValues} enableReinitialize={true} onSubmit={onSubmit}>
              {(props) => (
                <form onSubmit={props.handleSubmit}>
                  <div className="grid gap-4 mb-4 sm:grid-cols-2">
                    <fieldset>
                      <label
                        htmlFor="route_id"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Route ID
                      </label>
                      <Field
                        type="number"
                        name="route_id"
                        id="route_id"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter the route ID"
                        required
                      />
                    </fieldset>
                    <fieldset>
                      <label
                        htmlFor="route_name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Route Name
                      </label>
                      <Field
                        type="text"
                        name="route_name"
                        id="route_name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter the route name"
                        required
                      />
                    </fieldset>
                    <fieldset>
                      <label
                        htmlFor="start_lat"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Start Latitude
                      </label>
                      <Field
                        type="number"
                        name="start_lat"
                        id="start_lat"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Starting latitude"
                        required
                      />
                    </fieldset>

                    <fieldset>
                      <label
                        htmlFor="start_lng"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Start Longitude
                      </label>
                      <Field
                        type="number"
                        name="start_lng"
                        id="start_lng"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Starting longitude"
                        required
                      />
                    </fieldset>

                    <fieldset>
                      <label htmlFor="end_lat" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        End Latitude
                      </label>
                      <Field
                        type="number"
                        name="end_lat"
                        id="end_lat"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Ending latitude"
                        required
                      />
                    </fieldset>

                    <fieldset>
                      <label htmlFor="end_lng" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        End Longitude
                      </label>
                      <Field
                        type="number"
                        name="end_lng"
                        id="end_lng"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Ending longitude"
                        required
                      />
                    </fieldset>

                    <fieldset>
                      <label
                        htmlFor="no_of_buses"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        No of buses
                      </label>
                      <Field
                        type="number"
                        name="no_of_buses"
                        id="no_of_buses"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-none focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="0"
                        required
                      />
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
                    Update route
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

