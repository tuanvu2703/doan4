import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from '../views/home/home.jsx';
import Myfriend from "../views/friend/myfriend.jsx";
import Layout from "../views/Layout.js";
import Personal from "../views/profile/personal/index.jsx";
import AboutProfile from "../views/profile/components/AboutProfile.jsx";
import MyPosts from "../views/profile/components/MyPosts.jsx";
import FriendProfile from "../views/friend/FriendProfile.jsx";
import LayoutMessenger from "../views/messenger/layoutMessenger.js";
import Searchpage from "../views/search/index.jsx";
import FriendInvitation from "../views/friend/content/friendinvitation.jsx";
import Login from "../auth/login/index.jsx";
import Register from "../auth/register/index.jsx";
import LayoutSearch from "../views/search/layout.js";
import OtherProfiles from "../views/profile/OtherProfiles/index.jsx";
import AboutOtherProfile from "../views/profile/OtherProfiles/AboutOtherProfile.jsx";
import OtherPosts from "../views/profile/OtherProfiles/OtherPosts.jsx";
import Bookmark from "../views/bookmark/page.jsx";

import MyAllFriend from "../views/friend/content/myAllFriend.jsx";
import MessengerInbox from "../views/messenger/components/content/messInbox.jsx";
import FriendOtherProfile from "../views/profile/OtherProfiles/FriendOtherProfile.jsx";

import MessengerGroup from "../views/messenger/components/content/messGroup.jsx";
import Test from "./test.jsx";
import DetailPost from "../views/post/components/DetailPost.jsx";
import ChangePassPage from "../auth/ChangePassPage.jsx";
import UpdatePost from "../views/post/components/UpdatePost.jsx";
import ForgotPass from "../auth/ForgotPass.jsx";
import PostSearch from "../views/search/postSearch.jsx";
import PeopleSearch from "../views/search/peopleSearch.jsx";
import Fixconnectsocket from "./fixconnectsocket.jsx";

import LayoutAdmin from "../admin/LayoutAdmin.js";
import Dashboard from "../admin/page/dashboard.jsx";
import UserManagement from "../admin/page/user-management.jsx";
import PostManagement from "../admin/page/post-management.jsx";
import ReportPostManagement from "../admin/page/reportpost-management.jsx";

import AdminRoute from "./AdminRoute.jsx";

function routers() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/changepass" element={<ChangePassPage />} />
                    <Route path="/fixconnectsocket" element={<Fixconnectsocket />} />
                    <Route path="/updatepost/:id" element={<UpdatePost />} />
                    <Route path="friends" element={<Myfriend />} >
                        <Route path="" element={<FriendInvitation />} />
                        <Route path="list" element={<MyAllFriend />} />
                        <Route path="requests" element={<FriendInvitation />} />
                    </Route>
                    <Route path="post/:id" element={<DetailPost />} />
                    <Route path="myprofile" element={<Personal />}>

                        <Route index element={<MyPosts />} />
                        <Route path="about" element={<AboutProfile />} />
                        <Route path="friends" element={<FriendProfile />} />
                    </Route>
                    <Route path="messenger" element={<LayoutMessenger />}>
                        <Route index element={<MessengerInbox />} />
                        <Route path="inbox" element={<MessengerInbox />} />
                        <Route path="friend" element={<MessengerInbox />} />
                        <Route path="group" element={<MessengerGroup />} />
                    </Route>
                    <Route path="user/:id" element={<OtherProfiles />}>
                        <Route index element={<OtherPosts />} />
                        <Route path="about" element={<AboutOtherProfile />} />
                        <Route path="friends" element={<FriendOtherProfile />} />
                    </Route>
                    <Route path="bookmark" element={<Bookmark />} />

                    <Route path="/search" element={<LayoutSearch />}>
                        <Route path="all" element={<Searchpage />} />
                        <Route path="content" element={<PostSearch />} />
                        <Route path="user" element={<PeopleSearch />} />
                    </Route>
                </Route>
                {/* Redirect to login if not authenticated */}
                <Route path="/login" element={<Login />} />
                <Route path="/test" element={<Test />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgotpass" element={<ForgotPass />} />



                {/* Route admin được bảo vệ bởi AdminRoute */}
                <Route path="/admin" element={
                    <AdminRoute>
                        <LayoutAdmin />
                    </AdminRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="user" element={<UserManagement />} />
                    <Route path="post" element={<PostManagement />} />
                    <Route path="report/post" element={<ReportPostManagement />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default routers;
