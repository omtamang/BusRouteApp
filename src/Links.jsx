import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login/Login";
import Sign from "./components/Register/Sign";
import Basicmap from "./components/Basicmap";
import Landing from "./components/LandingPage/Landing";
import AuthProvider, { useAuth } from "./components/security/AuthContext";
import { Provider } from "react-redux";
import Store from "./components/security/Store";

export default function Links(){

    const authContext = useAuth()

    return (
        <div>
            {/* <AuthProvider> */}
            <Provider store={Store}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login/>}/> 
                        <Route path="/register" element={<Sign/>}/>
                        <Route path="/map" element={<Basicmap/>}/>
                    </Routes>
                </BrowserRouter>
            </Provider>
            {/* </AuthProvider> */}
        </div>
    )
}