import React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

export default function Signpop() {

    return (
        <div className="pl-4 w-[200px]">
            <Popup trigger=
                {<button className=""> Logout </button>} 
                modal nested>
                {
                    close => (
                        <div className='block text-lg'>
                            <div>
                                Do you want to log out?
                            </div>

                            <div className="space-x-4 pl-14 pt-2">
                                <button onClick={() => close()} className="text-[#1D8F34]">
                                        Cancel
                                </button>
                                <button onClick={handlelogout} className="text-red-600">
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