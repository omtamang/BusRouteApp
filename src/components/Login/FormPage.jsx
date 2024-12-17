import { Formik, Form, Field } from "formik";
import 'bootstrap/dist/css/bootstrap.css';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { authenticate } from "../api/ApiService";
import { useAuth } from "../security/AuthProvider";

export default function FormPage() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [invalid, setInvalid] = useState(false); // Loading state for animation
    const navigate = useNavigate();
    const { setToken } = useAuth();

    async function onSubmit(values) {
        const payload = {
            username: values.name,
            password: values.password
        };
        setLoading(true);

        try {
            const response = await authenticate(payload);

            if(response.status == 200){
                setInvalid(false);
                setToken(response.data);
            }

            navigate('/map',); // Redirect after 3 seconds
            
        } catch (error) {
            console.log(error);
            setInvalid(true);
            setLoading(false); // Stop loading animation on error
        }
    }

    return (
        <div>
            <div>
                <img src="/images/Logo/logo.png" alt="logo" className="m-auto w-[90px] mt-5 md:mt-2" />
            </div>

            <div className="text-center pt-3">
                <p className="text-[32px] font-semibold">
                    Login
                    <p className="text-[#45534A] text-[16px] font-normal">Please login to continue with the app</p>
                </p>
            </div>

            <div className="pt-2">
                <Formik
                    initialValues={{ name, password }}
                    enableReinitialize={true}
                    onSubmit={onSubmit}
                >
                    {(props) => (
                        <Form className="w-11/12 md:w-4/12 m-auto text-[18px] text-[#45534A] mt-3">
                            {invalid && <div className="text-center bg-red-200 border-[2px] border-red-600">
                                <h4 className="pt-3">Wrong Credentials</h4>
                                <p>Invalid User or Password</p>
                            </div>}
                            <fieldset className="border border-[#45534A] rounded-xl flex">
                                <FontAwesomeIcon icon={faEnvelope} className="p-3 text-2xl" />
                                <Field
                                    className="h-[55px] text-[#45534A] w-full outline-1 outline-gray-500 pl-2"
                                    type="text"
                                    name="name"
                                    placeholder="Email Address"
                                    required
                                />
                            </fieldset>

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

                            <div className="text-[16px] text-end text-[#45534A] pt-1">
                                Forgot password?
                            </div>

                            <div className="text-center w-full pt-8">
                                <button
                                    className=" bg-[#1D8F34] text-white text-[24px] w-full h-[60px] md:h-[50px] rounded-full"
                                    type="submit"
                                >
                                    {loading && <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-white-600 border-opacity-75"></div>
                                    </div>}
                                    {!loading && <div>Login</div>}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>

            <div className="text-center text-[#45534A] mt-4">
                Don't have an account?{" "}
                <Link to={"/signup"} className="no-underline text-[#AC1A0F]">
                    Sign Up
                </Link>
            </div>

            <div className="flex w-11/12 m-auto pt-2">
                <hr className="w-2/4" />
                <p className="p-1 text-[16px]">Or</p>
                <hr className="w-2/4" />
            </div>

            <div className="flex justify-center">
                <button className="text-[#090A0A] text-[16px] flex border w-11/12 md:w-4/12 rounded-full h-[50px] items-center">
                    <span className="w-1/4 pl-4">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
                            className="w-[20px]"
                            alt="Google Icon"
                        />
                    </span>
                    <span className="pl-4 md:text-center md:w-full md:mr-28 font-semibold">
                        Continue with Google
                    </span>
                </button>
            </div>
        </div>
    );
}
