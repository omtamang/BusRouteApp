import { useEffect } from "react"
import { googleLoginHandline } from "../api/ApiService"
import { useAuth } from "../security/AuthProvider"
import { useNavigate, useParams } from "react-router-dom"


export default function GoogleLoginHandling(){
    const {setToken} = useAuth()
    const navigate = useNavigate()
    const { email } = useParams()

    function googleHandle() {
        setTimeout(() => {
            setToken(email)
            navigate('/bus-route');
        }, 3000);
    }

    useEffect(() => {
        googleHandle()
    })
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-700 text-white z-50">
        <div className="flex flex-col items-center space-y-6">
          {/* Rotating globe animation */}
          <div className="relative w-24 h-24">
            {/* Outer spinning circle */}
            <div
              className="absolute inset-0 border-4 border-t-transparent border-white rounded-full"
              style={{ animation: "spin 3s linear infinite" }}
            ></div>
            {/* Inner dotted spinning circle */}
            <div
              className="absolute inset-4 border-4 border-dotted border-white border-t-transparent rounded-full"
              style={{ animation: "spin 1s linear infinite" }}
            ></div>
          </div>
          {/* Message */}
          <p className="text-lg font-semibold animate-pulse">
            Signup Successful! Redirecting...
          </p>
        </div>
        {/* Add custom spin keyframes inline */}
        <style>
          {`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    )
}