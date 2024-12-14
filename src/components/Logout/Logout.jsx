import { useAuth } from "../security/AuthProvider"
import { useNavigate } from "react-router-dom"

export default function Logout(){
    const {setToken} = useAuth()
    const navigate = useNavigate()

    const handlelogout = () => {
        setToken();
        navigate('/login');
    }
    return (
        <div className="text-center h-screen">
            <div className="h-11 align-middle">
                <button className="bg-[#1D8F34] text-white text-3xl w-10/12 h-[50px] align-middle rounded-full" onClick={handlelogout}>Logout</button>
            </div>
        </div>
    )
}