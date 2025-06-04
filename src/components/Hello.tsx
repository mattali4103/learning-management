import { useAuth } from "../hooks/UseAuth";
const Hello = () => {
    const { user } = useAuth() || { user: null };

    return (
        <div>
        <h1>Hello: {user?.username}!</h1>
        </div>
    );
}
export default Hello;