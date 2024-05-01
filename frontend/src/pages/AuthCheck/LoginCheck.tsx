import { Cookies } from 'react-cookie';
import { Navigate, Outlet } from 'react-router-dom';

export default function LoginCheck() {
    const cookies = new Cookies();

    //로그인 여부 체크, 없으면 리다이렉트
    if (!cookies.get('accessToken')) {
        return <Navigate to={'/'} />;
    } else {
        return <Outlet />;
    }
}
