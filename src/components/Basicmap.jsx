import { useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default function Basicmap() {
  const [center, setCenter] = useState([27.755120, 85.410]);
  const [zoom, setZoom] = useState(13);

  window.onload = getLocation();

  function getLocation() {
    console.log("button clicked");
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
      <div
        className="bg-slate-100 w-14 text-center h-14 rounded-full absolute top-20 left-5 z-50 flex items-center justify-center"
      >
        <FontAwesomeIcon className="text-4xl text-black" icon={faUser} />
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
