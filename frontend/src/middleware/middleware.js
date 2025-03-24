import { checkLogin } from "../service/user";

export const checkAdminRole = (req, res, next) => {
    const user = req.user; // Assuming user is attached to the request object
    if (user && user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};