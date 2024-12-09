import { Formik, Form, Field } from "formik";
import 'bootstrap/dist/css/bootstrap.css';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons'

export default function SignBack() {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    function onSubmit(values) {
        console.log(values)
        navigate('/map')
    }

    return (
        <div>
            <div>
                <img src="/images/Logo/logo.png" alt="logo" className="m-auto w-[90px] mt-5"/>
            </div>

            <div className="text-center pt-3">
                <p className="text-[32px] font-semibold">
                    Sign Up
                    <p className="text-[#45534A] text-[16px] font-normal">Fill up the details to continue with our app</p>
                </p>
            </div>
            
            <div className="pt-2">
                <Formik
                initialValues={{name, password}}
                enableReinitialize={true}
                onSubmit={onSubmit}
                >
                    {
                        (props) => (
                            <Form className="w-11/12 m-auto text-[18px] text-[#45534A] mt-3">

                                <fieldset className="border border-[#45534A] rounded-xl mt-2 flex">
                                    <FontAwesomeIcon icon={faUser} className="p-3 text-2xl"/>
                                    <Field className=" h-[55px] text-[#45534A] w-full outline-1 outline-gray-500 pl-2" type="password" name="fullname" placeholder="Full Name" required/>
                                </fieldset>

                                <fieldset className="border border-[#45534A] rounded-xl flex mt-2">
                                    <FontAwesomeIcon icon={faEnvelope} className="p-3 text-2xl"/>
                                    <Field className="h-[55px] text-[#45534A] w-full outline-1 outline-gray-500 pl-2" type="text" name="name" placeholder="Email Address" required/>
                                </fieldset>

                                <fieldset className="border border-[#45534A] rounded-xl mt-2 flex">
                                    <FontAwesomeIcon icon={faLock} className="p-3 text-2xl"/>
                                    <Field className=" h-[55px] text-[#45534A] w-full outline-1 outline-gray-500 pl-2" type="password" name="password" placeholder="Password" required/>
                                </fieldset>

                                <div className="text-[16px] text-start text-[#45534A] pt-1">
                                    Password must be 8 characters
                                </div>

                                <div className="text-center w-full pt-8">
                                    <button className=" bg-[#1D8F34] text-white text-[24px] w-full h-[60px] rounded-full" type="submit">Sign Up</button>
                                </div>
                            </Form>
                        )
                    }
                </Formik>
            </div>

            <div className="text-center text-[#45534A] mt-4">
                Already have an account? <Link to={"/login"} className=" no-underline text-[#AC1A0F]">Login</Link>
            </div>

            <div className="flex w-11/12 m-auto pt-3">
                <hr className="w-2/4"/>
                <p className="p-1 text-[16px]">Or</p>
                <hr className="w-2/4"/>
            </div>

            <div className="flex justify-center">
                <button className="text-[#090A0A] text-[16px] flex border w-11/12 rounded-full h-[50px] items-center">
                    <span className="w-1/4 pl-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" className="w-[20px]"/>
                    </span>
                    <span className="pl-4 font-semibold">Continue with google</span>
                </button>
            </div>
        </div>
    )
}