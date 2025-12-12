import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'PENDING', 'COMPLETED', 'CANCELLED'
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/orders.php?user_id=${user.user_id}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setOrders(data);
            }
        } catch (err) {
            console.error("Failed to fetch orders", err);
        }
    };

    const openCancelModal = (orderId) => {
        setSelectedOrderId(orderId);
        setCancelReason('');
        setCancelModalOpen(true);
    };

    const handleCancelSubmit = async () => {
        if (!cancelReason.trim()) {
            alert('請輸入取消原因');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/orders.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: selectedOrderId,
                    user_id: user.user_id,
                    action: 'cancel',
                    reason: cancelReason
                })
            });

            if (res.ok) {
                alert('訂單已取消');
                setCancelModalOpen(false);
                fetchOrders();
            } else {
                alert('取消失敗');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'ALL') return true;
        return order.status === statusFilter;
    });

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Navbar cartCount={0} onOpenCart={() => { }} subtitle="我的訂單" />

            <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

                {/* Status Tabs */}
                <div className="flex gap-6 border-b border-gray-200 mb-8 overflow-x-auto">
                    {['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`pb-3 px-1 text-sm font-bold transition-all relative whitespace-nowrap
                                ${statusFilter === status
                                    ? 'text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {status === 'ALL' && '全部訂單'}
                            {status === 'PENDING' && '待處理'}
                            {status === 'COMPLETED' && '已完成'}
                            {status === 'CANCELLED' && '已取消'}

                            {statusFilter === status && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {filteredOrders.map((order) => (
                        <div key={order.order_id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-lg font-bold text-gray-800">
                                            訂單 #{new Date(order.order_date).toISOString().slice(2, 10).replace(/-/g, '')}{String(order.order_id).padStart(4, '0')}
                                        </p>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold
                                            ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }`}>
                                            {order.status === 'PENDING' ? '待處理' :
                                                order.status === 'COMPLETED' ? '已完成' :
                                                    order.status === 'CANCELLED' ? '已取消' : order.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm">{new Date(order.order_date).toLocaleString()}</p>
                                </div>
                                <div className="mt-4 sm:mt-0 text-right">
                                    <p className="text-2xl font-bold text-gray-900">NT$ {Number(order.total_amount).toFixed(0)}</p>
                                </div>
                            </div>

                            {/* Order Items Detail */}
                            <div className="bg-gray-50 rounded p-4 mb-4 border border-gray-100">
                                {(() => {
                                    try {
                                        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                                        return items && items.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 py-3 border-b border-gray-200 last:border-0">
                                                <div className="w-16 h-16 bg-white border border-gray-200 rounded flex-shrink-0 overflow-hidden">
                                                    {item.image_url && (
                                                        <img src={`${API_BASE_URL.replace('/backend', '')}/${item.image_url}`} alt={item.name} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="flex-1 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-gray-800 font-medium">{item.name}</p>
                                                        <p className="text-gray-500 text-sm">x {item.quantity}</p>
                                                    </div>
                                                    <span className="text-gray-700">NT$ {Number(item.price).toFixed(0)}</span>
                                                </div>
                                            </div>
                                        ));
                                    } catch (e) { return <span className='text-xs text-red-500'>無法載入明細</span>; }
                                })()}
                            </div>

                            {/* Actions & Info */}
                            <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                                <div>
                                    {order.status === 'CANCELLED' && order.cancellation_reason && (
                                        <p className="text-sm text-red-600">
                                            <span className="font-bold">取消原因:</span> {order.cancellation_reason}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    {order.status === 'PENDING' && (
                                        <button
                                            onClick={() => openCancelModal(order.order_id)}
                                            className="text-sm px-4 py-2 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            取消訂單
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-lg">此分類下尚無訂單</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Custom Cancel Modal */}
            {cancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white border border-gray-200 rounded-lg max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">取消訂單</h3>
                        <p className="text-gray-600 mb-4 text-sm">請輸入取消訂單的原因，以便賣家了解狀況。</p>

                        <textarea
                            className="w-full bg-white border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:border-blue-500 transition-colors h-32 mb-6"
                            placeholder="例如：改變心意、訂錯商品..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setCancelModalOpen(false)}
                                className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                暫不取消
                            </button>
                            <button
                                onClick={handleCancelSubmit}
                                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
                            >
                                確定取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
