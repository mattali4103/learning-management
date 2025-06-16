import {useLocation, Navigate, Outlet} from 'react-router-dom';
import useAuth from '../hooks/useAuth';
interface RequireAuthProps {
    allowedRoles: string[];
}
const RequireAuth = ({allowedRoles}: RequireAuthProps) => {
    const {auth} = useAuth();
    console.log('RequireAuth', auth);
    const location = useLocation();
    return(
        auth?.user?.roles?.split(',').some(role => allowedRoles.includes(role))
            ? <Outlet />
            : auth?.user
            ? <Navigate to="/unauthorized" state={{from: location}} replace />
            : <Navigate to="/login" state={{from: location}} replace />
    )
}
export default RequireAuth;