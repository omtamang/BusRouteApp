import { Formik, Form, Field } from "formik";
import 'bootstrap/dist/css/bootstrap.css';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function FormPage() {
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
                    Login
                    <p className="text-[#45534A] text-[16px] font-normal">Please login to continue with the app</p>
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
                                <fieldset className="border border-[#45534A] rounded-xl">
                                    <Field className="h-[55px] text-[#45534A] w-full outline-1 outline-gray-500" type="text" name="name" placeholder="Email Address" required/>
                                </fieldset>

                                <fieldset className="border border-[#45534A] rounded-xl mt-2">
                                    <Field className=" h-[55px] text-[#45534A] w-full outline-1 outline-gray-500" type="password" name="password" placeholder="Password" required/>
                                </fieldset>

                                <div className="text-[16px] text-end text-[#45534A] pt-1">
                                    Forgot password?
                                </div>

                                <div className="text-center w-full pt-8">
                                    <button className=" bg-[#1D8F34] text-white text-[24px] w-full h-[60px] rounded-full" type="submit">Login</button>
                                </div>
                            </Form>
                        )
                    }
                </Formik>
            </div>

            <div className="text-center text-[#45534A] mt-4">
                Don't have an account? <Link to={"/register"} className=" no-underline text-[#AC1A0F]">Sign Up</Link>
            </div>
        </div>
    )
}