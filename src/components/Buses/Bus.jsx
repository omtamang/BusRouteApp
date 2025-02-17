import React from "react";
import { useNavigate } from "react-router-dom";

const BusIcon = ({ className }) => (
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
      <path d="M8 6v6" />
      <path d="M15 6v6" />
      <path d="M2 12h19.6" />
      <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
  
  const NavigationIcon = ({ className }) => (
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
      <polygon points="12 2 19 21 12 17 5 21 12 2" />
    </svg>
  )
  
export default function Bus() {
  const navigate = useNavigate();

    const busRoutes = [
      {
        id: "1",
        busNumber: "8288",
        nextStop: "Gokarna",
        arrivalTime: "2 minutes",
        speed: 40,
        isActive: true,
      },
      {
        id: "2",
        busNumber: "9588",
        nextStop: "Medical College",
        arrivalTime: "10 minutes",
        speed: 10,
        isActive: true,
      }
    ]

    function getRoute(){
      navigate('/map');
    }

    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-md mx-auto">
          <div className="bg-green-500 text-white p-4 rounded-b-lg shadow-lg">
            <div className="flex items-center gap-2 mb-1 pt-8">
              <BusIcon className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Nearest Bus route's buses</h1>
            </div>
            <div className="text-sm">{busRoutes.length} buses</div>
          </div>
  
          <div className="h-[calc(100vh-100px)] overflow-y-auto">
            <div className="p-4 space-y-3">
              {busRoutes.map((route) => (
                <div key={route.id} className="bg-white p-3 rounded-lg shadow-sm" onClick={getRoute}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <BusIcon className={`h-5 w-5 ${route.isActive ? "text-green-500" : "text-gray-400"}`} />
                        <span className="font-semibold">Bus {route.busNumber}</span>
                      </div>
                      <div className="text-sm text-gray-600">Next Stop: {route.nextStop}</div>
                      <div className="text-sm">Arrival Time: {route.arrivalTime}</div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <NavigationIcon className="h-4 w-4" />
                      {route.speed} km/hr
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  