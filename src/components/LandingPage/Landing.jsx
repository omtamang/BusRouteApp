import { Link } from "react-router-dom";

export default function Landing() {

    return (
        <div className="text-center">
            <div>
                <img src="/images/Logo/logo.png" alt="logo" className="w-[90px] m-auto mt-5"/>
                <img src="/images/Logo/Landing.png" alt="Bus stand logo" className="h-68"/>
            </div>

            <div className="text-center">
                <p className="text-[32px] font-semibold">Welcome</p>
                <p className="text-[#45534A] text-[16px]">Create an account and start your Bus Journey</p>
            </div>

            <div className="text-[#45534A] text-center mt-[90px]">
                <Link to={'/login'}>
                    <button className="bg-[#1D8F34] text-white text-[24px] w-11/12 h-[60px] rounded-full">
                        Getting Started
                    </button>
                </Link>
                <p className="pt-2 text-[16px]">Already have an account? <Link to="/login" className="no-underline text-[#AC1A0F]">Login</Link></p>
            </div>
        </div> 
    )
}