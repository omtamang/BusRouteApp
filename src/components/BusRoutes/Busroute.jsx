import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getRoutes } from "../api/ApiService"

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
  const [routes, setRoutes] = useState([]);
  const [isActive, setisActive] = useState(true);

  const navigate = useNavigate()

  async function getRoute() {
    try {
      const response = await getRoutes();
      setRoutes(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
     getRoute();
  }, [])

  function getRouteDetails(routeId) {
    navigate(`/map/${routeId}`)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto">
        <div className="bg-green-500 text-white p-4 rounded-b-lg shadow-lg">
          <div className="flex items-center gap-2 mb-1 pt-8">
            <RouteIcon className="h-6 w-6" />
            <h1 className="text-lg font-semibold">Bus Routes Information</h1>
          </div>
          <div className="text-sm">{routes.length} routes available</div>
        </div>

        <div className="p-4 space-y-4">
          {routes.map((route) => (
            <div
              key={route.route_id}
              className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => getRouteDetails(route.route_id)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RouteIcon className={`h-6 w-6 ${isActive ? "text-green-500" : "text-gray-400"}`} />
                    <span className="font-semibold text-lg">{route.route_name}</span>
                  </div>
                  <span
                    className={`text-sm font-medium py-1 px-2 rounded-full ${
                      isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
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
      </div>
    </div>
  )
}

