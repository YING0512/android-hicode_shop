import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Localization
const STRINGS = {
    title: "聊天室",
    loading: "載入中...",
    no_messages: "無聊天記錄",
    no_messages_yet: "尚無訊息",
    recent_messages: "最近訊息",
    select_chat: "選擇聊天室開始對話",
    type_message: "輸入訊息...",
    send: "發送",
    order: "訂單編號",
    login_plz: "請先登入以檢視聊天室。"
};

export default function ChatPage() {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    // State
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Fetch Rooms on Mount using Polling
    useEffect(() => {
        if (!user) return;

        fetchRooms();
        const interval = setInterval(fetchRooms, 5000); // Poll every 5s for new rooms/last message updates
        return () => clearInterval(interval);
    }, [user]);

    // Fetch Messages when Room Selected (and Poll)
    useEffect(() => {
        if (!selectedRoom) return;

        fetchMessages(selectedRoom.chat_room_id);
        const interval = setInterval(() => {
            fetchMessages(selectedRoom.chat_room_id);
        }, 3000); // Poll every 3s for messages
        return () => clearInterval(interval);
    }, [selectedRoom]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchRooms = async () => {
        try {
            const response = await fetch(`http://localhost/1208/backend/chat.php?action=list_rooms&user_id=${user.user_id}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                // Determine display name for each room
                const formattedRooms = data.map(room => {
                    const isBuyer = room.buyer_id === user.user_id;
                    const otherName = isBuyer ? room.seller_name : room.buyer_name;
                    return { ...room, displayName: `${otherName} (Order #${room.order_id})`, unread: parseInt(room.unread_count) || 0 };
                });
                setRooms(formattedRooms);
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (roomId) => {
        try {
            const response = await fetch(`http://localhost/1208/backend/chat.php?action=get_messages&room_id=${roomId}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setMessages(data);
                // Mark as read if user is in this room
                await markAsRead(roomId);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const markAsRead = async (roomId) => {
        try {
            await fetch(`http://localhost/1208/backend/chat.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_read', room_id: roomId, user_id: user.user_id })
            });
            // Update local unread count
            setRooms(prev => prev.map(r => r.chat_room_id === roomId ? { ...r, unread: 0 } : r));
        } catch (e) { console.error("Error marking read:", e); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedRoom) return;

        try {
            const response = await fetch('http://localhost/1208/backend/chat.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_id: selectedRoom.chat_room_id,
                    sender_id: user.user_id,
                    content: newMessage,
                    type: 'TEXT'
                })
            });
            const result = await response.json();
            if (result.status === 'success') {
                setNewMessage('');
                fetchMessages(selectedRoom.chat_room_id); // Refresh immediately
                fetchRooms(); // Update last message in sidebar
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (!user) {
        return <div className="p-10 text-center">{STRINGS.login_plz}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar cartCount={0} onOpenCart={() => { }} subtitle={STRINGS.title} />

            <div className="flex-1 container mx-auto px-4 pt-20 pb-4 max-w-6xl h-[calc(100vh-64px)]">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden flex h-full border border-gray-200">

                    {/* Sidebar: Chat List */}
                    <div className={`${selectedRoom ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 flex-col border-r border-gray-200`}>
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-bold text-gray-700">{STRINGS.recent_messages}</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <p className="p-4 text-gray-500 text-center">{STRINGS.loading}</p>
                            ) : rooms.length === 0 ? (
                                <p className="p-4 text-gray-500 text-center">{STRINGS.no_messages}</p>
                            ) : (
                                rooms.map(room => (
                                    <div
                                        key={room.chat_room_id}
                                        onClick={() => setSelectedRoom(room)}
                                        className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-blue-50 transition-colors ${selectedRoom?.chat_room_id === room.chat_room_id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-semibold ${room.unread > 0 ? 'text-black font-bold' : 'text-gray-800'}`}>{room.displayName}</span>
                                                {room.unread > 0 && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                                            </div>
                                            {room.last_message_time && (
                                                <span className="text-xs text-gray-400">{new Date(room.last_message_time).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                        <p className={`text-sm truncate ${room.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                            {room.last_message || STRINGS.no_messages_yet}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`${!selectedRoom ? 'hidden md:flex' : 'flex'} w-full md:w-2/3 flex-col bg-slate-50`}>
                        {selectedRoom ? (
                            <>
                                {/* Header */}
                                <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm">
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => setSelectedRoom(null)}
                                            className="md:hidden mr-3 text-gray-500"
                                        >
                                            ←
                                        </button>
                                        <h3 className="font-bold text-gray-800">{selectedRoom.displayName}</h3>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {STRINGS.order} #{selectedRoom.order_id}
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.map((msg) => {
                                        const isMyMsg = msg.sender_id === user.user_id;
                                        const isSystem = msg.message_type === 'SYSTEM';

                                        if (isSystem) {
                                            return (
                                                <div key={msg.message_id} className="flex justify-center my-4">
                                                    <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                                        {msg.content}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={msg.message_id} className={`flex ${isMyMsg ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isMyMsg
                                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                                    }`}>
                                                    <p className="text-sm">{msg.content}</p>
                                                    <p className={`text-[10px] mt-1 text-right ${isMyMsg ? 'text-blue-100' : 'text-gray-400'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder={STRINGS.type_message}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="bg-blue-600 text-white rounded-full px-6 py-2 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {STRINGS.send}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <span className="text-5xl mb-4">💬</span>
                                <p>{STRINGS.select_chat}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
