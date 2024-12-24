import { Formik, Form, Field } from "formik";
import 'bootstrap/dist/css/bootstrap.css';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { signup } from "../api/ApiService";

export default function SignBack() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [userExist, setExist] = useState(false);
    const [showPopup, setShowPopup] = useState(false); // To handle popup visibility
    const navigate = useNavigate();

    async function onSubmit(values) {
        const passenger = {
            passenger_name: values.name,
            email: values.email,
            password: values.password
        };
        try {
            const response = await signup(passenger);

            if (response.status === 201) {
                setShowPopup(true); // Show the popup
                setTimeout(() => {
                    setShowPopup(false); // Hide the popup after 3 seconds
                    navigate('/login'); // Navigate to login page
                }, 3000);
            }
        } catch (error) {
            if (error.response?.status === 400) {
                setExist(true);
            } else {
                console.log(error);
            }
        }
    }

    const googleLogin = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/google"
    }

    return (
        <div>
            <div>
                <img src="/images/Logo/logo.png" alt="logo" className="m-auto w-[90px] mt-5" />
            </div>

            <div className="text-center pt-3">
                <p className="text-[32px] font-semibold">
                    Sign Up
                    <p className="text-[#45534A] text-[16px] font-normal">Fill up the details to continue with our app</p>
                </p>
            </div>

            <div className="pt-2">
                <Formik
                    initialValues={{ name, password, email }}
                    enableReinitialize={true}
                    onSubmit={onSubmit}
                >
                    {
                        (props) => (
                            <Form className="w-11/12 md:w-4/12 m-auto text-[18px] text-[#45534A] mt-3">
                                <fieldset className="border border-[#45534A] rounded-xl mt-2 flex">
                                    <FontAwesomeIcon icon={faUser} className="p-3 text-2xl" />
                                    <Field
                                        className=" h-[55px] text-[#45534A] w-full outline-1 outline-gray-500 pl-2"
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        required
                                    />
                                </fieldset>

                                <fieldset className="border border-[#45534A] rounded-xl flex mt-2">
                                    <FontAwesomeIcon icon={faEnvelope} className="p-3 text-2xl" />
                                    <Field
                                        className="h-[55px] text-[#45534A] w-full outline-1 outline-gray-500 pl-2"
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        required
                                    />
                                </fieldset>

                                {userExist && (
                                    <div>
                                        <p className="text-red-500 text-[16px]">Email already exists.</p>
                                    </div>
                                )}

                                <fieldset className="border border-[#45534A] rounded-xl mt-2 flex">
                                    <FontAwesomeIcon icon={faLock} className="p-3 text-2xl" />
                                    <Field
                                        className=" h-[55px] text-[#45534A] w-full outline-1 outline-gray-500 pl-2"
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        required
                                    />
                                </fieldset>

                                <div className="text-[16px] text-start text-[#45534A] pt-1">
                                    Password must be 8 characters
                                </div>

                                <div className="text-center w-full pt-8">
                                    <button
                                        className=" bg-[#1D8F34] text-white text-[24px] w-full h-[60px] rounded-full"
                                        type="submit"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            </Form>
                        )
                    }
                </Formik>
            </div>

            {/* Success Popup with Loading Animation */}
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg w-[300px] text-center">
                        <h2 className="text-lg font-bold mb-4 text-green-600">Signup Successful!</h2>
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-green-600 border-opacity-75 mb-4"></div>
                        </div>
                        <p className="text-gray-700">Redirecting to login...</p>
                    </div>
                </div>
            )}

            <div className="text-center text-[#45534A] mt-4">
                Already have an account? <Link to={"/login"} className=" no-underline text-[#AC1A0F]">Login</Link>
            </div>

            <div className="flex w-11/12 md:w-4/12 m-auto pt-3">
                <hr className="w-2/4" />
                <p className="p-1 text-[16px]">Or</p>
                <hr className="w-2/4" />
            </div>

            <div className="flex justify-center" onClick={googleLogin}>
                <button className="text-[#090A0A] text-[16px] flex border w-11/12 md:w-4/12 rounded-full h-[50px] items-center">
                    <span className="w-1/4 pl-4">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
                            className="w-[20px]"
                            alt="Google Icon"
                        />
                    </span>
                    <span className="pl-4 md:text-center md:w-full md:mr-28 font-semibold">Continue with Google</span>
                </button>
            </div>
        </div>
    );
}
