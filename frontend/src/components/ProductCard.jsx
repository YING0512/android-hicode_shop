import React from 'react';

export default function ProductCard({ product, onAddToCart }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
            {/* Image Area */}
            <div className="aspect-square w-full bg-gray-100 relative">
                <img
                    src={product.image_url ? `/1208/${product.image_url}` : "https://via.placeholder.com/400x400?text=No+Image"}
                    alt={product.name}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={product.name}>
                        {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{product.category_name}</p>
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                        NT$ {Number(product.price).toFixed(0)}
                    </span>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onAddToCart(product);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                    >
                        加入購物車
                    </button>
                </div>
            </div>
        </div>
    );
}
