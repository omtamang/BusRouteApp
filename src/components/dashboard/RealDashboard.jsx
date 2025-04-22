"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import Dashboard from "./Dashboard"
import StopDashboard from "./StopDashboard"
import UserDashboard from "./UserDashboard"
import BusDashboard from "./BusDashboard"
import { getBus, getRoutes, getStops, getUsers, getAllReminder } from "../api/ApiService"
import React from "react"

// Custom simple components instead of shadcn/ui
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>{children}</div>
)

const CardHeader = ({ children, className = "" }) => <div className={`p-6 pb-2 ${className}`}>{children}</div>

const CardContent = ({ children, className = "" }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>

const CardTitle = ({ children, className = "" }) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>

const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
)

// Update the Button component to better handle alignment
const Button = ({ children, variant = "default", size = "default", className = "", onClick }) => {
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "bg-transparent hover:bg-gray-100",
    outline: "bg-transparent border border-gray-300 hover:bg-gray-50",
  }

  const sizeClasses = {
    default: "py-2 px-4",
    sm: "py-1 px-3 text-sm",
    lg: "py-3 px-6 text-lg",
    icon: "p-2",
  }

  return (
    <button
      className={`rounded-md font-medium transition-colors flex items-center ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

const Separator = ({ className = "" }) => <div className={`h-px bg-gray-200 ${className}`}></div>

// Replace the SimplePieChart component with this improved DonutChart component
const DonutChart = ({ data }) => (
  <div className="flex flex-col items-center">
    <div className="relative w-48 h-48">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {data.map((item, i) => {
          // Calculate the total
          const total = data.reduce((sum, d) => sum + d.value, 0)

          // Calculate start and end angles
          let startAngle = 0
          for (let j = 0; j < i; j++) {
            startAngle += (data[j].value / total) * 360
          }
          const endAngle = startAngle + (item.value / total) * 360

          // Convert angles to radians
          const startRad = ((startAngle - 90) * Math.PI) / 180
          const endRad = ((endAngle - 90) * Math.PI) / 180

          // Calculate path
          const x1 = 50 + 40 * Math.cos(startRad)
          const y1 = 50 + 40 * Math.sin(startRad)
          const x2 = 50 + 40 * Math.cos(endRad)
          const y2 = 50 + 40 * Math.sin(endRad)

          // Determine if the arc should be drawn as a large arc
          const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

          // Create the path
          const path = [`M 50 50`, `L ${x1} ${y1}`, `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`, `Z`].join(" ")

          // Colors for each status
          const colors = {
            Active: "#4285F4", // Blue
            Maintenance: "#34A853", // Green
            Inactive: "#FBBC05", // Yellow/Orange
          }

          return <path key={i} d={path} fill={colors[item.name] || "#ccc"} />
        })}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>
    </div>
    <div className="grid grid-cols-3 gap-8 mt-4 w-full">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="text-sm font-medium">{item.name}</div>
          <div className="text-xl font-bold">{item.value}%</div>
        </div>
      ))}
    </div>
  </div>
)

// Fix the LineChart component to better handle time-based data
const LineChart = ({ data }) => (
  <div className="relative h-64 w-full">
    <div className="absolute inset-0">
      <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
        {data.length > 0 && (
          <polyline
            points={data
              .map(
                (item, index) =>
                  `${(index / (data.length - 1)) * 100},${50 - (item.value / Math.max(...data.map((d) => d.value || 0))) * 40}`,
              )
              .join(" ")}
            fill="none"
            stroke="#4285F4"
            strokeWidth="2"
          />
        )}

        {/* Add data points */}
        {data.map((item, index) => (
          <circle
            key={index}
            cx={`${(index / (data.length - 1)) * 100}`}
            cy={`${50 - (item.value / Math.max(...data.map((d) => d.value || 0))) * 40}`}
            r="1.5"
            fill="#4285F4"
          />
        ))}
      </svg>
    </div>
    <div className="absolute bottom-0 w-full flex justify-between px-2">
      {data.map((item, index) => (
        <span key={index} className="text-sm text-gray-600">
          {item.name || "Unknown"}
        </span>
      ))}
    </div>
  </div>
)

// Fix the BarChart component to handle undefined values
const BarChart = ({ data }) => (
  <div className="flex h-64 items-end space-x-2 px-2">
    {data.length > 0 ? (
      data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div
            className="w-full bg-blue-500 rounded-t-sm"
            style={{
              height: `${(item.value / Math.max(...data.map((d) => d.value || 0))) * 80}%`,
            }}
          ></div>
          <span className="text-sm mt-2 text-gray-600 truncate max-w-full" title={item.name || "Unknown"}>
            {item.name ? (item.name.length > 10 ? `${item.name.substring(0, 10)}...` : item.name) : "Unknown"}
          </span>
        </div>
      ))
    ) : (
      <div className="w-full flex items-center justify-center text-gray-500">No data available</div>
    )}
  </div>
)

// Fix the StackedBarChart component to handle empty data
const StackedBarChart = ({ data, title, xAxisLabel, yAxisLabel }) => (
  <div className="h-64 w-full">
    <div className="flex h-full items-end space-x-2 pb-6 pt-6 px-2 relative">
      {/* Y-axis label */}
      <div className="absolute -left-6 top-1/2 -rotate-90 transform text-xs text-gray-500">{yAxisLabel}</div>

      {/* Stacked Bars */}
      {data.length > 0 ? (
        data.map((item, index) => {
          const total = item.active + item.inactive || 1
          const maxTotal = Math.max(...data.map((d) => d.active + d.inactive || 0)) || 1

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full flex flex-col-reverse">
                {/* Active Reminders */}
                <div
                  className="w-full rounded-t-sm bg-green-500 transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${(item.active / total) * (total / maxTotal) * 80}%`,
                  }}
                ></div>

                {/* Inactive Reminders */}
                <div
                  className="w-full bg-red-400 transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${(item.inactive / total) * (total / maxTotal) * 80}%`,
                  }}
                ></div>
              </div>
              <span className="mt-2 text-xs text-gray-600 truncate max-w-full" title={item.name || "Unknown"}>
                {item.name ? (item.name.length > 10 ? `${item.name.substring(0, 10)}...` : item.name) : "Unknown"}
              </span>
            </div>
          )
        })
      ) : (
        <div className="w-full flex items-center justify-center text-gray-500">No data available</div>
      )}

      {/* X-axis label */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-gray-500">{xAxisLabel}</div>

      {/* Legend */}
      <div className="absolute top-0 right-0 flex items-center space-x-4">
        <div className="flex items-center">
          <div className="h-3 w-3 bg-green-500 mr-1"></div>
          <span className="text-xs">Active</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 bg-red-400 mr-1"></div>
          <span className="text-xs">Inactive</span>
        </div>
      </div>
    </div>
  </div>
)

