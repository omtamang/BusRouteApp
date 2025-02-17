import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../security/AuthProvider";

export default function Landing() {
    const {token} = useAuth();
    const navigate = useNavigate()

    function route(){
        if(token){
             navigate('/bus-route')
        }
        else{
            navigate('/signup')
        }
    } 

    return (
        <div className="text-center">
            <div>
                <img src="/images/Logo/logo.png" alt="logo" className="w-[90px] m-auto mt-5"/>
                <img src="/images/Logo/Landing.png" alt="Bus stand logo" className="h-68 md:h-[300px] md:m-auto"/>
            </div>

            <div className="text-center">
                <p className="text-[32px] font-semibold">Welcome</p>
                <p className="text-[#45534A] text-[16px]">Create an account and start your Bus Journey</p>
            </div>

            <div className="text-[#45534A] text-center mt-[90px] md:w-4/12 md:m-auto">
                
                <button className="bg-[#1D8F34] text-white text-[24px] w-11/12 h-[60px] rounded-full" onClick={route}>
                    Getting Started
                </button>
                <p className="pt-2 text-[16px]">Already have an account? <Link to="/login" className="no-underline text-[#AC1A0F]">Login</Link></p>
            </div>
        </div> 
    )
}