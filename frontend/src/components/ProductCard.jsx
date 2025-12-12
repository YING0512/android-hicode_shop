import React from 'react';

export default function ProductCard({ product, onAddToCart }) {
    return (
        <div className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)] hover:border-violet-500/30 h-full flex flex-col">
            {/* Image Area */}
            <div className="aspect-square w-full overflow-hidden bg-slate-800/50 relative">
                {/* Glow effect behind image on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 to-fuchsia-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <img
                    src={product.image_url ? `/1208/${product.image_url}` : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop"}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 mr-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-2 min-h-[3.5rem]">
                            {product.name}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1 line-clamp-1">{product.category_name}</p>
                    </div>
                    <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 whitespace-nowrap">
                        NT$ {Number(product.price).toFixed(0)}
                    </p>
                </div>

                <div className="mt-auto">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onAddToCart(product);
                        }}
                        className="w-full relative overflow-hidden group/btn bg-white/5 hover:bg-violet-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 border border-white/10 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/25"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            加入購物車
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transition-transform group-hover/btn:translate-x-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
