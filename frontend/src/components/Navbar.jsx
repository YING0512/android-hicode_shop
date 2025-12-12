import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


export default function Navbar({ cartCount, onOpenCart, subtitle, extraControls }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Area */}
                    <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded mr-2">
                            <span className="font-bold text-white">N</span>
                        </div>
                        <span className="text-xl font-bold text-gray-800 tracking-tight">
                            NeonShop
                        </span>
                        {/* Subtitle */}
                        {subtitle && (
                            <span className="hidden sm:block ml-4 pl-4 border-l border-gray-300 text-gray-500 text-sm font-medium">
                                {subtitle}
                            </span>
                        )}
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        {extraControls ? (
                            <div className="flex items-center gap-4">
                                {user && <span className="text-sm text-gray-600">你好, {user.username}</span>}
                                {extraControls}
                                {user && (
                                    <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-red-600 hover:text-red-800">
                                        登出
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {user ? (
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-600">你好, {user.username}</span>

                                        {/* Admin Link */}
                                        {user.role === 'admin' && (
                                            <button onClick={() => navigate('/admin/codes')} className="text-sm font-medium text-yellow-600 hover:text-yellow-700">管理系統</button>
                                        )}

                                        {/* Wallet Link */}
                                        <button onClick={() => navigate('/wallet')} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                            錢包
                                        </button>

                                        {/* Seller Link */}
                                        {(user.role === 'seller' || user.role === 'admin') && (
                                            <button onClick={() => navigate('/seller')} className="text-sm font-medium text-purple-600 hover:text-purple-700">賣家中心</button>
                                        )}

                                        <button onClick={() => navigate('/orders')} className="text-sm text-gray-600 hover:text-gray-900">我的訂單</button>
                                        <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-red-600 hover:text-red-800">登出</button>
                                    </div>
                                ) : (
                                    <button onClick={() => navigate('/login')} className="text-sm font-bold text-blue-600 hover:text-blue-800">登入</button>
                                )}

                                <button
                                    onClick={onOpenCart}
                                    className="relative p-2 text-gray-600 hover:text-gray-900"
                                >
                                    <span className="text-sm font-medium">購物車</span>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex md:hidden items-center gap-3">
                        {!extraControls && (
                            <button onClick={onOpenCart} className="relative p-2 text-gray-600">
                                <span>🛒</span>
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-gray-600"
                        >
                            {isMobileMenuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        {extraControls ? (
                            <div className="flex flex-col gap-3 py-2">
                                {user && <div className="text-gray-600 px-2 py-1">你好, {user.username}</div>}
                                <div className="px-2">{extraControls}</div>
                                {user && (
                                    <button
                                        onClick={() => { logout(); navigate('/'); setIsMobileMenuOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-50 rounded-lg"
                                    >
                                        登出
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {user ? (
                                    <>
                                        <div className="px-3 py-2 text-sm font-medium text-gray-500 border-b border-gray-100 mb-2">
                                            你好, {user.username}
                                        </div>

                                        {user.role === 'admin' && (
                                            <button
                                                onClick={() => { navigate('/admin/codes'); setIsMobileMenuOpen(false); }}
                                                className="block w-full text-left px-3 py-2 text-base font-medium text-yellow-600 hover:bg-gray-50"
                                            >
                                                管理系統
                                            </button>
                                        )}

                                        <button
                                            onClick={() => { navigate('/wallet'); setIsMobileMenuOpen(false); }}
                                            className="block w-full text-left px-3 py-2 text-base font-medium text-blue-600 hover:bg-gray-50"
                                        >
                                            我的錢包
                                        </button>

                                        {(user.role === 'seller' || user.role === 'admin') && (
                                            <button
                                                onClick={() => { navigate('/seller'); setIsMobileMenuOpen(false); }}
                                                className="block w-full text-left px-3 py-2 text-base font-medium text-purple-600 hover:bg-gray-50"
                                            >
                                                賣家中心
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { navigate('/orders'); setIsMobileMenuOpen(false); }}
                                            className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            我的訂單
                                        </button>
                                        <button
                                            onClick={() => { logout(); navigate('/'); setIsMobileMenuOpen(false); }}
                                            className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
                                        >
                                            登出
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                                        className="block w-full text-left px-3 py-2 text-base font-bold text-blue-600 hover:bg-gray-50"
                                    >
                                        登入
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
