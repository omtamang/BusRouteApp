import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login/Login";
import Sign from "./components/Register/Sign";
import Basicmap from "./components/Basicmap";
import Landing from "./components/LandingPage/Landing";
import AuthProvider, { useAuth } from "./components/security/AuthContext";

export default function Links(){

    const authContext = useAuth()

    return (
        <div>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login/>}/> 
                        <Route path="/register" element={<Sign/>}/>
                        <Route path="/map" element={<Basicmap/>}/>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </div>
    )
}