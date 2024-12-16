import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faBell, faIdCard, faRightFromBracket, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export default function Profile(){
    return(
        <div>
            <div className="text-xl p-4 shadow-md">
                <Link className="text-xl text-black" to={'/map'}>
                    <FontAwesomeIcon icon={faArrowLeft} className="align-middle"/>
                </Link>
                <span className="text-xl pl-4 text-black">Profile and settings</span>
            </div>

            <div className="mt-8 text-xl">
                <div className=" space-x-24 flex m-auto pl-6">
                    <section>
                        <FontAwesomeIcon icon={faIdCard} className="text-slate-600 text-xl"/>
                        <span className="pl-4">Account Information</span>
                    </section>
                    <span className="text-slate-600">&#11208;</span>
                </div>

                <div className=" space-x-[88px] flex m-auto pl-6 pt-4">
                    <section>
                        <FontAwesomeIcon icon={faBell} className="text-slate-600 text-xl"/>
                        <span className="pl-4">Set Notification</span>
                    </section>
                    <span className="text-slate-600 pl-14">&#11208;</span>
                </div>

                <div className="flex m-auto pl-6 pt-4">
                    <section>
                        <FontAwesomeIcon icon={faRightFromBracket} className="text-slate-600 text-xl"/>
                        <span className="pl-4">Logout</span>
                    </section>
                </div>

                <div className=" flex m-auto pl-6 pt-4">
                    <section>
                        <FontAwesomeIcon icon={faTrash} className="text-slate-600 text-xl"/>
                        <span className="pl-4 text-red-600">Delete Account</span>
                    </section>
                </div>
            </div>
        </div>
    )
}