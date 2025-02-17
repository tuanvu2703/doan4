import authToken from "../../components/authToken";
const LogOut = ({ btnOffLogout }) => {
    function logout() {
        authToken.deleteToken();
        window.location.reload();
    }
    return (
        <div id="logoutConfirm" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-blue-300 rounded-lg shadow-lg p-6 text-center">
                <p className="text-lg mb-4 text-black">Bạn có chắc chắn muốn logout không?</p>
                <div>
                    <button onClick={() => logout()} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-2">
                        Xác nhận
                    </button>
                    <button onClick={() => btnOffLogout()} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LogOut;
