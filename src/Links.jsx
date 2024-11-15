import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login/Login";
import Sign from "./components/Register/Sign";
import Basicmap from "./components/Basicmap";


export default function Links(){
    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login/>}/> 
                    <Route path="/register" element={<Sign/>}/>
                    <Route path="/map" element={<Basicmap/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    )
}