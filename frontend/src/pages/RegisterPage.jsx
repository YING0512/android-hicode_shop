import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/auth.php?action=register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '註冊失敗');
            }

            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center relative px-4">
            {/* Background blobs */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />

            <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-2xl shadow-2xl relative z-10">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
                        建立帳號
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        加入我們，體驗未來購物
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <input
                                type="text"
                                required
                                className="relative block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500 focus:outline-none transition-colors sm:text-sm"
                                placeholder="使用者名稱"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                required
                                className="relative block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500 focus:outline-none transition-colors sm:text-sm"
                                placeholder="電子郵件"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="relative block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-violet-500 focus:outline-none transition-colors sm:text-sm"
                                placeholder="密碼"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 py-3 px-4 text-sm font-bold text-white hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            註冊
                        </button>
                    </div>
                    <div className="text-center text-sm">
                        <span className="text-slate-400">已經有帳號了嗎？ </span>
                        <Link to="/login" className="font-medium text-fuchsia-400 hover:text-fuchsia-300 transition-colors">登入</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
