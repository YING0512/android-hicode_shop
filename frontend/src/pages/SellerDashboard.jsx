import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function SellerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState('products'); // 'products' | 'orders'
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [orderTab, setOrderTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED'

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (view === 'products') fetchMyProducts();
        if (view === 'orders') fetchMyOrders();
    }, [user, view]);

    const fetchMyProducts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/products.php?seller_id=${user.user_id}`);
            const data = await res.json();
            if (Array.isArray(data)) setProducts(data);
        } catch (err) {
            console.error("Failed to fetch products", err);
        }
    };

    const fetchMyOrders = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/orders.php?seller_id=${user.user_id}`);
            const data = await res.json();
            if (Array.isArray(data)) setOrders(data);
        } catch (err) {
            console.error("Failed to fetch orders", err);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!confirm('確定要刪除這個商品嗎？此動作無法復原。')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/products.php?id=${productId}&seller_id=${user.user_id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setProducts(products.filter(p => p.product_id !== productId));
            } else {
                alert("刪除失敗");
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleToggleStatus = async (product, currentStatus) => {
        const newStatus = currentStatus === 'on_shelf' ? 'off_shelf' : 'on_shelf';

        if (newStatus === 'on_shelf' && product.stock_quantity <= 0) {
            if (confirm('無法直接上架：目前庫存為 0。\n\n是否前往編輯頁面補充庫存？')) {
                navigate(`/seller/edit/${product.product_id}`, { state: { product } });
            }
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/products.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: product.product_id,
                    seller_id: user.user_id,
                    status: newStatus,
                })
            });

            if (res.ok) {
                setProducts(products.map(p =>
                    p.product_id === product.product_id ? { ...p, status: newStatus } : p
                ));
            } else {
                alert("更新狀態失敗");
            }
        } catch (err) {
            console.error("Status update failed", err);
        }
    };

    const handleCancelOrder = async (orderId) => {
        const reason = prompt("請輸入取消原因:", "賣家無法出貨");
        if (reason === null) return;

        try {
            const res = await fetch(`${API_BASE_URL}/orders.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: orderId,
                    user_id: user.user_id,
                    action: 'cancel',
                    reason: reason
                })
            });

            if (res.ok) {
                alert('訂單已取消');
                fetchMyOrders();
            } else {
                const err = await res.json();
                alert('取消失敗: ' + (err.error || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCompleteOrder = async (orderId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/orders.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: orderId,
                    action: 'complete'
                })
            });

            if (res.ok) {
                fetchMyOrders();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredOrders = orders.filter(o => {
        if (orderTab === 'ALL') return true;
        if (orderTab === 'PENDING') return o.status === 'PENDING';
        if (orderTab === 'COMPLETED') return o.status === 'COMPLETED';
        if (orderTab === 'CANCELLED') return o.status === 'CANCELLED';
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pt-24 pb-12 px-4">
            <Navbar
                cartCount={0}
                onOpenCart={() => { }}
                subtitle="賣家中心"
                extraControls={
                    <>
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors px-2"
                        >
                            精選商品
                        </button>
                        <div className="flex bg-gray-200 rounded p-0.5 border border-gray-300">
                            <button
                                onClick={() => setView('products')}
                                className={`px-3 py-1 rounded transition-colors text-sm font-medium ${view === 'products' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                商品管理
                            </button>
                            <button
                                onClick={() => setView('orders')}
                                className={`px-3 py-1 rounded transition-colors text-sm font-medium ${view === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                訂單管理
                            </button>
                        </div>
                        <button
                            onClick={() => navigate('/seller/add')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded transition-colors text-sm whitespace-nowrap"
                        >
                            + 新增商品
                        </button>
                    </>
                }
            />
            <div className="max-w-[1920px] mx-auto">
                <div className="flex justify-between items-center mb-8">
                </div>

                {view === 'products' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {products.map((product) => (
                            <div key={product.product_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden p-4 group shadow-sm hover:shadow-md transition-shadow">
                                <div className="aspect-square w-full rounded overflow-hidden bg-gray-100 mb-4 relative">
                                    <img
                                        src={product.image_url ? `${API_BASE_URL.replace('/backend', '')}/${product.image_url}` : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop"}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                        <p className="text-xs text-white line-clamp-6">{product.description}</p>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1">{product.name}</h3>
                                <p className="text-blue-600 font-bold mb-2">NT$ {Number(product.price).toFixed(0)}</p>
                                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                    <span>銷量: {product.sales_count || 0}</span>
                                </div>
                                <div className="mb-4 flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${product.status === 'on_shelf' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        <span className={`text-xs font-bold ${product.status === 'on_shelf'
                                            ? 'text-green-600'
                                            : 'text-gray-500'
                                            }`}>
                                            {product.status === 'on_shelf' ? '上架中' : '已下架'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleToggleStatus(product, product.status)}
                                        className={`text-xs px-3 py-1.5 rounded font-medium transition-all duration-200 ${product.status === 'on_shelf'
                                            ? 'bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600'
                                            : 'bg-green-600 text-white hover:bg-green-500'
                                            }`}
                                    >
                                        {product.status === 'on_shelf' ? '下架' : '上架販售'}
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/seller/edit/${product.product_id}`, { state: { product } })}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded transition-colors"
                                    >
                                        編輯
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.product_id)}
                                        className="px-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 rounded transition-colors"
                                    >
                                        刪除
                                    </button>
                                </div>
                            </div>
                        ))}
                        {products.length === 0 && <div className="col-span-full text-center text-gray-500 py-20">暫無商品</div>}
                    </div>
                ) : (
                    <div>
                        <div className="flex gap-4 border-b border-gray-200 mb-6 pb-4 overflow-x-auto">
                            {['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setOrderTab(status)}
                                    className={`text-sm font-bold pb-1 whitespace-nowrap px-2 ${orderTab === status ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {status === 'ALL' ? '全部訂單' :
                                        status === 'PENDING' ? '待處理' :
                                            status === 'COMPLETED' ? '已完成' : '已取消'}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {filteredOrders.map(order => (
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
                                                                'bg-gray-100 text-gray-600'
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
                                                            <span className="text-gray-600">NT$ {Number(item.price).toFixed(0)}</span>
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
                                        <div className="flex gap-3">
                                            {order.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleCancelOrder(order.order_id)}
                                                        className="text-sm px-4 py-2 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        取消訂單
                                                    </button>
                                                    <button
                                                        onClick={() => handleCompleteOrder(order.order_id)}
                                                        className="text-sm px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-white font-bold transition-colors"
                                                    >
                                                        完成訂單
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredOrders.length === 0 && (
                                <div className="col-span-full text-center py-20">
                                    <p className="text-gray-500 text-lg">此分類下尚無訂單</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-12 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-500 hover:text-gray-800 underline"
                    >
                        ← 返回賣場首頁
                    </button>
                </div>
            </div>
        </div>
    );
}
