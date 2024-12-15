import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function Profile(){
    return(
        <div>
            <div className="text-3xl p-4 shadow-xl">
                <FontAwesomeIcon icon={faArrowLeft} className="align-middle"/>
                <span className="text-2xl pl-4">Profile and settings</span>
            </div>
        </div>
    )
}