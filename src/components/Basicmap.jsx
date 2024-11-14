import { useState } from "react"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import L from 'leaflet'

export default function Basicmap(){
    const [center, setCenter] = useState([27.755120, 85.410])
    const [zoom, setZoom] = useState(13)

    window.onload = getLocation();

    function getLocation(){
        console.log("button clicked")
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, error);
        } else {
            console.log("Geolocation not supported");
        }
    }

    async function success(position){
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        setCenter([latitude, longitude]);
    }

    function error(){
        console.log("unable to retrive location")
    }

    const iconPerson = new L.Icon({
        iconUrl: require("../images/current_location.png"),
        iconSize: [45, 45]
    })

    return(
        <div>
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={true}>
                <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={center}
                icon={iconPerson}>
                <Popup>
                    Hello you are here
                </Popup>
                    
                </Marker>
            </MapContainer>
        </div>
    )
}