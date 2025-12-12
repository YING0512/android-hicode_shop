import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


export default function Navbar({ cartCount, onOpenCart, subtitle, extraControls }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo Area */}
                    <div className="flex items-center cursor-pointer group flex-shrink-0" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 mr-3 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all">
                            <span className="font-bold text-white">N</span>
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 text-2xl font-bold tracking-tight group-hover:from-violet-400 group-hover:to-fuchsia-400 transition-all duration-300">
                            NeonShop
                        </span>
                        {/* Subtitle - Hidden on very small screens */}
                        {subtitle && (
                            <div className="hidden sm:flex ml-4 pl-4 border-l border-white/20 h-6 items-center">
                                <span className="text-lg font-medium text-slate-400 tracking-wider">{subtitle}</span>
                            </div>
                        )}
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        {extraControls ? (
                            <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                {user && <span className="text-sm font-medium text-slate-300">你好, {user.username}</span>}
                                <div className="h-4 w-px bg-white/10" />
                                {extraControls}
                                {user && (
                                    <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-red-400 hover:text-red-300 transition-colors">
                                        登出
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {user ? (
                                    <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                        <span className="text-sm font-medium text-slate-300">你好, {user.username}</span>
                                        <div className="h-4 w-px bg-white/10" />

                                        {/* Admin Link */}
                                        {user.role === 'admin' && (
                                            <button onClick={() => navigate('/admin/codes')} className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors">管理系統</button>
                                        )}

                                        {/* Wallet Link */}
                                        <button onClick={() => navigate('/wallet')} className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors">
                                            錢包
                                        </button>

                                        {/* Seller Link - Only for Sellers or Admins */}
                                        {(user.role === 'seller' || user.role === 'admin') && (
                                            <button onClick={() => navigate('/seller')} className="text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-colors">賣家中心</button>
                                        )}

                                        <button onClick={() => navigate('/orders')} className="text-sm text-slate-400 hover:text-white transition-colors">我的訂單</button>
                                        <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-red-400 hover:text-red-300 transition-colors">登出</button>
                                    </div>
                                ) : (
                                    <button onClick={() => navigate('/login')} className="text-sm font-semibold text-white hover:text-violet-400 transition-colors">登入</button>
                                )}

                                <button
                                    onClick={onOpenCart}
                                    className="relative p-3 text-slate-300 hover:text-white transition-colors group bg-white/5 rounded-xl hover:bg-violet-600/20"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                    {cartCount > 0 && (
                                        <span className="absolute top-1 right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-fuchsia-600 rounded-full shadow-lg shadow-fuchsia-500/50 border border-slate-900">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle & Cart Icon */}
                    <div className="flex md:hidden items-center gap-3">
                        {!extraControls && (
                            <button
                                onClick={onOpenCart}
                                className="relative p-2 text-slate-300 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-fuchsia-600 rounded-full shadow-lg border border-slate-900">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-slate-300 hover:text-white"
                        >
                            {isMobileMenuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-white/5 absolute w-full left-0 animate-fade-in-down">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        {extraControls ? (
                            <div className="flex flex-col gap-3 py-2">
                                {user && <div className="text-slate-300 px-2 py-1">你好, {user.username}</div>}
                                <div className="px-2">{extraControls}</div>
                                {user && (
                                    <button
                                        onClick={() => { logout(); navigate('/'); setIsMobileMenuOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-red-400 hover:bg-white/5 rounded-lg"
                                    >
                                        登出
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {user ? (
                                    <>
                                        <div className="px-3 py-2 text-sm font-medium text-slate-400 border-b border-white/5 mb-2">
                                            你好, {user.username}
                                        </div>

                                        {/* Mobile Admin Link */}
                                        {user.role === 'admin' && (
                                            <button
                                                onClick={() => { navigate('/admin/codes'); setIsMobileMenuOpen(false); }}
                                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-yellow-500 hover:bg-white/5"
                                            >
                                                管理系統
                                            </button>
                                        )}

                                        {/* Mobile Wallet Link */}
                                        <button
                                            onClick={() => { navigate('/wallet'); setIsMobileMenuOpen(false); }}
                                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-amber-500 hover:bg-white/5"
                                        >
                                            我的錢包
                                        </button>

                                        {(user.role === 'seller' || user.role === 'admin') && (
                                            <button
                                                onClick={() => { navigate('/seller'); setIsMobileMenuOpen(false); }}
                                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/5 hover:text-fuchsia-400"
                                            >
                                                賣家中心
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { navigate('/orders'); setIsMobileMenuOpen(false); }}
                                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/5"
                                        >
                                            我的訂單
                                        </button>
                                        <button
                                            onClick={() => { logout(); navigate('/'); setIsMobileMenuOpen(false); }}
                                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-white/5"
                                        >
                                            登出
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/5 hover:text-violet-400"
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
