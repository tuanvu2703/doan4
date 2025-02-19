import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { IconButton, Button } from '@mui/material';
import { Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

import Files from "./component/files";
import PictureAndVideo from "./component/pictureAndVideo";
import ListMemberGroup from './component/listMemberGroup';
import group from '../../../../service/group';
import NotificationCss from '../../../../module/cssNotification/NotificationCss';

const ToolGroup = () => {
    const [groups, setGroups] = useState([]);
    const [groupdt, setGroupDT] = useState(null);
    const [idgr, setIdgr] = useState([]);
    const location = useLocation();
    const [idgroupExists, setIdgroupExists] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openDialog, setOpenDialog] = useState(false); // State to control dialog visibility
    const navigate = useNavigate();
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const idgroup = queryParams.get('idgroup');

        if (idgroup) {
            setIdgroupExists(true);
            setIdgr(idgroup)
        } else {
            setIdgroupExists(false);
        }
    }, [location.search]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                // console.log("Fetching data...");
                const res = await group.getMyListChat();

                if (res.success) {
                    //console.log("API Response:", res.data);
                    // Set all groups
                    setGroups(res.data.Group);
                    // Debug idgr and groups
                    // console.log("idgr:", idgr);
                    // console.log("Groups:", res.data.Group);
                    // Find and set the matched group based on `idgr`
                    const matchedGroup = res.data.Group.find(group => group._id === idgr);

                    if (matchedGroup) {
                        // console.log("Matched Group:", matchedGroup);
                        setGroupDT(matchedGroup);
                    }
                    //  else {
                    //     console.log("No matching group found for idgr:", idgr);
                    // }
                } else {
                    // console.error("Failed to fetch groups");
                    setGroups([]);
                }
            } catch (error) {
                // console.error("Error fetching friend list:", error);
                setGroups([]);
            }
        };

        if (idgr) {
            fetchData();
        } else {
            console.log("idgr is undefined or empty, skipping fetchData.");
        }
    }, [idgr]);



    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleConfirmKick = async () => {
        try {
            console.log(groupdt)
            const rs = await group.removeGroup(groupdt._id)
            // console.log(rs);
            if (rs.success) {
                toast.success(rs?.message || `Đã nhóm: ${groupdt?.name}`, NotificationCss.Success);
                navigate(`/messenger/group/?idgroup=`);
                window.location.reload();
            } else {
                if (rs?.data?.message == 'You are not the owner of this group') {
                    toast.error(rs?.data?.message || 'Bạn không phải trưởng nhóm', NotificationCss.Fail);
                } else {
                    toast.error(rs?.data?.message || 'Lỗi khi xóa nhóm', NotificationCss.Fail);
                }

            }
        } catch (error) {
            console.log(error);
            toast.error('Lỗi khi xóa nhóm', NotificationCss.Fail);
        }
        setOpenDialog(false); // Close the dialog after action
    };
    // setOpenDialog(true);
    const handleRemoveGroup = async () => {
        //removeGroup
        // setSelectedUser(user); // Set the selected user for the kick action
        setOpenDialog(true); // Open the confirmation dialog
        // handleClose(); // Close the dropdown menu
    };
    const handleCancelKick = () => {
        setOpenDialog(false);
    };
    return (
        <div className="flex flex-col h-full border-2">
            <div className=" flex justify-center items-center h-[56px] shadow-xl bg-white">
                <div className='flex flex-col w-full ml-12'>
                    <strong className="text-center w-full">Thông tin nhóm</strong>
                    <h3 className='text-center w-full'>{groupdt?.name}</h3>
                </div>
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
                    <MenuItem
                        onClick={handleRemoveGroup}
                    >xóa nhóm</MenuItem>

                </Menu>
                {/* Confirmation Dialog */}
                <Dialog
                    open={openDialog}
                    onClose={handleCancelKick}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Bạn có chắc chắn muốn xóa nhóm không?"}</DialogTitle>
                    <DialogContent>
                        <p>{`Bạn có chắc chắn muốn xóa nhóm không?`}</p>
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
            </div>

            {
                idgroupExists ? (
                    <div className="overflow-y-scroll flex-1 custom-scroll">
                        <ListMemberGroup />
                        <PictureAndVideo />
                        <Files />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-gray-500">Nhóm không tồn tại hoặc không tìm thấy.</p>
                    </div>
                )
            }
        </div >
    );
};

export default ToolGroup;
