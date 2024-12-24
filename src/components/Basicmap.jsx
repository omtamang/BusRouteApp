import { useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBus, faCircleStop, faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useAuth } from "./security/AuthProvider";

export default function Basicmap() {
  const [center, setCenter] = useState([27.755120, 85.410]);
  const [zoom, setZoom] = useState(13);
  const {token} = useAuth()

  window.onload = getLocation();

  function getLocation() {
    //console.log("button clicked");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      console.log("Geolocation not supported");
    }
  }

  async function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    setCenter([latitude, longitude]);
  }

  function error() {
    console.log("unable to retrieve location");
  }

  const iconPerson = new L.Icon({
    iconUrl: require("./current_location.png"),
    iconSize: [45, 45],
  });

  return (
    <div className="relative w-full h-screen">
      {/* Floating Icon */}
      <Link to={"/profile"}>
        <div
          className="w-14 text-center h-14 absolute top-20 left-5 z-50 flex items-center justify-center"
        >
          <img src="/images/Logo/profile.png" alt="profile logo"
            className="rounded-full"
          />
        </div>
      </Link>

      {/* Floating icons of location, bus and stops */}
      <div className="absolute top-2/4 left-5 text-4xl z-50 text-center space-y-4 text-white">
        <div>
          <FontAwesomeIcon icon={faLocationCrosshairs} className="bg-[#1D8F34] rounded-full p-2"/>
        </div>
        <div>
          <FontAwesomeIcon icon={faBus} className="bg-[#1D8F34] rounded-full p-2"/>
        </div>
        <div>
          <FontAwesomeIcon icon={faCircleStop} className="bg-[#1D8F34] rounded-full p-2"/>
        </div>
      </div>

      {/* Map Container */}
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} zoomControl={false} className="w-full h-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={iconPerson}>
          <Popup>Hello you are here</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