// Fix the HeatMap component to handle empty data
const HeatMap = ({ data, xLabels, yLabels, title }) => (
  <div className="w-full overflow-x-auto">
    {xLabels.length > 0 && yLabels.length > 0 ? (
      <div className="min-w-[600px]">
        <div className="grid" style={{ gridTemplateColumns: `80px repeat(${xLabels.length}, 1fr)` }}>
          {/* Empty top-left cell */}
          <div className="h-10"></div>

          {/* Column headers (routes) */}
          {xLabels.map((label, index) => (
            <div key={index} className="h-10 flex items-center justify-center text-xs font-medium">
              {label ? (label.length > 10 ? `${label.substring(0, 10)}...` : label) : "Unknown"}
            </div>
          ))}

          {/* Row headers (time slots) and data cells */}
          {yLabels.map((yLabel, yIndex) => (
            <React.Fragment key={`row-${yIndex}`}>
              {/* Row header (time slot) */}
              <div className="flex items-center justify-end pr-2 text-xs">{yLabel || "Unknown"}</div>

              {/* Data cells */}
              {xLabels.map((xLabel, xIndex) => {
                const cellData = data.find((d) => d.x === xLabel && d.y === yLabel)
                const value = cellData ? cellData.value : 0
                const maxValue = Math.max(...data.map((d) => d.value || 0)) || 1
                const intensity = value / maxValue

                return (
                  <div
                    key={`${xIndex}-${yIndex}`}
                    className="h-8 m-1 rounded flex items-center justify-center text-xs"
                    style={{
                      backgroundColor: `rgba(66, 133, 244, ${intensity * 0.9})`,
                      color: intensity > 0.5 ? "white" : "black",
                    }}
                    title={`${xLabel || "Unknown"}: ${value} buses at ${yLabel || "Unknown"}`}
                  >
                    {value > 0 ? value : ""}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    ) : (
      <div className="h-64 w-full flex items-center justify-center text-gray-500">No data available for heatmap</div>
    )}
  </div>
)

// Stacked Bar Chart Component
// const StackedBarChart = ({ data, title, xAxisLabel, yAxisLabel }) => (
//   <div className="h-64 w-full">
//     <div className="flex h-full items-end space-x-2 pb-6 pt-6 px-2 relative">
//       {/* Y-axis label */}
//       <div className="absolute -left-6 top-1/2 -rotate-90 transform text-xs text-gray-500">{yAxisLabel}</div>

//       {/* Stacked Bars */}
//       {data.map((item, index) => (
//         <div key={index} className="flex flex-col items-center flex-1">
//           <div className="w-full flex flex-col-reverse">
//             {/* Active Reminders */}
//             <div
//               className="w-full rounded-t-sm bg-green-500 transition-all duration-300 hover:opacity-80"
//               style={{
//                 height: `${
//                   (item.active / (item.active + item.inactive)) *
//                   ((item.active + item.inactive) / Math.max(...data.map((d) => d.active + d.inactive))) *
//                   80
//                 }%`,
//               }}
//             ></div>

//             {/* Inactive Reminders */}
//             <div
//               className="w-full bg-red-400 transition-all duration-300 hover:opacity-80"
//               style={{
//                 height: `${
//                   (item.inactive / (item.active + item.inactive)) *
//                   ((item.active + item.inactive) / Math.max(...data.map((d) => d.active + d.inactive))) *
//                   80
//                 }%`,
//               }}
//             ></div>
//           </div>
//           <span className="mt-2 text-xs text-gray-600 truncate max-w-full" title={item.name}>
//             {item.name.length > 10 ? `${item.name.substring(0, 10)}...` : item.name}
//           </span>
//         </div>
//       ))}

//       {/* X-axis label */}
//       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-gray-500">{xAxisLabel}</div>

//       {/* Legend */}
//       <div className="absolute top-0 right-0 flex items-center space-x-4">
//         <div className="flex items-center">
//           <div className="h-3 w-3 bg-green-500 mr-1"></div>
//           <span className="text-xs">Active</span>
//         </div>
//         <div className="flex items-center">
//           <div className="h-3 w-3 bg-red-400 mr-1"></div>
//           <span className="text-xs">Inactive</span>
//         </div>
//       </div>
//     </div>
//   </div>
// )

// Heat Map Component
// const HeatMap = ({ data, xLabels, yLabels, title }) => (
//   <div className="w-full overflow-x-auto">
//     <div className="min-w-[600px]">
//       <div className="grid" style={{ gridTemplateColumns: `80px repeat(${xLabels.length}, 1fr)` }}>
//         {/* Empty top-left cell */}
//         <div className="h-10"></div>

//         {/* Column headers (routes) */}
//         {xLabels.map((label, index) => (
//           <div key={index} className="h-10 flex items-center justify-center text-xs font-medium">
//             {label.length > 10 ? `${label.substring(0, 10)}...` : label}
//           </div>
//         ))}

//         {/* Row headers (time slots) and data cells */}
//         {yLabels.map((yLabel, yIndex) => (
//           <>
//             {/* Row header (time slot) */}
//             <div key={`y-${yIndex}`} className="flex items-center justify-end pr-2 text-xs">
//               {yLabel}
//             </div>

//             {/* Data cells */}
//             {xLabels.map((xLabel, xIndex) => {
//               const cellData = data.find((d) => d.x === xLabel && d.y === yLabel)
//               const value = cellData ? cellData.value : 0
//               const maxValue = Math.max(...data.map((d) => d.value))
//               const intensity = value / maxValue

//               return (
//                 <div
//                   key={`${xIndex}-${yIndex}`}
//                   className="h-8 m-1 rounded flex items-center justify-center text-xs"
//                   style={{
//                     backgroundColor: `rgba(66, 133, 244, ${intensity * 0.9})`,
//                     color: intensity > 0.5 ? "white" : "black",
//                   }}
//                   title={`${xLabel}: ${value} buses at ${yLabel}`}
//                 >
//                   {value > 0 ? value : ""}
//                 </div>
//               )
//             })}
//           </>
//         ))}
//       </div>
//     </div>
//   </div>
// )

export default function RealDashboard() {
  const [activeSection, setActiveSection] = useState("home")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const dashboardRef = useRef(null)

  // Monitor state
  const [monitorBuses, setMonitorBuses] = useState([])
  const [reminders, setReminders] = useState([])
  const [passengers, setPassengers] = useState([])
  const [routeAnalysis, setRouteAnalysis] = useState([])
  const [stopReminders, setStopReminders] = useState([])
  const [passengerEmail, setPassengerEmail] = useState("")
  const [passengerReminders, setPassengerReminders] = useState([])
  const [monitorLoading, setMonitorLoading] = useState(false)
  const [monitorError, setMonitorError] = useState(null)
  const [routes, setRoutes] = useState([])
  const [stops, setStops] = useState([])
  const [timeRange, setTimeRange] = useState("day")

  async function getAllBus() {
    try {
      const response = await getBus()
      return response
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async function getAlPassenger(params) {
    try {
      const response = await getUsers()
      return response
    } catch (error) {
      console.log(error)
      return null
    }
  }

  // Fetch monitor data when switching to monitor section
  useEffect(() => {
    if (activeSection === "home") {
      fetchAllData()
    }
  }, [activeSection])

  // Fetch all data for dashboard
  const fetchAllData = async () => {
    setMonitorLoading(true)
    setMonitorError(null)

    try {
      // Fetch buses
      const busResponse = await getBus()
      if (busResponse?.data) {
        setMonitorBuses(busResponse.data)
      } else {
        // Fallback data if API doesn't return expected format
        setMonitorBuses([
          {
            busId: 1,
            busNo: "B101",
            status: true,
            nextStop: "Downtown",
            approximate_arrival_time: "10:30 AM",
            route_id: 1,
          },
          {
            busId: 2,
            busNo: "B102",
            status: false,
            nextStop: "Mall",
            approximate_arrival_time: "11:15 AM",
            route_id: 2,
          },
          {
            busId: 3,
            busNo: "B103",
            status: true,
            nextStop: "Airport",
            approximate_arrival_time: "09:45 AM",
            route_id: 1,
          },
          {
            busId: 4,
            busNo: "B104",
            status: true,
            nextStop: "University",
            approximate_arrival_time: "10:00 AM",
            route_id: 3,
          },
          {
            busId: 5,
            busNo: "B105",
            status: false,
            nextStop: "Hospital",
            approximate_arrival_time: "12:30 PM",
            route_id: 2,
          },
        ])
      }

      // Fetch routes
      const routeResponse = await getRoutes()
      if (routeResponse?.data) {
        setRoutes(routeResponse.data)
      } else {
        // Sample data
        setRoutes([
          { route_id: 1, route_name: "Downtown Express", no_of_buses: 3 },
          { route_id: 2, route_name: "Airport Shuttle", no_of_buses: 3 },
          { route_id: 3, route_name: "University Line", no_of_buses: 2 },
          { route_id: 4, route_name: "Beach Route", no_of_buses: 2 },
        ])
      }

      // Fetch stops
      const stopResponse = await getStops()
      if (stopResponse?.data) {
        setStops(stopResponse.data)
      } else {
        // Sample data
        setStops([
          { stop_id: 1, stop_name: "Downtown", route_id: 1 },
          { stop_id: 2, stop_name: "Mall", route_id: 2 },
          { stop_id: 3, stop_name: "Airport", route_id: 1 },
          { stop_id: 4, stop_name: "University", route_id: 3 },
          { stop_id: 5, stop_name: "Hospital", route_id: 2 },
        ])
      }

      // Fetch passengers
      const userResponse = await getUsers()
      if (userResponse?.data) {
        setPassengers(userResponse.data)
      } else {
        // Fallback data
        setPassengers([
          { passenger_id: 1, passenger_name: "John Doe", email: "john@example.com", verified: true },
          { passenger_id: 2, passenger_name: "Jane Smith", email: "jane@example.com", verified: true },
          { passenger_id: 3, passenger_name: "Bob Johnson", email: "bob@example.com", verified: false },
          { passenger_id: 4, passenger_name: "Alice Brown", email: "alice@example.com", verified: true },
          { passenger_id: 5, passenger_name: "Charlie Davis", email: "charlie@example.com", verified: false },
        ])
      }

      // Fetch reminders
      const reminderResponse = await getAllReminder()
      if (reminderResponse?.data) {
        setReminders(reminderResponse.data)
      } else {
        // Fallback data
        setReminders([
          { notification_id: 1, label: "Morning Commute", time: "08:30", status: true, route_id: 1, stop_id: 1 },
          { notification_id: 2, label: "Airport Trip", time: "09:15", status: true, route_id: 2, stop_id: 3 },
          { notification_id: 3, label: "University Class", time: "10:00", status: false, route_id: 3, stop_id: 4 },
          { notification_id: 4, label: "Hospital Visit", time: "08:30", status: true, route_id: 2, stop_id: 5 },
          { notification_id: 5, label: "Stadium Game", time: "11:45", status: true, route_id: 4, stop_id: 6 },
        ])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setMonitorError("Failed to fetch data. Please try again.")
    } finally {
      setMonitorLoading(false)
    }
  }

  // Fetch reminders for a specific passenger
  const fetchPassengerReminders = async (email) => {
    if (!email) return

    setMonitorLoading(true)
    try {
      // Filter reminders for the specific passenger
      // In a real app, you would call a specific API endpoint
      const filteredReminders = reminders.filter((reminder) => reminder.passenger_email === email)

      // If no reminders found for this email, use sample data for demonstration
      if (filteredReminders.length === 0) {
        setPassengerReminders([
          {
            notification_id: 1,
            label: "Morning Commute",
            time: "08:30",
            status: true,
            route_name: "Route A",
            stop_name: "Downtown",
            passenger_email: email,
          },
          {
            notification_id: 2,
            label: "Evening Return",
            time: "17:15",
            status: true,
            route_name: "Route A",
            stop_name: "University",
            passenger_email: email,
          },
          {
            notification_id: 3,
            label: "Weekend Trip",
            time: "10:00",
            status: false,
            route_name: "Route B",
            stop_name: "Mall",
            passenger_email: email,
          },
        ])
      } else {
        setPassengerReminders(filteredReminders)
      }
    } catch (error) {
      console.error("Error fetching passenger reminders:", error)
      setMonitorError("Failed to fetch reminders for this passenger.")
    } finally {
      setMonitorLoading(false)
    }
  }

  // Delete a reminder for a passenger
  const deleteReminder = async (notificationId, email) => {
    setMonitorLoading(true)
    try {
      // In a real app, you would call an API to delete the reminder
      // For now, just filter it out from the state
      setPassengerReminders((prev) => prev.filter((reminder) => reminder.notification_id !== notificationId))

      // Also update the main reminders list
      setReminders((prev) => prev.filter((reminder) => reminder.notification_id !== notificationId))
    } catch (error) {
      console.error("Error deleting reminder:", error)
      setMonitorError("Failed to delete reminder.")
    } finally {
      setMonitorLoading(false)
    }
  }

  // Animation when component mounts
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".dashboard-card", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      })

      gsap.from(".sidebar-item", {
        x: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, dashboardRef)

    return () => ctx.revert()
  }, [])

  // Animation when switching sections
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".dashboard-content", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
    }, dashboardRef)

    return () => ctx.revert()
  }, [activeSection])

  // Sample data for charts
  const routeData = [
    { name: "Route A", value: 42 },
    { name: "Route B", value: 28 },
    { name: "Route C", value: 35 },
    { name: "Route D", value: 15 },
  ]

  const stopData = [
    { month: "Jan", stops: 65 },
    { month: "Feb", stops: 59 },
    { month: "Mar", stops: 80 },
    { month: "Apr", stops: 81 },
    { month: "May", stops: 56 },
    { month: "Jun", stops: 55 },
    { month: "Jul", stops: 40 },
  ]

  const busData = [
    { name: "Active", value: 72 },
    { name: "Maintenance", value: 18 },
    { name: "Inactive", value: 10 },
  ]

  // Update the icon components to have consistent sizing and alignment
  const HomeIcon = () => (
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
      className="mr-2 flex-shrink-0"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  )

  const RouteIcon = () => (
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
      className="mr-2 flex-shrink-0"
    >
      <circle cx="6" cy="19" r="3"></circle>
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"></path>
      <circle cx="18" cy="5" r="3"></circle>
    </svg>
  )

  const MapPinIcon = () => (
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
      className="mr-2 flex-shrink-0"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  )

  const BusIcon = () => (
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
      className="mr-2 flex-shrink-0"
    >
      <path d="M8 6v6"></path>
      <path d="M15 6v6"></path>
      <path d="M2 12h19.6"></path>
      <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.2 0-2.1.8-2.4 1.8L.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path>
      <circle cx="7" cy="18" r="2"></circle>
      <path d="M9 18h5"></path>
      <circle cx="16" cy="18" r="2"></circle>
    </svg>
  )

  const UserIcon = () => (
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
      className="mr-2 flex-shrink-0"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  )

  const MenuIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12"></line>
      <line x1="4" x2="20" y1="6" y2="6"></line>
      <line x1="4" x2="20" y1="18" y2="18"></line>
    </svg>
  )

  const XIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
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

  const MonitorIcon = () => (
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
      className="mr-2 flex-shrink-0"
    >
      <rect width="20" height="14" x="2" y="3" rx="2"></rect>
      <line x1="8" x2="16" y1="21" y2="21"></line>
      <line x1="12" x2="12" y1="17" y2="21"></line>
    </svg>
  )

  const AnalyticsIcon = () => (
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
      className="mr-2 flex-shrink-0"
    >
      <path d="M3 3v18h18"></path>
      <path d="M18 17V9"></path>
      <path d="M13 17V5"></path>
      <path d="M8 17v-3"></path>
    </svg>
  )

  // Fix the renderContent function to fix data processing issues
  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return (
          <div className="grid gap-6 dashboard-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bus Status Chart - Pie Chart: Percentage of active vs inactive buses */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>Bus Status</CardTitle>
                  <CardDescription>Current fleet status overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <DonutChart
                    data={[
                      {
                        name: "Active",
                        value:
                          monitorBuses.length > 0
                            ? Math.round((monitorBuses.filter((bus) => bus.status).length / monitorBuses.length) * 100)
                            : 72,
                      },
                      {
                        name: "Inactive",
                        value:
                          monitorBuses.length > 0
                            ? Math.round((monitorBuses.filter((bus) => !bus.status).length / monitorBuses.length) * 100)
                            : 28,
                      },
                    ]}
                  />
                </CardContent>
              </Card>

              {/* Buses Per Route - Bar Chart: Number of buses per route */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>Buses Per Route</CardTitle>
                  <CardDescription>Number of buses operating on each route</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={routes.map((route) => {
                      const busCount = monitorBuses.filter((bus) => bus.route_id === route.route_id).length
                      return {
                        name: route.route_name || `Route ${route.route_id}`,
                        value: busCount || route.no_of_buses || 0, // Fallback to no_of_buses if count is 0
                      }
                    })}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reminders Over Time - Line Chart: Number of reminders set over time */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>Reminders Over Time</CardTitle>
                  <CardDescription>Number of reminders set for each time slot</CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={(() => {
                      // Group reminders by time and count
                      const remindersByTime = reminders.reduce((acc, reminder) => {
                        const time = reminder.time || "Unscheduled"
                        if (!acc[time]) {
                          acc[time] = 0
                        }
                        acc[time]++
                        return acc
                      }, {})

                      // Sort by time
                      const sortedTimes = Object.keys(remindersByTime).sort()

                      // If no data, provide sample data
                      if (sortedTimes.length === 0) {
                        return [
                          { name: "00:00", value: 2 },
                          { name: "08:00", value: 5 },
                          { name: "16:00", value: 8 },
                        ]
                      }

                      return sortedTimes.map((time) => ({
                        name: time,
                        value: remindersByTime[time],
                      }))
                    })()}
                  />
                </CardContent>
              </Card>

              {/* Passenger Verification - Donut Chart: Verified vs unverified passengers */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>Passenger Verification</CardTitle>
                  <CardDescription>Percentage of verified vs unverified passengers</CardDescription>
                </CardHeader>
                <CardContent>
                  <DonutChart
                    data={[
                      {
                        name: "Verified",
                        value:
                          passengers.length > 0
                            ? Math.round((passengers.filter((p) => p.verified).length / passengers.length) * 100)
                            : 89,
                      },
                      {
                        name: "Unverified",
                        value:
                          passengers.length > 0
                            ? Math.round((passengers.filter((p) => !p.verified).length / passengers.length) * 100)
                            : 11,
                      },
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case "route":
        return (
          <div className="dashboard-content w-full h-full">
            <Dashboard />
          </div>
        )
      case "stop":
        return (
          <div className="dashboard-content w-full h-full">
            <StopDashboard />
          </div>
        )
      case "bus":
        return (
          <div className="dashboard-content">
            <BusDashboard />
          </div>
        )
      case "user":
        return (
          <div className="dashboard-content w-full h-full">
            <UserDashboard />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div ref={dashboardRef} className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <XIcon /> : <MenuIcon />}
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center px-6 border-b">
          <h1 className="text-xl font-bold">Transit Admin</h1>
        </div>

        {/* Update the sidebar navigation buttons to ensure proper alignment */}
        <nav className="space-y-1 p-4">
          <Button
            variant={activeSection === "home" ? "default" : "ghost"}
            className="w-full justify-start text-left sidebar-item"
            onClick={() => setActiveSection("home")}
          >
            <HomeIcon />
            <span>Home</span>
          </Button>

          <Button
            variant={activeSection === "route" ? "default" : "ghost"}
            className="w-full justify-start text-left sidebar-item"
            onClick={() => setActiveSection("route")}
          >
            <RouteIcon />
            <span>Route</span>
          </Button>

          <Button
            variant={activeSection === "stop" ? "default" : "ghost"}
            className="w-full justify-start text-left sidebar-item"
            onClick={() => setActiveSection("stop")}
          >
            <MapPinIcon />
            <span>Stop</span>
          </Button>

          <Button
            variant={activeSection === "bus" ? "default" : "ghost"}
            className="w-full justify-start text-left sidebar-item"
            onClick={() => setActiveSection("bus")}
          >
            <BusIcon />
            <span>Bus</span>
          </Button>

          <Button
            variant={activeSection === "user" ? "default" : "ghost"}
            className="w-full justify-start text-left sidebar-item"
            onClick={() => setActiveSection("user")}
          >
            <UserIcon />
            <span>User</span>
          </Button>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">A</div>
            <div className="ml-3">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-500">admin@transit.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {activeSection === "home" && "Dashboard Overview"}
            {activeSection === "route" && "Route Management"}
            {activeSection === "stop" && "Stop Management"}
            {activeSection === "bus" && "Bus Management"}
            {activeSection === "user" && "User Management"}
          </h1>
          <p className="text-gray-500">
            {activeSection === "home" && "Monitor your transit system performance"}
            {activeSection === "route" && "Manage and monitor transit routes"}
            {activeSection === "stop" && "Manage bus stops and stations"}
            {activeSection === "bus" && "Manage your bus fleet"}
            {activeSection === "user" && "Manage user accounts and permissions"}
          </p>
        </header>

        <Separator className="my-6" />

        {renderContent()}
      </div>
    </div>
  )
}
