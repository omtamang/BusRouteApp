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
        <div className="container align-self-center">
            <div className="text-center text-2xl text-slate-500 font-bold mt-[100px]">
                Login
            </div>
            <Formik
            initialValues={{name, password}}
            enableReinitialize={true}
            onSubmit={onSubmit}
            >
                {
                    (props) => (
                        <Form className="md:w-8/12 m-auto">
                            <fieldset className="form-group mt-8 shadow-sm">
                                <Field className="form-control h-11" type="text" name="name" placeholder="UserName" required/>
                            </fieldset>

                            <fieldset className="form-group mt-4 shadow-sm">
                                <Field className="form-control h-11 " type="password" name="password" placeholder="Password" required/>
                            </fieldset>

                            <button className="btn btn-success font-light w-full mt-6 h-11 bg-[#2f34b5]" type="submit">Login</button>
                        </Form>
                    )
                }
            </Formik>

            <div className="text-center text-slate-400 mt-4">
                Don't have an account? <Link to={"/register"} className=" no-underline">Register</Link>
            </div>
        </div>
    )
}