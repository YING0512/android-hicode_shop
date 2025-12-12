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

    if (!user) return <div className="text-center pt-20 text-gray-800">請先登入</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pt-24 pb-12 px-4">
            <Navbar cartCount={0} onOpenCart={() => { }} subtitle="我的錢包" />
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="text-center mb-8">
                    <p className="text-gray-500 text-sm uppercase tracking-wider mb-2">目前餘額</p>
                    <h1 className="text-5xl font-bold text-yellow-600">
                        {balance.toFixed(0)} <span className="text-xl text-gray-500">代幣</span>
                    </h1>
                </div>

                <form onSubmit={handleRedeem} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">儲值代碼</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="輸入代碼 (例如: TEST100)"
                            className="w-full bg-white border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors text-center text-lg uppercase"
                        />
                    </div>
                    {message && (
                        <div className={`p-3 rounded text-center text-sm ${message.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading || !code}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                    >
                        {loading ? '處理中...' : '立即儲值'}
                    </button>
                </form>
            </div>
        </div>
    );
}
