import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login/Login";
import Sign from "./components/Register/Sign";
import Basicmap from "./components/Basicmap";
import Landing from "./components/LandingPage/Landing";


export default function Links(){
    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login/>}/> 
                    <Route path="/register" element={<Sign/>}/>
                    <Route path="/map" element={<Basicmap/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    )
}