import React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useAuth } from "../security/AuthProvider"
import { useNavigate } from "react-router-dom"

export default function Logout() {

    const {setToken} = useAuth()
    const navigate = useNavigate()

    async function handlelogout() {
        await setToken();
        navigate('/login');
    }

    return (
        <div className="pl-4">
            <Popup trigger=
                {<button className=""> Logout </button>} 
                modal nested>
                {
                    close => (
                        <div className='block text-lg md:max-w-96 text-center'>
                            <div>
                                Do you want to log out?
                            </div>

                            <div className="space-x-4 pl-14 pt-2">
                                <button onClick={() => close()} className="text-[#1D8F34]">
                                        Cancel
                                </button>
                                <button onClick={handlelogout} className="text-[#be3939]">
                                        Log out
                                </button>
                            </div>
                        </div>
                    )
                }
            </Popup>
        </div>
    )
};