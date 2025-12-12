import { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            // Background refresh to get latest role/balance
            fetch(`${API_BASE_URL}/wallet.php?user_id=${parsedUser.user_id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.balance !== undefined) {
                        const updated = { ...parsedUser, wallet_balance: data.balance, role: data.role };
                        setUser(updated);
                        localStorage.setItem('user', JSON.stringify(updated));
                    }
                })
                .catch(err => console.error(err));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const refreshProfile = async () => {
        if (!user) return;
        try {
            // Re-fetch user details (using wallet.php as it returns role & balance) or a dedicated /me endpoint.
            // Since we don't have a dedicated /me in auth.php, we can use wallet.php?user_id=... to get balance & role.
            // But ideally we should have a generic user fetch.
            // Let's rely on wallet.php for now as it serves our needs.
            const res = await fetch(`${API_BASE_URL}/wallet.php?user_id=${user.user_id}`);
            const data = await res.json();
            if (data.balance !== undefined) {
                const updatedUser = { ...user, wallet_balance: data.balance, role: data.role };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshProfile, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
