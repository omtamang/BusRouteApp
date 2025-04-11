"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { getRoutes } from "../api/ApiService"
import { gsap } from "gsap"

const RouteIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="4" cy="12" r="2" />
    <circle cx="20" cy="12" r="2" />
    <path d="M4 12h2c2 0 5-2 7-2s5 2 7 2h2" />
  </svg>
)

export default function BusRoutes() {
  const [routes, setRoutes] = useState([])
  const [isActive, setIsActive] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const headerRef = useRef(null)
  const titleRef = useRef(null)
  const searchRef = useRef(null)
  const routeRefs = useRef([])

  const navigate = useNavigate()

  async function getRoute() {
    try {
      const response = await getRoutes()
      console.log(response)
      setRoutes(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getRoute()

    // Header animation
    gsap.fromTo(headerRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })

    // Title animation
    gsap.fromTo(
      titleRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, delay: 0.3, ease: "back.out(1.7)" },
    )

    // Search animation
    gsap.fromTo(
      searchRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: 0.5, ease: "power2.out" },
    )
  }, [])

  // Animate route cards when they're added to the DOM
  useEffect(() => {
    if (routes.length > 0 && routeRefs.current.length > 0) {
      routeRefs.current.forEach((route, index) => {
        if (route) {
          gsap.fromTo(
            route,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              delay: 0.1 * index + 0.6,
              ease: "power2.out",
            },
          )
        }
      })
    }
  }, [routes])

  function getRouteDetails(routeId) {
    navigate(`/map/${routeId}`)
  }

  // Filter routes based on search term and filter selection
  const filteredRoutes = routes.filter((route) => {
    const matchesSearch = route.route_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "active" && route.isActive) ||
      (selectedFilter === "inactive" && !route.isActive)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div ref={headerRef} className="bg-green-500 text-white p-4 md:p-6 lg:p-8 rounded-b-lg md:rounded-none shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div ref={titleRef} className="flex items-center gap-2 mb-2 pt-8 md:pt-2">
            <RouteIcon className="h-6 w-6 md:h-8 md:w-8" />
            <h1 className="text-lg md:text-2xl lg:text-3xl font-semibold">Bus Routes Information</h1>
          </div>
          <div className="text-sm md:text-base">{routes.length} routes available</div>

          {/* Search and Filter - Desktop Only */}
          <div
            ref={searchRef}
            className="hidden md:flex items-center justify-between mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-3"
          >
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search routes..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === "all"
                    ? "bg-white text-green-600 font-medium"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter("active")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === "active"
                    ? "bg-white text-green-600 font-medium"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setSelectedFilter("inactive")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === "inactive"
                    ? "bg-white text-green-600 font-medium"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden p-4 bg-white shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search routes..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Mobile Filter */}
        <div className="flex space-x-2 mt-3">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`flex-1 px-2 py-1 text-sm rounded-lg transition-colors ${
              selectedFilter === "all"
                ? "bg-green-500 text-white font-medium"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedFilter("active")}
            className={`flex-1 px-2 py-1 text-sm rounded-lg transition-colors ${
              selectedFilter === "active"
                ? "bg-green-500 text-white font-medium"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setSelectedFilter("inactive")}
            className={`flex-1 px-2 py-1 text-sm rounded-lg transition-colors ${
              selectedFilter === "inactive"
                ? "bg-green-500 text-white font-medium"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRoutes.map((route, index) => (
            <div
              key={route.route_id}
              ref={(el) => (routeRefs.current[index] = el)}
              className="bg-white p-5 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 hover:bg-gray-50"
              onClick={() => getRouteDetails(route.route_id)}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 p-3 rounded-full">
                      <RouteIcon className={`h-6 w-6 ${route.isActive ? "text-green-500" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <span className="font-semibold text-lg block">{route.route_name}</span>
                      <span className="text-sm text-gray-500">Route #{route.route_id}</span>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium py-1 px-3 rounded-full ${
                      route.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {route.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>Fare: 30-50</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                      />
                    </svg>
                    <div>No. of buses: {route.no_of_buses}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {filteredRoutes.map((route, index) => (
            <div
              key={route.route_id}
              ref={(el) => (routeRefs.current[index] = el)}
              className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => getRouteDetails(route.route_id)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RouteIcon className={`h-6 w-6 ${route.isActive ? "text-green-500" : "text-gray-400"}`} />
                    <span className="font-semibold text-lg">{route.route_name}</span>
                  </div>
                  <span
                    className={`text-sm font-medium py-1 px-2 rounded-full ${
                      route.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {route.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="text-sm text-gray-600">Fare: 30-50</div>
                  <div>No. of buses: {route.no_of_buses}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRoutes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">No routes found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
