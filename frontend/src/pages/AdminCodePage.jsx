import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

export default function AdminCodePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // 標籤頁狀態
    const [activeTab, setActiveTab] = useState('codes'); // 'codes' or 'users'

    // 資料狀態
    const [codes, setCodes] = useState([]);
    const [users, setUsers] = useState([]);

    // 表單狀態
    const [newCode, setNewCode] = useState('');
    const [newValue, setNewValue] = useState(100);
    const [newMaxUses, setNewMaxUses] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchCodes();
        fetchUsers();
    }, [user]);

    const fetchCodes = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin_codes.php?admin_id=${user.user_id}`);
            if (res.ok) {
                const data = await res.json();
                setCodes(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin_users.php?admin_id=${user.user_id}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newCode || newMaxUses < 1) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin_codes.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    admin_id: user.user_id,
                    code: newCode,
                    value: newValue,
                    max_uses: newMaxUses
                })
            });
            if (res.ok) {
                setNewCode('');
                setNewMaxUses(1);
                fetchCodes();
            } else {
                const d = await res.json();
                alert(d.error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('確定刪除?')) return;
        await fetch(`${API_BASE_URL}/admin_codes.php?admin_id=${user.user_id}&code_id=${id}`, { method: 'DELETE' });
        fetchCodes();
    };

    const handleUpdateRole = async (targetId, newRole) => {
        if (!confirm(`確定變更使用者權限為 ${newRole}?`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin_users.php?admin_id=${user.user_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: targetId, role: newRole })
            });
            if (res.ok) {
                fetchUsers();
            } else {
                alert('Update failed');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const generateRandomCode = (val) => {
        const prefix = val === 1000 ? 'VIP' : 'CODE';
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        setNewCode(`${prefix}${random}${val}`);
        setNewValue(val);
        setNewMaxUses(1);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* 管理員標頭 */}
            <div className="bg-slate-900 border-b border-white/5 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-yellow-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-yellow-600/20 text-white border border-white/10">
                        A
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">後台管理系統</h1>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Marketplace Admin Console</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm text-slate-300 hover:text-white border border-white/5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                    </svg>
                    返回商店
                </button>
            </div>

            {/* 標籤導航 */}
            <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
                <div className="flex space-x-6 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('codes')}
                        className={`pb-3 text-sm font-bold tracking-wide transition-colors ${activeTab === 'codes' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`}
                    >
                        代碼管理
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-3 text-sm font-bold tracking-wide transition-colors ${activeTab === 'users' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`}
                    >
                        會員管理 & 權限
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-4">
                {activeTab === 'codes' ? (
                    /* 代碼頁籤內容 */
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* 左側面板：建立代碼 */}
                        <div className="w-full lg:w-1/3">
                            <div className="bg-slate-900/40 backdrop-blur border border-white/5 p-6 rounded-2xl sticky top-24 shadow-xl">
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold text-white mb-1">發行代碼</h2>
                                    <p className="text-sm text-slate-400">設定代碼、面額與使用次數</p>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">代碼 (Token Code)</label>
                                        <input
                                            type="text"
                                            value={newCode}
                                            onChange={e => setNewCode(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors font-mono text-lg text-white"
                                            placeholder="輸入或生成"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">面額 (Value)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={newValue}
                                                    onChange={e => setNewValue(Number(e.target.value))}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors font-mono text-lg text-white"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">使用次數 (Max Uses)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={newMaxUses}
                                                    onChange={e => setNewMaxUses(Number(e.target.value))}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors font-mono text-lg text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>


                                    <button disabled={loading} className="w-full mt-4 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-xl font-bold text-white shadow-lg shadow-amber-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        確認新增代碼
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* 右側面板：代碼列表 */}
                        <div className="w-full lg:w-2/3">
                            <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                                    <h3 className="font-bold text-lg text-white">代碼列表</h3>
                                    <div className="text-xs text-slate-500">共 {codes.length} 筆資料</div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-950 text-slate-500 text-xs uppercase tracking-wider border-b border-white/5">
                                            <tr>
                                                <th className="px-6 py-4 font-normal">代碼內容</th>
                                                <th className="px-6 py-4 font-normal">面額</th>
                                                <th className="px-6 py-4 font-normal">使用進度</th>
                                                <th className="px-6 py-4 font-normal">狀態</th>
                                                <th className="px-6 py-4 font-normal text-right">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {codes.map(c => {
                                                const current = c.current_uses || 0;
                                                const max = c.max_uses || 1;
                                                const isFull = current >= max;

                                                return (
                                                    <tr key={c.code_id} className="hover:bg-white/5 transition-colors group">
                                                        <td className="px-6 py-4 font-mono text-sm text-slate-300 font-bold">{c.code}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-emerald-400 font-bold">{Number(c.value).toFixed(0)}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                                                    <div className={`h-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min((current / max) * 100, 100)}%` }}></div>
                                                                </div>
                                                                <span className="text-xs text-slate-400 font-mono">{current}/{max}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {isFull ?
                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">FULL</span> :
                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">ACTIVE</span>
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => handleDelete(c.code_id)}
                                                                className="text-slate-500 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-lg opacity-0 group-hover:opacity-100"
                                                                title="Delete Code"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    /* 使用者頁籤內容 */
                    <div className="w-full">
                        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                                <h3 className="font-bold text-lg text-white">會員管理</h3>
                                <div className="text-xs text-slate-500">共 {users.length} 名會員</div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-950 text-slate-500 text-xs uppercase tracking-wider border-b border-white/5">
                                        <tr>
                                            <th className="px-6 py-4 font-normal">ID</th>
                                            <th className="px-6 py-4 font-normal">使用者名稱</th>
                                            <th className="px-6 py-4 font-normal">目前權限 (Role)</th>
                                            <th className="px-6 py-4 font-normal">錢包餘額</th>
                                            <th className="px-6 py-4 font-normal">註冊日期</th>
                                            <th className="px-6 py-4 font-normal text-right">權限操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {users.map(u => (
                                            <tr key={u.user_id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-xs text-slate-500">#{u.user_id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-slate-300 font-medium">{u.username}</div>
                                                    <div className="text-xs text-slate-600">{u.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {u.role === 'admin' && <span className="text-yellow-500 font-bold text-xs uppercase border border-yellow-500/30 px-2 py-1 rounded bg-yellow-500/10">Admin</span>}
                                                    {u.role === 'seller' && <span className="text-fuchsia-400 font-bold text-xs uppercase border border-fuchsia-400/30 px-2 py-1 rounded bg-fuchsia-400/10">Seller</span>}
                                                    {u.role === 'user' && <span className="text-slate-500 font-bold text-xs uppercase border border-slate-500/30 px-2 py-1 rounded bg-slate-500/10">Buyer</span>}
                                                </td>
                                                <td className="px-6 py-4 text-amber-500 font-mono">{Number(u.wallet_balance).toFixed(0)}</td>
                                                <td className="px-6 py-4 text-slate-500 text-xs">{new Date(u.registration_date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    {u.role !== 'admin' && (
                                                        <>
                                                            {u.role !== 'seller' ? (
                                                                <button
                                                                    onClick={() => handleUpdateRole(u.user_id, 'seller')}
                                                                    className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-fuchsia-600/20 text-slate-400 hover:text-fuchsia-400 border border-white/5 transition-all"
                                                                >
                                                                    設為賣家
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleUpdateRole(u.user_id, 'user')}
                                                                    className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-slate-600/20 text-slate-400 hover:text-slate-300 border border-white/5 transition-all"
                                                                >
                                                                    取消賣家
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
