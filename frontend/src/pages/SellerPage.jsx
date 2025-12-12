import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import Navbar from '../components/Navbar';

export default function SellerPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { productId } = useParams();

    // 判斷是否為編輯模式
    const isEditing = !!productId;
    const existingProduct = location.state?.product;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [category, setCategory] = useState('1');
    const [status, setStatus] = useState('on_shelf');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditing && existingProduct) {
            setName(existingProduct.name);
            setDescription(existingProduct.description);
            setPrice(existingProduct.price);
            setStock(existingProduct.stock_quantity);
            setCategory(existingProduct.category_id || '1');
            setStatus(existingProduct.status || 'on_shelf');
            if (existingProduct.image_url) {
                setPreview(`/1208/${existingProduct.image_url}`);
            }
        }
    }, [isEditing, existingProduct]);

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-800">
                <p>請先登入</p>
            </div>
        );
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing) {
                // 更新模式 (PUT) - 目前僅支援 JSON 更新元資料
                // 若要支援圖片更新，需增強後端處理
                const payload = {
                    product_id: productId,
                    seller_id: user.user_id,
                    name,
                    description,
                    price,
                    stock_quantity: stock,
                    category_id: category,
                    status: status
                };

                const res = await fetch(`${API_BASE_URL}/products.php`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    alert('商品更新成功！');
                    navigate('/seller');
                } else {
                    const data = await res.json();
                    alert('更新失敗: ' + (data.error || 'Unknown error'));
                }

            } else {
                // 建立模式 (POST)
                const formData = new FormData();
                formData.append('name', name);
                formData.append('description', description);
                formData.append('price', price);
                formData.append('stock_quantity', stock);
                formData.append('category_id', category);
                formData.append('status', status);
                formData.append('seller_id', user.user_id);
                if (image) {
                    formData.append('image', image);
                }

                const res = await fetch(`${API_BASE_URL}/products.php`, {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    alert('商品上架成功！');
                    navigate('/seller');
                } else {
                    const data = await res.json();
                    alert('上架失敗: ' + (data.error || '未知錯誤'));
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('發生錯誤');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pt-24 pb-12 px-4">
            <Navbar cartCount={0} onOpenCart={() => { }} subtitle="賣家中心" />
            <div className="max-w-2xl mx-auto bg-white border border-gray-200 p-8 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold mb-8 text-center text-gray-800">
                    {isEditing ? '編輯商品' : '新增商品'}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">商品名稱</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-white border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">商品描述</label>
                        <textarea
                            required
                            className="w-full bg-white border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors h-32"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">價格 ($)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                className="w-full bg-white border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">庫存數量</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full bg-white border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">商品分類 ID</label>
                        <input
                            type="number"
                            required
                            min="1"
                            className="w-full bg-white border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">上架狀態</label>
                        <select
                            className="w-full bg-white border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="on_shelf">🟢 上架中 (On Shelf)</option>
                            <option value="off_shelf">🔴 已下架 (Off Shelf)</option>
                        </select>
                    </div>

                    {!isEditing && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">商品圖片 (編輯模式暫不支援修改圖片)</label>
                            <div className="flex items-center space-x-4">
                                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2 rounded border border-gray-300">
                                    <span className="text-sm text-gray-700">選擇圖片</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                                {image && <span className="text-sm text-gray-500">{image.name}</span>}
                            </div>
                        </div>
                    )}

                    {preview && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-2">預覽:</p>
                            <img src={preview} alt="Preview" className="h-48 w-full object-cover rounded border border-gray-200" />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        {loading ? '處理中...' : (isEditing ? '更新商品' : '確認上架')}
                    </button>
                </form>
            </div>
        </div>
    );
}
