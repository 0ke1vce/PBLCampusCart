import React, { useState, useEffect } from 'react';
import { Plus, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TicketList({ onSelectTicket, onCreateNew }) {
  const { apiCall, showNotification } = useApp();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/support/tickets/my-tickets');
      setTickets(data.tickets || []);
    } catch (error) {
      showNotification('Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'text-yellow-600 bg-yellow-50',
      assigned: 'text-blue-600 bg-blue-50',
      in_progress: 'text-purple-600 bg-purple-50',
      escalated: 'text-orange-600 bg-orange-50',
      resolved: 'text-green-600 bg-green-50',
      closed: 'text-gray-600 bg-gray-50'
    };
    return colors[status] || colors.open;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <button
          onClick={onCreateNew}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Create New Ticket
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Tickets Yet</h3>
            <p className="text-gray-600">Create a ticket to get support</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <button
                key={ticket.ticket_id}
                onClick={() => onSelectTicket(ticket)}
                className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">#{ticket.ticket_id} - {ticket.subject}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{ticket.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                  {ticket.restaurant_name && (
                    <span>🏪 {ticket.restaurant_name}</span>
                  )}
                  {ticket.assigned_agent_name && (
                    <span>👤 {ticket.assigned_agent_name}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}