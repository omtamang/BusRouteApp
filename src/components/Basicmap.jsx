import { useState, useRef, useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBus, faCircleStop, faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export default function BasicMap() {
  const [center, setCenter] = useState({ lat: 27.7172, lon: 85.3240 }); // Default: Kathmandu
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const routingControlRef = useRef(null); // Prevent duplicate routes

  // Get user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (err) => {
          setError(err.message);
        },
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  // Add routing control only once
  useEffect(() => {
    if (mapRef.current && !routingControlRef.current) {
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(27.7777, 85.4321), // Sundarijal Buspark
          L.latLng(27.7066, 85.3167), // Ratnapark
        ],
        routeWhileDragging: true,
        router: L.Routing.osrmv1(), // ✅ FIXED: Uses free OSRM routing
        lineOptions: {
          styles: [{ color: "blue", weight: 4 }],
        },
      });

      routingControl.addTo(mapRef.current);
      routingControlRef.current = routingControl;
    }
  }, []);

  // Custom marker for user location
  const iconPerson = new L.Icon({
    iconUrl: require("./current_location.png"),
    iconSize: [45, 45],
  });

  return (
    <div className="relative w-full h-screen">
      <Link to={"/profile"}>
        <div className="w-14 text-center h-14 absolute top-20 left-5 z-50 flex items-center justify-center">
          <img src="/images/Logo/profile.png" alt="profile logo" className="rounded-full" />
        </div>
      </Link>

      <div className="absolute top-2/4 left-5 text-4xl z-50 text-center space-y-4 text-white">
        <div className="cursor-pointer">
          <FontAwesomeIcon icon={faLocationCrosshairs} className="bg-[#1D8F34] rounded-full p-2" />
        </div>
        <div className="cursor-pointer">
          <FontAwesomeIcon icon={faBus} className="bg-[#1D8F34] rounded-full p-2" />
        </div>
        <div className="cursor-pointer">
          <FontAwesomeIcon icon={faCircleStop} className="bg-[#1D8F34] rounded-full p-2" />
        </div>
      </div>

      <MapContainer
        center={[center.lat, center.lon]}
        zoom={14}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0"
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {center.lat && center.lon && (
          <Marker position={[center.lat, center.lon]} icon={iconPerson}>
            <Popup>Hello, you are here</Popup>
          </Marker>
        )}
      </MapContainer>

      {error && <div className="absolute top-5 left-5 bg-red-500 text-white p-2">{error}</div>}
    </div>
  );
}
