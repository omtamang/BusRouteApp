import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../security/AuthProvider"

export default function Landing() {
  const { token } = useAuth()
  const navigate = useNavigate()

  function route() {
    if (token) {
      navigate("/bus-route")
    } else {
      navigate("/signup")
    }
  }

  return (
    <div className="flex flex-col items-center justify-between h-screen p-4 text-center">
      <div className="w-full">
        <img src="/images/Logo/logo.png" alt="logo" className="w-16 sm:w-20 md:w-24 mx-auto mb-2" />
      </div>

      <div className="w-full flex-grow flex flex-col justify-center items-center">
        <img
          src="/images/Logo/Landing.png"
          alt="Bus stand logo"
          className="w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px] mx-auto mb-4"
        />

        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-1">Welcome</h1>
        <p className="text-[#45534A] text-xs sm:text-sm md:text-base mb-4">
          Create an account and start your Bus Journey
        </p>

        <button
          className="bg-[#1D8F34] text-white text-base sm:text-lg md:text-xl w-full max-w-[250px] py-2 rounded-full hover:bg-[#167029] transition-colors duration-300"
          onClick={route}
        >
          Getting Started
        </button>
      </div>

      <div className="w-full">
        <p className="text-[#45534A] text-xs sm:text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-[#AC1A0F] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

