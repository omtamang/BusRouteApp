"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import Dashboard from "./Dashboard"

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
    default: "bg-[#1D8F34] text-white hover:bg-[#1D8F34]",
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

// Simple chart components
const SimpleBarChart = ({ data }) => (
  <div className="flex h-40 items-end space-x-2">
    {data.map((item, index) => (
      <div key={index} className="flex flex-col items-center flex-1">
        <div
          className="w-full bg-blue-500 rounded-t-sm"
          style={{ height: `${(item.value / Math.max(...data.map((d) => d.value))) * 100}%` }}
        ></div>
        <span className="text-xs mt-1 text-gray-600">{item.name}</span>
      </div>
    ))}
  </div>
)

const SimpleLineChart = ({ data }) => (
  <div className="relative h-40">
    <div className="absolute inset-0 flex items-end">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={data
            .map(
              (item, index) =>
                `${(index / (data.length - 1)) * 100},${100 - (item.stops / Math.max(...data.map((d) => d.stops))) * 100}`,
            )
            .join(" ")}
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
        />
      </svg>
    </div>
    <div className="absolute bottom-0 w-full flex justify-between">
      {data.map((item, index) => (
        <span key={index} className="text-xs text-gray-600">
          {item.month}
        </span>
      ))}
    </div>
  </div>
)

const SimplePieChart = ({ data }) => (
  <div className="flex justify-center">
    <div className="relative w-32 h-32">
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

          const colors = ["#3b82f6", "#10b981", "#f59e0b"]

          return <path key={i} d={path} fill={colors[i % colors.length]} />
        })}
        <circle cx="50" cy="50" r="20" fill="white" />
      </svg>
    </div>
  </div>
)

export default function RealDashboard() {
  const [activeSection, setActiveSection] = useState("home")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const dashboardRef = useRef(null)

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

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 dashboard-content">
            <Card className="dashboard-card col-span-full lg:col-span-1">
              <CardHeader>
                <CardTitle>Bus Status</CardTitle>
                <CardDescription>Current fleet status overview</CardDescription>
              </CardHeader>
              <CardContent>
                <SimplePieChart data={busData} />
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {busData.map((item, index) => (
                    <div key={index}>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-lg font-bold">{item.value}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card col-span-full lg:col-span-2">
              <CardHeader>
                <CardTitle>Stop Activity</CardTitle>
                <CardDescription>Monthly stop usage trends</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart data={stopData} />
              </CardContent>
            </Card>

            <Card className="dashboard-card col-span-full">
              <CardHeader>
                <CardTitle>Route Popularity</CardTitle>
                <CardDescription>Passenger count by route</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={routeData} />
              </CardContent>
            </Card>

            <Card className="dashboard-card col-span-full md:col-span-1">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Real-time system health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Status</span>
                    <span className="flex items-center text-sm text-green-500">
                      <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database</span>
                    <span className="flex items-center text-sm text-green-500">
                      <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">GPS Tracking</span>
                    <span className="flex items-center text-sm text-green-500">
                      <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Payment System</span>
                    <span className="flex items-center text-sm text-yellow-500">
                      <span className="mr-1 h-2 w-2 rounded-full bg-yellow-500"></span>
                      Degraded
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card col-span-full md:col-span-1">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Today's overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Buses</p>
                    <p className="text-2xl font-bold">124</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Routes</p>
                    <p className="text-2xl font-bold">18</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Stops</p>
                    <p className="text-2xl font-bold">342</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case "route":
        return (
          <div className="dashboard-content">
            <Dashboard/>
          </div>
        )
      case "stop":
        return (
          <div className="dashboard-content">
            <Card>
              <CardHeader>
                <CardTitle>Stop Management</CardTitle>
                <CardDescription>Your stop components will be displayed here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg border-gray-200">
                  <p className="text-gray-500">Stop components will be rendered here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case "bus":
        return (
          <div className="dashboard-content">
            <Card>
              <CardHeader>
                <CardTitle>Bus Management</CardTitle>
                <CardDescription>Your bus components will be displayed here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg border-gray-200">
                  <p className="text-gray-500">Bus components will be rendered here</p>
                </div>
              </CardContent>
            </Card>
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
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-[#1D8F34] flex items-center justify-center text-white">A</div>
            <div className="ml-3">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-500">admin@gmail.com</p>
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
          </h1>
          <p className="text-gray-500">
            {activeSection === "home" && "Monitor your transit system performance"}
            {activeSection === "route" && "Manage and monitor transit routes"}
            {activeSection === "stop" && "Manage bus stops and stations"}
            {activeSection === "bus" && "Manage your bus fleet"}
          </p>
        </header>

        <Separator className="my-6" />

        {renderContent()}
      </div>
    </div>
  )
}

