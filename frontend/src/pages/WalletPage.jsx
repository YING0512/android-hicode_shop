import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import Navbar from '../components/Navbar';

export default function WalletPage() {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) fetchBalance();
    }, [user]);

    const fetchBalance = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/wallet.php?user_id=${user.user_id}`);
            const data = await res.json();
            if (data.balance !== undefined) {
                setBalance(data.balance);
            }
        } catch (err) {
            console.error("Failed to fetch balance");
        }
    };

    const handleRedeem = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/wallet.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.user_id, code })
            });
            const data = await res.json();

            if (res.ok) {
                setMessage(`成功儲值: ${data.added_value} 代幣`);
                setCode('');
                fetchBalance();
            } else {
                setMessage(`儲值失敗: ${data.error}`);
            }
        } catch (err) {
            setMessage('連線錯誤');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="text-white text-center pt-20">請先登入</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-4">
            <Navbar cartCount={0} onOpenCart={() => { }} subtitle="我的錢包" />
            <div className="max-w-md mx-auto glass-panel p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">目前餘額</p>
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600">
                        {balance.toFixed(0)} <span className="text-xl text-slate-500">代幣</span>
                    </h1>
                </div>

                <form onSubmit={handleRedeem} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">儲值代碼</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="輸入代碼 (例如: TEST100)"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors text-center text-lg tracking-widest uppercase"
                        />
                    </div>
                    {message && (
                        <div className={`p-3 rounded text-center text-sm ${message.includes('成功') ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                            {message}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading || !code}
                        className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
                    >
                        {loading ? '處理中...' : '立即儲值'}
                    </button>
                </form>
            </div>
        </div>
    );
}
