import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'

export default function HomePage() {
    const [products, setProducts] = useState([])
    const [cartCount, setCartCount] = useState(0)
    const [cartOpen, setCartOpen] = useState(false)
    const [cartItems, setCartItems] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        if (user) fetchCart();
    }, [user])

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/products.php`)
            const data = await res.json()
            setProducts(data)
        } catch (err) {
            console.error("Failed to fetch products", err)
        }
    }

    const fetchCart = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/cart.php?user_id=${user.user_id}`)
            const data = await res.json()
            if (data.items) {
                setCartItems(data.items);
                setCartCount(data.items.reduce((acc, item) => acc + item.quantity, 0))
            } else {
                setCartItems([]);
                setCartCount(0);
            }
        } catch (err) {
            console.error("Failed to fetch cart", err)
        }
    }

    const addToCart = async (product) => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await fetch(`${API_BASE_URL}/cart.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.user_id,
                    product_id: product.product_id,
                    quantity: 1
                })
            })
            fetchCart()
        } catch (err) {
            console.error("Add to cart failed", err)
        }
    }

    const handleCheckout = () => {
        fetch(`${API_BASE_URL}/orders.php`, {
            method: 'POST',
            body: JSON.stringify({ user_id: user.user_id, shipping_address: "123 Main St" })
        }).then(res => res.json()).then(d => {
            if (d.order_id) {
                alert('訂單已建立！編號: ' + d.order_id);
                fetchCart();
                fetchProducts();
                setCartOpen(false);
            }
            else alert('下單失敗: ' + (d.error || 'Unknown error'));
        })
    };

    const removeCartItem = async (cartItemId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/cart.php?user_id=${user.user_id}&cart_item_id=${cartItemId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchCart();
            } else {
                console.error("Failed to remove item");
            }
        } catch (err) {
            console.error("Remove failed", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Navbar cartCount={cartCount} onOpenCart={() => {
                fetchCart();
                setCartOpen(true);
            }} subtitle="精選商品" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <h1 className="text-2xl font-bold mb-8 text-gray-800">所有商品</h1>

                <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <div key={product.product_id} onClick={() => setSelectedProduct(product)} className="cursor-pointer">
                            <ProductCard product={product} onAddToCart={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                            }} />
                        </div>
                    ))}
                </div>
            </main>

            {/* Cart Modal */}
            {cartOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl flex flex-col max-h-[80vh]">
                        <h2 className="text-xl font-bold mb-4 flex-shrink-0 border-b pb-2">您的購物車</h2>

                        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                            {cartItems.length > 0 ? cartItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded flex-shrink-0"></div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{item.name}</p>
                                            <p className="text-xs text-gray-500">數量: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-blue-600">NT$ {Number(item.price * item.quantity).toFixed(0)}</span>
                                        <button
                                            onClick={() => removeCartItem(item.cart_item_id)}
                                            className="text-red-500 hover:text-red-700 text-xs px-2 py-1"
                                        >
                                            移除
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-center py-8">購物車是空的</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 flex-shrink-0 pt-4 border-t">
                            <button onClick={() => setCartOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">關閉</button>
                            {cartItems.length > 0 && (
                                <button
                                    onClick={handleCheckout}
                                    className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors"
                                >
                                    結帳 (NT$ {cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(0)})
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedProduct(null)}>
                    <div className="bg-white rounded-lg max-w-2xl w-full p-0 shadow-2xl overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                        <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-gray-100">
                            <img
                                src={selectedProduct.image_url ? `${API_BASE_URL.replace('/backend', '')}/${selectedProduct.image_url}` : "https://via.placeholder.com/600x600"}
                                alt={selectedProduct.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-6 flex flex-col justify-between w-full md:w-1/2">
                            <div>
                                <h2 className="text-2xl font-bold mb-2 text-gray-900">{selectedProduct.name}</h2>
                                <p className="text-blue-600 text-xl font-bold mb-4">NT$ {Number(selectedProduct.price).toFixed(0)}</p>
                                <p className="text-gray-600 leading-relaxed mb-6">{selectedProduct.description || "尚無商品描述..."}</p>
                                <div className="text-sm text-gray-500 mb-4">
                                    庫存: {selectedProduct.stock_quantity}
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                                >
                                    關閉
                                </button>
                                <button
                                    onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
                                >
                                    加入購物車
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
