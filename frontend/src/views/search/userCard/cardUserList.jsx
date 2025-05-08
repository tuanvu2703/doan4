import React, { useState } from 'react';
import userImg from '../../../img/user.png';


const CardUserList = ({ userdata: initialUserData }) => {
    const [userdata] = useState(initialUserData);


    const handDetailUser = (id) => {
        window.location.href = `/user/${id}`;
    };

    return (
        <div className="w-full flex justify-center mb-3 ">
            <button
                onClick={() => handDetailUser(userdata._id)}
                className="w-full mx-auto bg-white flex flex-wrap sm:flex-nowrap border-[1px] border-gray-300 rounded-lg justify-between items-center p-2 sm:p-3"
            >
                {/* Avatar + Info */}
                <div className="flex items-center gap-3">
                    <img
                        src={userdata.avatar || userImg}
                        alt=""
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-black"
                    />
                    <div className="flex flex-col pl-2 max-w-[180px] sm:max-w-[250px]">
                        <div className="text-start font-semibold truncate">
                            {userdata.firstName} {userdata.lastName}
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="py-2">

                </div>
            </button>
        </div>
    );
};

export default CardUserList;
