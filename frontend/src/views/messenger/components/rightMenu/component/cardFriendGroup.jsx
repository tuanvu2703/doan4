import { useState, useEffect } from "react";
import user from "../../../../../service/user"; // Ensure you import the correct service or API client
import imgUser from '../../../../../img/user.png';
import Loading from "../../../../../components/Loading";
import { Menu, MenuItem, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
import group from "../../../../../service/group";
import { toast } from "react-toastify";
import NotificationCss from "../../../../../module/cssNotification/NotificationCss";
import { useUser } from "../../../../../service/UserContext";
import { Key } from "@mui/icons-material"; // You can use any icon you'd like
const CardFriendGroup = ({ iduser, datagroup }) => {
    const { userContext } = useUser();
    const [userdata, setUserdata] = useState({});
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openDialog, setOpenDialog] = useState(false); // State to control dialog visibility
    const [selectedUser, setSelectedUser] = useState(null); // Store the user to be kicked

    // Initialize the navigate function
    const navigate = useNavigate();

    useEffect(() => {
        const fetchdata = async () => {
            if (iduser) { // Check if iduser is valid
                try {
                    //   console.log('Fetching data for id:', iduser);
                    const res = await user.getProfileUser(iduser);
                    if (res.success) {
                        setUserdata(res.data);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                } finally {
                    setLoading(false); // Stop loading
                }
            }
        };

        fetchdata();
    }, [iduser]); // Run effect when iduser changes

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMessageClick = () => {
        // Navigate to the messenger inbox with the user ID in the query params
        navigate(`/messenger/inbox/?iduser=${userdata._id}`);
        handleClose(); // Close the menu after clicking
    };

    const handleKickUserClick = (user) => {
        setSelectedUser(user); // Set the selected user for the kick action
        setOpenDialog(true); // Open the confirmation dialog
        handleClose(); // Close the dropdown menu
    };

    const handleConfirmKick = async () => {
        try {
            const rs = await group.removeMemberGroup(datagroup?._id, selectedUser._id);
            console.log(rs);
            if (rs.success) {
                toast.success(rs?.message || `Đã xóa người dùng: ${selectedUser?.firstName}, ${selectedUser?.lastName}`, NotificationCss.Success);
            } else {
                if (rs?.data?.message == 'You are not the owner of this group') {
                    toast.error(rs?.data?.message || 'Bạn không phải trưởng nhóm', NotificationCss.Fail);
                } else {
                    toast.error(rs?.data?.message || 'Lỗi khi xóa người dùng khỏi nhóm', NotificationCss.Fail);
                }

            }
        } catch (error) {
            console.log(error);
            toast.error('Lỗi khi xóa người dùng khỏi nhóm', NotificationCss.Fail);
        }
        setOpenDialog(false); // Close the dialog after action
    };

    const handleCancelKick = () => {
        setOpenDialog(false); // Close the dialog without doing anything
    };

    if (loading) {
        return <Loading />;
    }
    return (
        <div className="w-full flex flex-row">
            <div className="w-full flex items-center space-x-3">
                <a href={`/user/${userdata._id}`} className="flex ">

                    <img
                        src={userdata?.avatar ? userdata.avatar : imgUser}
                        alt="user"
                        className="w-12 h-12 rounded-full border-blue-300 border-2 "

                    />
                    {
                        datagroup?.owner?._id == userdata?._id ?
                            <Key className="text-yellow-500 "
                                style={{ marginTop: '-10px', marginLeft: '-12px', width: '30px', marginRight: '-17px' }}
                            />
                            :
                            ''
                    }
                </a>

                <div className="text-start line-clamp-3">
                    <h3
                        className="font-semibold truncate w-[110px] overflow-hidden whitespace-nowrap"
                        title={userdata ? `${userdata.lastName || ''} ${userdata.firstName || ''}`.trim() : "No Name"}
                    >
                        {userdata ? `${userdata.lastName || ''} ${userdata.firstName || ''}`.trim() : "No Name"}
                    </h3>
                </div>
            </div>



            {/* MUI Menu (Dropdown) */}
            {
                userdata._id !== userContext._id ?
                    <>
                        {/* Dropdown Button (More options) */}
                        <IconButton
                            aria-controls="simple-menu"
                            aria-haspopup="true"
                            onClick={handleClick}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleMessageClick}>Nhắn tin</MenuItem>
                            {
                                datagroup?.owner?._id == userContext._id && datagroup?.owner?._id != userdata._id ? <MenuItem onClick={() => handleKickUserClick(userdata)}>Đuổi khỏi nhóm</MenuItem> : ''
                            }
                        </Menu>
                    </>

                    : ''
            }


            {/* Confirmation Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCancelKick}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Xác nhận xóa người dùng khỏi nhóm?"}</DialogTitle>
                <DialogContent>
                    <p>{`Bạn có chắc chắn muốn xóa ${selectedUser?.firstName} ${selectedUser?.lastName} khỏi nhóm không?`}</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelKick} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={handleConfirmKick} color="primary" autoFocus>
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>
        </div >
    );
};

export default CardFriendGroup;
