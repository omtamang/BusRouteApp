"use client"

import { Field, Formik } from "formik"
import { useEffect, useState, useRef } from "react"
import { addStop, getRoutes } from "../api/ApiService"

export default function AddStop({ onClose, onStopAdded }) {
  const [stop_name, setStopeName] = useState("")
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [routes, setRoutes] = useState([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [stopAddress, setStopAddress] = useState("")
  const [mapError, setMapError] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  // LocationIQ API key
  const LOCATIONIQ_API_KEY = "pk.abc77c9c4d1bf2a25c28c2579bf8bb45"

  // Map references
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const stopMarkerRef = useRef(null)

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
        placeStopMarker(event.latLng)
      })

      setMapLoaded(true)
      setupAutocomplete()
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

      // Update the stop name based on the search result if it's empty
      if (!stop_name) {
        setStopeName(place.name || place.formatted_address.split(",")[0])
      }
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

    // Update state with coordinates
    setLat(location.lat())
    setLng(location.lng())

    // Add drag event for marker
    stopMarkerRef.current.addListener("dragend", () => {
      const newPosition = stopMarkerRef.current.getPosition()
      setLat(newPosition.lat())
      setLng(newPosition.lng())
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

  // LocationIQ reverse geocoding
  const getAddressFromLatLng = (latLng) => {
    fetch(
      `https://api.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_API_KEY}&lat=${latLng.lat()}&lon=${latLng.lng()}&format=json`,
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        if (data && data.display_name) {
          setStopAddress(data.display_name)
          // Optionally set the stop name based on the address if it's empty
          if (!stop_name) {
            setStopeName(data.display_name.split(",")[0])
          }
        } else {
          // If geocoding fails, at least show the coordinates
          setStopAddress(`Location at ${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}`)
        }
      })
      .catch((error) => {
        console.error("Error in reverse geocoding:", error)
        setStopAddress(`Location at ${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}`)
      })
  }

  // LocationIQ autocomplete
  const fetchSuggestions = async (query) => {
    if (query.length > 2) {
      try {
        const response = await fetch(
          `https://api.locationiq.com/v1/autocomplete.php?key=${LOCATIONIQ_API_KEY}&q=${query}&limit=5&format=json`,
        )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log("LocationIQ suggestions:", data) // Debug log
        setSuggestions(data || [])
      } catch (error) {
        console.error("Error fetching suggestions:", error)
        setSuggestions([])
      }
    } else {
      setSuggestions([])
    }
  }

  // LocationIQ forward geocoding
  const handleSearchSubmit = () => {
    if (!searchQuery.trim() || !mapLoaded) return

    // Use LocationIQ to find the location
    fetch(`https://api.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${searchQuery}&format=json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        if (data && data.length > 0) {
          const location = {
            lat: Number.parseFloat(data[0].lat),
            lng: Number.parseFloat(data[0].lon),
          }

          // Move map to the location with smooth animation
          mapInstanceRef.current.panTo(location)
          mapInstanceRef.current.setZoom(15)

          // Place marker at the location
          placeStopMarker(new window.google.maps.LatLng(location.lat, location.lng))

          // Update the stop name based on the search result if it's empty
          if (!stop_name) {
            setStopeName(data[0].display_name.split(",")[0])
          }

          // Clear the search query and suggestions
          setSearchQuery("")
          setSuggestions([])
        } else {
          // Handle geocoding error
          alert("Location not found. Please try a different search term.")
        }
      })
      .catch((error) => {
        console.error("Error searching location:", error)
        alert("Error searching for location. Please try again.")
      })
  }

  const handleMapTypeChange = (type) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type)
    }
  }

  async function getAllRoutes() {
    try {
      const response = await getRoutes()
      console.log("Routes loaded:", response.data)
      setRoutes(response.data)
    } catch (error) {
      console.error("Error fetching routes:", error)
    }
  }

  useEffect(() => {
    getAllRoutes()
  }, [])

  async function onSubmit(values) {
    console.log("Form values being submitted:", values)
    const stop = {
      stop_name: values.stop_name,
      lat: values.lat,
      lng: values.lng,
    }

    try {
      const response = await addStop(stop, values.route_id)
      onStopAdded()
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
        <div className="relative p-4 w-full max-w-2xl max-h-full">
          {/* Modal content */}
          <div className="relative p-4 bg-white rounded-none shadow dark:bg-gray-800 sm:p-5">
            {/* Modal header */}
            <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Stop</h3>
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
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        fetchSuggestions(e.target.value)
                      }}
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

                    {/* LocationIQ Suggestions Dropdown */}
                    {suggestions && suggestions.length > 0 && (
                      <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                        {suggestions.map((item, index) => (
                          <li
                            key={index}
                            onClick={() => {
                              setSearchQuery(item.display_name)

                              // Create a Google Maps LatLng object from the LocationIQ coordinates
                              const location = new window.google.maps.LatLng(
                                Number.parseFloat(item.lat),
                                Number.parseFloat(item.lon),
                              )

                              // Move map to the location
                              mapInstanceRef.current.setCenter(location)
                              mapInstanceRef.current.setZoom(15)

                              // Place marker at the location
                              placeStopMarker(location)

                              // Update the stop name based on the search result if it's empty
                              if (!stop_name) {
                                setStopeName(item.display_name.split(",")[0])
                              }

                              // Clear suggestions
                              setSuggestions([])
                            }}
                            className="p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                          >
                            {item.display_name}
                          </li>
                        ))}
                      </ul>
                    )}
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
              {lat && lng && (
                <div className="mb-4 p-3 border border-blue-200 bg-blue-50">
                  <p className="text-sm font-medium text-gray-900 mb-1">Selected Stop Location:</p>
                  <p className="text-sm text-gray-600 mb-1">{stopAddress || "Custom location"}</p>
                  <p className="text-xs text-gray-500">
                    Coordinates: {Number.parseFloat(lat).toFixed(6)}, {Number.parseFloat(lng).toFixed(6)}
                  </p>
                </div>
              )}
            </div>

            {/* Modal body */}
            <Formik
              initialValues={{
                stop_name: stop_name || "",
                lat: lat || "",
                lng: lng || "",
                route_id: "",
              }}
              enableReinitialize={true}
              onSubmit={onSubmit}
            >
              {(props) => (
                <form onSubmit={props.handleSubmit}>
                  <div className="grid gap-4 mb-4 sm:grid-cols-2">
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

                    {/* Hidden fields for coordinates */}
                    <Field type="hidden" name="lat" />
                    <Field type="hidden" name="lng" />
                  </div>

                  <button
                    type="submit"
                    disabled={!lat || !lng}
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
                    Add new stop
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

