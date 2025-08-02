import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Search, Phone, Video, MoreVertical, Smile, Paperclip, User, Clock, CheckCheck } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'teacher' | 'parent';
  timestamp: string;
  read: boolean;
}

interface Chat {
  id: number;
  teacherName: string;
  parentName: string;
  studentName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  isOnline?: boolean;
}

interface CommunicationSectionProps {
  userRole: string;
  userName: string;
}

const CommunicationSection: React.FC<CommunicationSectionProps> = ({ userRole, userName }) => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Demo data with Indian names
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 1,
      teacherName: 'Priya Sharma',
      parentName: 'Rajesh Kumar',
      studentName: 'Arjun Kumar',
      lastMessage: 'Thank you for the update on Arjun\'s progress in Mathematics.',
      lastMessageTime: '10:30 AM',
      unreadCount: 2,
      isOnline: true,
      messages: [
        {
          id: 1,
          text: 'Good morning! I wanted to discuss Arjun\'s performance in Mathematics.',
          sender: 'teacher',
          timestamp: '9:15 AM',
          read: true
        },
        {
          id: 2,
          text: 'Good morning, Priya ma\'am. Yes, please let me know how he\'s doing.',
          sender: 'parent',
          timestamp: '9:20 AM',
          read: true
        },
        {
          id: 3,
          text: 'Arjun has shown excellent improvement in algebra. His problem-solving skills have really developed well this term.',
          sender: 'teacher',
          timestamp: '9:25 AM',
          read: true
        },
        {
          id: 4,
          text: 'That\'s wonderful to hear! We\'ve been practicing at home as you suggested.',
          sender: 'parent',
          timestamp: '9:28 AM',
          read: true
        },
        {
          id: 5,
          text: 'Thank you for the update on Arjun\'s progress in Mathematics.',
          sender: 'parent',
          timestamp: '10:30 AM',
          read: false
        }
      ]
    },
    {
      id: 2,
      teacherName: 'Anita Verma',
      parentName: 'Sunita Patel',
      studentName: 'Kavya Patel',
      lastMessage: 'Please send the science project guidelines.',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      isOnline: false,
      messages: [
        {
          id: 1,
          text: 'Hello! Kavya mentioned there\'s a science project coming up.',
          sender: 'parent',
          timestamp: 'Yesterday 2:15 PM',
          read: true
        },
        {
          id: 2,
          text: 'Yes, it\'s on renewable energy sources. I\'ll send the detailed guidelines shortly.',
          sender: 'teacher',
          timestamp: 'Yesterday 2:20 PM',
          read: true
        },
        {
          id: 3,
          text: 'Please send the science project guidelines.',
          sender: 'parent',
          timestamp: 'Yesterday 4:30 PM',
          read: true
        }
      ]
    },
    {
      id: 3,
      teacherName: 'Vikram Singh',
      parentName: 'Meera Gupta',
      studentName: 'Rohan Gupta',
      lastMessage: 'Rohan did excellent in today\'s English presentation!',
      lastMessageTime: '2 days ago',
      unreadCount: 1,
      isOnline: true,
      messages: [
        {
          id: 1,
          text: 'Rohan did excellent in today\'s English presentation!',
          sender: 'teacher',
          timestamp: '2 days ago 11:45 AM',
          read: false
        }
      ]
    },
    {
      id: 4,
      teacherName: 'Deepika Rao',
      parentName: 'Amit Joshi',
      studentName: 'Isha Joshi',
      lastMessage: 'Thank you for arranging the extra art supplies.',
      lastMessageTime: '3 days ago',
      unreadCount: 0,
      isOnline: false,
      messages: [
        {
          id: 1,
          text: 'Isha is very creative in art class. Could you provide some extra art supplies for her projects?',
          sender: 'teacher',
          timestamp: '4 days ago 1:20 PM',
          read: true
        },
        {
          id: 2,
          text: 'Of course! I\'ll send them with her tomorrow.',
          sender: 'parent',
          timestamp: '4 days ago 1:25 PM',
          read: true
        },
        {
          id: 3,
          text: 'Thank you for arranging the extra art supplies.',
          sender: 'teacher',
          timestamp: '3 days ago 10:15 AM',
          read: true
        }
      ]
    },
    {
      id: 5,
      teacherName: 'Ravi Menon',
      parentName: 'Lakshmi Nair',
      studentName: 'Aditya Nair',
      lastMessage: 'Can we schedule a parent-teacher meeting?',
      lastMessageTime: '1 week ago',
      unreadCount: 0,
      isOnline: true,
      messages: [
        {
          id: 1,
          text: 'Can we schedule a parent-teacher meeting?',
          sender: 'parent',
          timestamp: '1 week ago 3:00 PM',
          read: true
        }
      ]
    }
  ]);

  const emojis = ['😊', '👍', '❤️', '😂', '🎉', '👏', '🙏', '💯'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (newMessage.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [newMessage]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: selectedChat.messages.length + 1,
      text: newMessage,
      sender: userRole as 'teacher' | 'parent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    const updatedChats = chats.map(chat => {
      if (chat.id === selectedChat.id) {
        return {
          ...chat,
          messages: [...chat.messages, message],
          lastMessage: newMessage,
          lastMessageTime: 'now'
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, message],
      lastMessage: newMessage,
      lastMessageTime: 'now'
    });
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const filteredChats = chats.filter(chat => {
    const searchLower = searchTerm.toLowerCase();
    return (
      chat.teacherName.toLowerCase().includes(searchLower) ||
      chat.parentName.toLowerCase().includes(searchLower) ||
      chat.studentName.toLowerCase().includes(searchLower)
    );
  });

  const getDisplayName = (chat: Chat) => {
    if (userRole === 'teacher') {
      return `${chat.parentName}`;
    } else {
      return `${chat.teacherName}`;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100" style={{ height: '700px' }}>
      <div className="flex h-full">
        {/* Chat List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gradient-to-b from-gray-50 to-white">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-full">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Messages</h2>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 text-white placeholder-white/70 rounded-xl focus:outline-none focus:bg-white/30 transition-all duration-200 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat, index) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-[1.02] ${
                  selectedChat?.id === chat.id ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-200 shadow-md' : ''
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideInLeft 0.5s ease-out forwards'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                      {getInitials(getDisplayName(chat))}
                    </div>
                    {chat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 truncate text-sm">
                        {getDisplayName(chat)}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{chat.lastMessageTime}</span>
                        {chat.unreadCount > 0 && (
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-medium shadow-lg animate-bounce">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Student: {chat.studentName}</p>
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                        {getInitials(getDisplayName(selectedChat))}
                      </div>
                      {selectedChat.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {getDisplayName(selectedChat)}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center space-x-2">
                        <span>Regarding: {selectedChat.studentName}</span>
                        {selectedChat.isOnline && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">Online</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-3 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 rounded-full transition-all duration-200 transform hover:scale-110">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-3 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 rounded-full transition-all duration-200 transform hover:scale-110">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 transform hover:scale-110">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
                {selectedChat.messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === userRole ? 'justify-end' : 'justify-start'
                    }`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.5s ease-out forwards'
                    }}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 ${
                        message.sender === userRole
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white ml-auto'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p
                          className={`text-xs ${
                            message.sender === userRole ? 'text-indigo-200' : 'text-gray-500'
                          }`}
                        >
                          {message.timestamp}
                        </p>
                        {message.sender === userRole && (
                          <CheckCheck className={`w-4 h-4 ${message.read ? 'text-indigo-200' : 'text-indigo-300'}`} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 px-4 py-3 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <button className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 transform hover:scale-110">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                      <div className="relative">
                        <button 
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          <Smile className="w-5 h-5" />
                        </button>
                        {showEmojiPicker && (
                          <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-3 grid grid-cols-4 gap-2 z-10">
                            {emojis.map((emoji, index) => (
                              <button
                                key={index}
                                onClick={() => addEmoji(emoji)}
                                className="text-xl hover:bg-gray-100 p-2 rounded transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110 shadow-lg"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-white">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-12 h-12 text-indigo-400" />
                </div>
                <p className="text-xl font-semibold mb-2 text-gray-700">Select a conversation</p>
                <p className="text-sm text-gray-500">Choose a chat from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
            @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
            }

            @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
            }
        `}
        </style>

    </div>
  );
};

export default CommunicationSection;