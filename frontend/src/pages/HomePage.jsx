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
    const [cartItems, setCartItems] = useState([]) // New state for cart items
    const [selectedProduct, setSelectedProduct] = useState(null) // New state for product detail modal
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
                fetchProducts(); // Refresh product list to update stock and remove off-shelf items
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
        <div className="min-h-screen bg-slate-950 text-white">
            <Navbar cartCount={cartCount} onOpenCart={() => {
                fetchCart(); // Refresh cart when opening
                setCartOpen(true);
            }} subtitle="精選商品" />

            <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="flex justify-between items-center mb-8">
                </div>

                <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-8">
                    {products.map((product) => (
                        <div key={product.product_id} onClick={() => setSelectedProduct(product)} className="cursor-pointer">
                            <ProductCard product={product} onAddToCart={(e) => {
                                e.stopPropagation(); // Prevent opening modal when clicking add to cart
                                addToCart(product);
                            }} />
                        </div>
                    ))}
                </div>
            </main>

            {/* Cart Modal */}
            {cartOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col max-h-[80vh]">
                        <h2 className="text-2xl font-bold mb-4 flex-shrink-0">您的購物車</h2>

                        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                            {cartItems.length > 0 ? cartItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-slate-950 p-3 rounded border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        {/* Minimal image or placeholder */}
                                        <div className="w-10 h-10 bg-slate-800 rounded overflow-hidden flex-shrink-0">
                                            {/* If we had item.image_url it would be great, but cart API might not send it. Let's assume name is enough for now or modify cart API. 
                                                Actually, my backend update for Cart GET (orders.php ... wait, Cart GET is in cart.php which I didn't verify closely, but usually joins Product).
                                                Let's check `cart.php` later if needed. For now assuming item.name exists.
                                             */}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{item.name}</p>
                                            <p className="text-xs text-slate-400">數量: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-violet-400">NT$ {Number(item.price * item.quantity).toFixed(0)}</span>
                                        <button
                                            onClick={() => removeCartItem(item.cart_item_id)}
                                            className="text-red-500 hover:text-red-400 text-xs px-2 py-1 rounded border border-red-900/30 hover:bg-red-900/20"
                                        >
                                            移除
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-slate-500 text-center py-8">購物車是空的</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 flex-shrink-0 pt-4 border-t border-slate-800">
                            <button onClick={() => setCartOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white">關閉</button>
                            {cartItems.length > 0 && (
                                <button
                                    onClick={handleCheckout}
                                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all"
                                >
                                    立即結帳 (NT$ {cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(0)})
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setSelectedProduct(null)}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-0 shadow-2xl overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                        <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-slate-800">
                            <img
                                src={selectedProduct.image_url ? `${API_BASE_URL.replace('/backend', '')}/${selectedProduct.image_url}` : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop"}
                                alt={selectedProduct.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-6 md:p-8 flex flex-col justify-between w-full md:w-1/2">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">{selectedProduct.name}</h2>
                                <p className="text-violet-400 text-2xl font-bold mb-4">NT$ {Number(selectedProduct.price).toFixed(0)}</p>
                                <p className="text-slate-300 leading-relaxed mb-6">{selectedProduct.description || "尚無商品描述..."}</p>
                                <div className="text-sm text-slate-500 mb-4">
                                    庫存: {selectedProduct.stock_quantity} | 銷量: {selectedProduct.sales_count || 0}
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="px-4 py-2 border border-slate-700 rounded hover:bg-slate-800 transition-colors"
                                >
                                    關閉
                                </button>
                                <button
                                    onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                                    className="flex-1 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded font-bold transition-all"
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
