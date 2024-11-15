import { Field, Form, Formik } from "formik";
import { useState } from "react";
import { Link } from "react-router-dom";


export default function SignForm(){
    const[name, setName] = useState('')
    const[phone, setPhone] = useState('')
    const[plate, setPlate] = useState('')
    const[license, setLicense] = useState('')

    const initial = () => {
        const route = "";
        return route;
    }

    const[route, setRoute] = useState(initial)

    const handleChange = (e) => {
        setRoute(e.target.route)
    }

    function onSubmit(value){
        console.log(value)
    }

    return(
        <div>
            <section className="mt-[80px] md:mt-[40px] bg-white border rounded-xl">
                <div className="font-bold text-2xl text-center text-slate-500">
                    Sign Up
                </div>

                <div className="container pt-11 text-slate-400">
                    <Formik
                    initialValues={{name, phone, plate, phone, license}}
                    enableReinitialize={true}
                    onSubmit={onSubmit}
                    >
                        {
                            (props) => (
                                <Form className="md:w-6/12 md:mx-auto">
                                    <fieldset className="form-group">
                                        <label className="form-label mt-2">Full Name</label>
                                        <Field type="text" name="name" className="form-control h-11" placeholder="Enter full name" required/>
                                    </fieldset>

                                    <fieldset className="form-group">
                                        <label className="form-label mt-2">Mobile Number</label>
                                        <Field type="number" name="phone" className="form-control h-11" placeholder="XXXXXXX" required/>
                                    </fieldset>

                                    <fieldset className="form-group">
                                        <label className="form-label mt-2">Bus Plate Number</label>
                                        <Field type="number" name="plate" className="form-control h-11" placeholder="Ba Kha XXXX" required/>
                                    </fieldset>

                                    <fieldset className="form-group">
                                        <label className="form-label mt-2">License no.</label>
                                        <Field type="number" name="license" className="form-control h-11" placeholder="04-06-XXXXXX" required/>
                                    </fieldset>

                                    <fieldset className="form-group">
                                        <label className="form-label mt-2">License Image</label>
                                        <Field type="file" name="licenseImage" className="form-control h-11" placeholder="04-06-XXXXXX" required/>
                                    </fieldset>

                                    <div className="mt-4">
                                        <select className="form-select" aria-label="Default select example" onChange={handleChange}>
                                            <option selected>Choose your route</option>
                                            <option value="Sundarijal - Ratnapark">Sundarijal - Ratnapark</option>
                                            <option value="Namgyal - Ratnapark">Namgyal - Ratnapark</option>
                                            <option value="Medical College - Ratnapark">Medical College - Ratnapark</option>
                                        </select>
                                        <p>{`Selected ${route}`}</p>
                                    </div>

                                    <button className="btn btn-success h-11 w-full" type="submit">
                                        Sign Up
                                    </button>

                                </Form>
                            )
                        }
                    </Formik>
                </div>
                <div className="text-center mt-3">
                    Already have an account? <Link to={"/"} className="no-underline">Login</Link>
                </div>
            </section>
        </div>
    )
}