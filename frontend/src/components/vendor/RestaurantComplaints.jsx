import React, { useState, useEffect } from 'react';
import { AlertTriangle, FileText, Star, Clock, CheckCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function RestaurantComplaints() {
  const { apiCall, showNotification, currentUser } = useApp();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    // Only attempt to load complaints for vendor users
    if (!currentUser || currentUser.user_type !== 'vendor') {
      setLoading(false);
      return;
    }

    loadComplaints();
  }, [currentUser]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/support/complaints/restaurant');
      setComplaints(data.complaints || []);
    } catch (error) {
      // If unauthorized, show a clear message in UI instead of noisy notification
      if (error && error.message && /permission|authorized|401|403/i.test(error.message)) {
        showNotification('You are not authorized to view complaints for restaurants', 'error');
      } else {
        showNotification('Failed to load complaints', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      escalated: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.open;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return badges[priority] || badges.medium;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="text-orange-600" size={28} />
          Customer Complaints & Feedback
        </h2>
        <p className="text-gray-600 mt-1">
          View complaints and support team notes about your restaurant (Read-only)
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <AlertTriangle className="text-blue-600 flex-shrink-0" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">📌 Information Dashboard (Read-Only)</p>
            <p>This dashboard shows complaints logged against your restaurant. You cannot directly interact with customers here. 
            The support team handles all customer communication. Use this information to improve service quality.</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-gray-900">{complaints.length}</div>
          <div className="text-sm text-gray-600">Total Complaints</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-orange-600">
            {complaints.filter(c => ['open', 'in_progress'].includes(c.resolution_status)).length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">
            {complaints.filter(c => c.resolution_status === 'resolved').length}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {complaints.length > 0 
              ? (complaints.reduce((acc, c) => acc + (c.customer_rating || 0), 0) / complaints.filter(c => c.customer_rating).length).toFixed(1)
              : 'N/A'
            }
          </div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>
      </div>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Complaints!</h3>
          <p className="text-gray-600">Great job! No customer complaints recorded.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div key={complaint.complaint_id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">#{complaint.ticket_id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(complaint.priority)}`}>
                        {complaint.priority?.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.resolution_status)}`}>
                        {complaint.resolution_status}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">{complaint.complaint_type.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  
                  {complaint.customer_rating && (
                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-lg">
                      <Star size={18} fill="currentColor" className="text-yellow-500" />
                      <span className="font-bold text-yellow-700">{complaint.customer_rating}/5</span>
                    </div>
                  )}
                </div>

                {/* Complaint Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Customer Complaint:</p>
                  <p className="text-gray-800">{complaint.complaint_summary}</p>
                </div>

                {/* Support Notes */}
                {complaint.support_notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <FileText size={16} />
                      Support Team Notes:
                    </p>
                    <p className="text-blue-800 text-sm">{complaint.support_notes}</p>
                  </div>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>Created: {new Date(complaint.created_at).toLocaleDateString()}</span>
                  </div>
                  {complaint.order_id && (
                    <div>
                      <span className="font-semibold">Order:</span> #{complaint.order_id}
                    </div>
                  )}
                  {complaint.resolved_at && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={14} />
                      <span>Resolved: {new Date(complaint.resolved_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedComplaint(complaint)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View Full Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedComplaint && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setSelectedComplaint(null)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Complaint Details</h2>
                  <p className="text-gray-600">Ticket #{selectedComplaint.ticket_id}</p>
                </div>
                <button onClick={() => setSelectedComplaint(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Type</p>
                  <p className="text-lg">{selectedComplaint.complaint_type.replace('_', ' ')}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedComplaint.resolution_status)}`}>
                    {selectedComplaint.resolution_status}
                  </span>
                </div>

                {selectedComplaint.customer_rating && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Customer Rating</p>
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          fill={i < selectedComplaint.customer_rating ? 'currentColor' : 'none'}
                          className={i < selectedComplaint.customer_rating ? 'text-yellow-500' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Complaint Summary</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p>{selectedComplaint.complaint_summary}</p>
                  </div>
                </div>

                {selectedComplaint.support_notes && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Support Team Notes</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800">{selectedComplaint.support_notes}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Created</p>
                    <p>{new Date(selectedComplaint.created_at).toLocaleString()}</p>
                  </div>
                  {selectedComplaint.resolved_at && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Resolved</p>
                      <p>{new Date(selectedComplaint.resolved_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}