import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import TicketList from './TicketList';

export default function SupportDashboard() {
  const { apiCall, showNotification } = useApp();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const data = await apiCall(`/support/tickets/${ticket.ticket_id}/messages`);
      setMessages(data.messages || []);
    } catch (error) {
      showNotification('Failed to load ticket messages', 'error');
    }
  };

  const handleBack = () => {
    setSelectedTicket(null);
    setMessages([]);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Support Dashboard</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg border overflow-hidden">
          <TicketList onSelectTicket={handleSelectTicket} onCreateNew={() => {}} />
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg border p-6">
          {!selectedTicket ? (
            <div className="text-gray-500">Select a ticket to view messages and respond.</div>
          ) : (
            <div>
              <div className="mb-4">
                <button onClick={handleBack} className="text-blue-600 hover:underline">← Back to list</button>
                <h3 className="text-xl font-semibold mt-2">#{selectedTicket.ticket_id} - {selectedTicket.subject}</h3>
                <p className="text-sm text-gray-600">{selectedTicket.ticket_type}</p>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {messages.map((m) => (
                  <div key={m.message_id} className="p-3 rounded-lg bg-gray-50 border">
                    <div className="text-sm text-gray-700 mb-1 font-semibold">{m.sender_name || m.sender_type}</div>
                    <div className="text-gray-800">{m.message_text}</div>
                    <div className="text-xs text-gray-400 mt-2">{new Date(m.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
