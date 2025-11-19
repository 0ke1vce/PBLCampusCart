import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Headphones, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import CreateTicketForm from './CreateTicketForm';
import TicketList from './TicketList';

export default function SupportChat({ onClose }) {
  const { apiCall, showNotification, currentUser } = useApp();
  const [view, setView] = useState('list'); // list, create, chat
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages();
      // Poll for new messages every 5 seconds
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedTicket]);

  const loadMessages = async () => {
    if (!selectedTicket) return;
    
    try {
      const data = await apiCall(`/support/tickets/${selectedTicket.ticket_id}/messages`);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    setLoading(true);
    try {
      await apiCall(`/support/tickets/${selectedTicket.ticket_id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message_text: newMessage })
      });

      setNewMessage('');
      await loadMessages();
    } catch (error) {
      showNotification('Failed to send message', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketCreated = (ticket) => {
    setSelectedTicket(ticket);
    setView('chat');
  };

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setView('chat');
  };

  const handleBackToList = () => {
    setSelectedTicket(null);
    setView('list');
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
      assigned: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Headphones },
      in_progress: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Headphones },
      escalated: { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertCircle },
      resolved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      closed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle }
    };
    return badges[status] || badges.open;
  };

  const getSenderIcon = (senderType) => {
    switch (senderType) {
      case 'ai_bot':
        return <Bot size={20} className="text-purple-600" />;
      case 'support_agent':
      case 'senior_support':
        return <Headphones size={20} className="text-blue-600" />;
      default:
        return <User size={20} className="text-gray-600" />;
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}></div>

      {/* Chat Window */}
      <div className="fixed right-6 bottom-6 w-full max-w-2xl h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Support Center</h3>
            <p className="text-sm opacity-90">
              {view === 'chat' && selectedTicket ? `Ticket #${selectedTicket.ticket_id}` : 'How can we help you?'}
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {view === 'list' && (
            <TicketList onSelectTicket={handleSelectTicket} onCreateNew={() => setView('create')} />
          )}

          {view === 'create' && (
            <CreateTicketForm onTicketCreated={handleTicketCreated} onCancel={handleBackToList} />
          )}

          {view === 'chat' && selectedTicket && (
            <div className="h-full flex flex-col">
              {/* Ticket Info Bar */}
              <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                <div>
                  <button onClick={handleBackToList} className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-1">
                    ← Back to Tickets
                  </button>
                  <h4 className="font-semibold">{selectedTicket.subject}</h4>
                  <p className="text-sm text-gray-600">{selectedTicket.ticket_type.replace('_', ' ')}</p>
                </div>
                <div>
                  {(() => {
                    const badge = getStatusBadge(selectedTicket.status);
                    const Icon = badge.icon;
                    return (
                      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2`}>
                        <Icon size={16} />
                        {selectedTicket.status}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isCustomer = message.sender_type === 'customer';
                  const isAI = message.sender_type === 'ai_bot';
                  
                  return (
                    <div key={message.message_id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isCustomer ? 'bg-blue-600 text-white' : isAI ? 'bg-purple-50 border border-purple-200' : 'bg-gray-100'} rounded-2xl p-4 shadow-sm`}>
                        <div className="flex items-center gap-2 mb-2">
                          {getSenderIcon(message.sender_type)}
                          <span className="text-xs font-semibold">
                            {isCustomer ? 'You' : isAI ? 'AI Assistant' : message.sender_name || 'Support Agent'}
                          </span>
                        </div>
                        <p className={`${isCustomer ? 'text-white' : 'text-gray-800'} text-sm`}>{message.message_text}</p>
                        <p className={`text-xs mt-2 ${isCustomer ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {isAI && message.ai_confidence_score && (
                          <div className="mt-2 text-xs text-purple-600">
                            Confidence: {(message.ai_confidence_score * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !newMessage.trim()}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </form>
              )}

              {selectedTicket.status === 'resolved' && (
                <div className="p-4 bg-green-50 border-t border-green-200">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle size={20} />
                    <span className="font-semibold">This ticket has been resolved</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">If you need further assistance, please create a new ticket.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}