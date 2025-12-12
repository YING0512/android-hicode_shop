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

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* 管理員標頭 */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-yellow-500 flex items-center justify-center font-bold text-xl text-white">
                        A
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">後台管理系統</h1>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Admin Console</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-600 transition-colors"
                >
                    返回商店
                </button>
            </div>

            {/* 標籤導航 */}
            <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
                <div className="flex space-x-6 border-b border-gray-300">
                    <button
                        onClick={() => setActiveTab('codes')}
                        className={`pb-3 text-sm font-bold tracking-wide transition-colors ${activeTab === 'codes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        代碼管理
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-3 text-sm font-bold tracking-wide transition-colors ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
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
                            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm sticky top-24">
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold text-gray-800 mb-1">發行代碼</h2>
                                    <p className="text-sm text-gray-500">設定代碼、面額與使用次數</p>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">代碼 (Token Code)</label>
                                        <input
                                            type="text"
                                            value={newCode}
                                            onChange={e => setNewCode(e.target.value)}
                                            className="w-full bg-white border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500 text-gray-800"
                                            placeholder="自行輸入代碼"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">面額 (Value)</label>
                                            <input
                                                type="number"
                                                value={newValue}
                                                onChange={e => setNewValue(Number(e.target.value))}
                                                className="w-full bg-white border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500 text-gray-800"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">使用次數 (Max Uses)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={newMaxUses}
                                                onChange={e => setNewMaxUses(Number(e.target.value))}
                                                className="w-full bg-white border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500 text-gray-800"
                                            />
                                        </div>
                                    </div>

                                    <button disabled={loading} className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold transition-colors">
                                        確認新增代碼
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* 右側面板：代碼列表 */}
                        <div className="w-full lg:w-2/3">
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                    <h3 className="font-bold text-lg text-gray-800">代碼列表</h3>
                                    <div className="text-xs text-gray-500">共 {codes.length} 筆資料</div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 font-semibold">代碼內容</th>
                                                <th className="px-6 py-3 font-semibold">面額</th>
                                                <th className="px-6 py-3 font-semibold">使用進度</th>
                                                <th className="px-6 py-3 font-semibold">狀態</th>
                                                <th className="px-6 py-3 font-semibold text-right">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {codes.map(c => {
                                                const current = c.current_uses || 0;
                                                const max = c.max_uses || 1;
                                                const isFull = current >= max;

                                                return (
                                                    <tr key={c.code_id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 font-mono text-sm text-gray-700 font-bold">{c.code}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-green-600 font-bold">{Number(c.value).toFixed(0)}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-gray-500 font-mono">{current}/{max}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {isFull ?
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-600">FULL</span> :
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-600">ACTIVE</span>
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => handleDelete(c.code_id)}
                                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                                            >
                                                                刪除
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
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-lg text-gray-800">會員管理</h3>
                                <div className="text-xs text-gray-500">共 {users.length} 名會員</div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold">ID</th>
                                            <th className="px-6 py-3 font-semibold">使用者名稱</th>
                                            <th className="px-6 py-3 font-semibold">目前權限 (Role)</th>
                                            <th className="px-6 py-3 font-semibold">錢包餘額</th>
                                            <th className="px-6 py-3 font-semibold text-right">權限操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {users.map(u => (
                                            <tr key={u.user_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-500">#{u.user_id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-800 font-medium">{u.username}</div>
                                                    <div className="text-xs text-gray-500">{u.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {u.role === 'admin' && <span className="text-yellow-600 font-bold text-xs uppercase bg-yellow-100 px-2 py-1 rounded">Admin</span>}
                                                    {u.role === 'seller' && <span className="text-purple-600 font-bold text-xs uppercase bg-purple-100 px-2 py-1 rounded">Seller</span>}
                                                    {u.role === 'user' && <span className="text-gray-600 font-bold text-xs uppercase bg-gray-100 px-2 py-1 rounded">Buyer</span>}
                                                </td>
                                                <td className="px-6 py-4 text-gray-800 font-mono">{Number(u.wallet_balance).toFixed(0)}</td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    {u.role !== 'admin' && (
                                                        <>
                                                            {u.role !== 'seller' ? (
                                                                <button
                                                                    onClick={() => handleUpdateRole(u.user_id, 'seller')}
                                                                    className="text-xs px-2 py-1 rounded bg-white hover:bg-purple-50 text-purple-600 border border-purple-200"
                                                                >
                                                                    設為賣家
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleUpdateRole(u.user_id, 'user')}
                                                                    className="text-xs px-2 py-1 rounded bg-white hover:bg-gray-50 text-gray-500 border border-gray-200"
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
