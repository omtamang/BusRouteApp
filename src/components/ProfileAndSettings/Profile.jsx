import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBell, faCheck, faIdCard, faRightFromBracket, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import Logout from "../Logout/Logout";
import { useEffect, useState, useRef } from "react";
import { deleteEmail, getPassenger } from "../api/ApiService";
import { gsap } from "gsap";
import { useAuth } from "../security/AuthProvider";

export default function Profile() {
    const [user, setUser] = useState();
    const [showPopup, setShowPopup] = useState(false);
    const [showDelete, setshowDelete] = useState(false);
    const navigate = useNavigate()
    const popupRef = useRef(null); // Reference for the popup div
    const {setToken} = useAuth()

    async function userInfo() {
        try {
            const response = await getPassenger();
            setUser(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    async function deleteUser() {
        try {
            await deleteEmail(user)

            setshowDelete(true)
            setTimeout(() => {
                setshowDelete(false); // Hide the popup after 3 seconds
                setToken();
                navigate('/')
            }, 3000);

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        userInfo();
    }, []);

    // Handle popup animation with GSAP
    useEffect(() => {
        if (showPopup) {
            gsap.fromTo(
                popupRef.current,
                { y: "100%", opacity: 0 }, // Start from below the screen
                { y: "0%", opacity: 1, duration: 1.5, ease: "power4.out" } // Slow slide-up
            );
        } else {
            gsap.to(popupRef.current, {
                y: "100%",
                opacity: 0,
                duration: 4,
                ease: "power4.in", // Smooth slide-down
            });
        }
    }, [showPopup]);

    return (
        <div>
            <div className="text-xl p-4 shadow-md">
                <Link className="text-xl text-black" to={'/map'}>
                    <FontAwesomeIcon icon={faArrowLeft} className="align-middle" />
                </Link>
                <span className="text-xl pl-4 text-black">Profile and settings</span>
            </div>

            <div className="mt-8 text-xl md:max-w-96 md:m-auto">
                {/* Div for user name and profile */}
                <div className="flex-col justify-evenly">
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvetk9tOwHkQMwe1DfoxempOXosaikcVL5QQ&s"
                        alt="User"
                        className="rounded-full w-24 m-auto"
                    />
                    <p className="pt-7 text-center"> <b className="text-wrap">{user}</b></p>
                </div>

                <div className=" space-x-24 flex m-auto pl-6 pt-6">
                    <section>
                        <FontAwesomeIcon icon={faIdCard} className="text-slate-600 text-xl" />
                        <span className="pl-4">Account Information</span>
                    </section>
                    <span className="text-slate-600">&#11208;</span>
                </div>

                <div className=" space-x-[88px] flex m-auto pl-6 pt-4">
                    <section>
                        <FontAwesomeIcon icon={faBell} className="text-slate-600 text-xl" />
                        <span className="pl-4">Set Notification</span>
                    </section>
                    <span className="text-slate-600 pl-14">&#11208;</span>
                </div>

                <div className="flex m-auto pl-6 pt-4">
                    <section className="flex">
                        <FontAwesomeIcon icon={faRightFromBracket} className="text-slate-600 text-xl pt-1" />
                        <Logout />
                    </section>
                </div>

                <div className=" flex m-auto pl-6 pt-4" onClick={() => setShowPopup(true)}>
                    <section>
                        <FontAwesomeIcon icon={faTrash} className="text-slate-600 text-xl" />
                        <span className="pl-4 text-[#be3939]">Delete Account</span>
                    </section>
                </div>
            </div>

            {/* Success Popup with GSAP Animation */}
            {showPopup && (
                <div className="fixed inset-0 bg-opacity-50 z-50" ref={popupRef} >
                    <div
                        className="bg-white p-6 rounded-t-3xl w-full text-start absolute border-black border-2 inset-x-0 bottom-0"
                        // Attach ref to the popup div
                    >
                        <div className="flex justify-between">
                            <h1 className="text-2xl font-bold mb-2">
                                Do you want to delete your <br /> account?
                            </h1>
                            <FontAwesomeIcon
                                icon={faXmark}
                                className=" text-[#be3939] mt-1 text-2xl rounded-full"
                                onClick={() => setShowPopup(false)}
                            />
                        </div>

                        <h1 className="text-xl">
                            All data associated with your account will be deleted
                        </h1>

                        <div className="text-center">
                            <button className="text-xl bg-[#eeeeee] w-full h-12 rounded-lg text-[#be3939] mt-3 mb-4" onClick={deleteUser}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Popup with Loading Animation */}
            {showDelete && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg w-[300px] text-center">
                        <h2 className="text-lg font-bold mb-4 text-[#be3939]">Account has been deleted!</h2>
                        <FontAwesomeIcon icon={faCheck} className="text-[#1D8F34] text-2xl"/>
                    </div>
                </div>
            )}
        </div>
    );
}
