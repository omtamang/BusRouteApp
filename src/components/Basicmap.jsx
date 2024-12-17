import { useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBus, faLocationCrosshairs, faUser } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export default function Basicmap() {
  const [center, setCenter] = useState([27.755120, 85.410]);
  const [zoom, setZoom] = useState(13);

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
          className="bg-slate-100 w-16 text-center h-16 rounded-full absolute top-20 left-5 z-50 flex items-center justify-center"
        >
          <FontAwesomeIcon className="text-4xl text-black border-black border-2 rounded-full p-1 border-b-8" icon={faUser} />
        </div>
      </Link>

      {/* Floating icons of location, bus and stops */}
      <div className="absolute top-2/4 left-5 text-4xl z-50 text-center space-y-4">
        <div className="bg-[#1D8F34] rounded-full h-14 w-14">
          <FontAwesomeIcon icon={faLocationCrosshairs} className=" text-white rounded-full p-2"/>
        </div>

        <div className="bg-[#1D8F34] rounded-full h-14 w-14">
          <FontAwesomeIcon icon={faBus} className=" text-white rounded-full p-2"/>
        </div>

        <div className="bg-[#1D8F34] rounded-full h-14 w-14">
          <FontAwesomeIcon icon={faLocationCrosshairs} className=" text-white rounded-full p-2"/>
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
