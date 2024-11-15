import BackImage from "./BackImage";
import FormPage from "./FormPage";

export default function Login() {
    return (
        <div className="bg-[#2f34b5] h-screen md:flex w-full">

            <section className="container my-auto">
                <BackImage/>
            </section>

            {/* Form */}
            <section className="bg-white w-4/5 h-4/5 mr-11 border rounded-xl my-auto">
                <FormPage/>
            </section>
        </div>
    )
}