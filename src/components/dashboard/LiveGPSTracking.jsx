import { useState, useEffect } from "react";
import axios from "axios";

export default function LiveGPSTracking() {
  const [location, setLocation] = useState({ latitude: "Loading...", longitude: "Loading..." });
  const SERVER_URL = "http://localhost:8080/api/location"; // Replace with your server URL

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get(SERVER_URL);
        setLocation({ latitude: response.data.latitude, longitude: response.data.longitude });
        console.log("location printed", location)
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    fetchLocation(); // Fetch initially
    const interval = setInterval(fetchLocation, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Live GPS Tracking</h1>
      <p className="text-lg">Latitude: {location.latitude}, Longitude: {location.longitude}</p>
    </div>
  );
}
