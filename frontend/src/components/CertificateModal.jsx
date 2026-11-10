import React from 'react';

const CertificateModal = ({ user, event, onClose }) => {
  if (!user || !event) return null;

  const eventDateStr = new Date(event.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        <div className="certificate-border">
          <div className="cert-header">Certificate of Attendance</div>
          <div className="cert-sub">This is proudly presented to</div>
          
          <div className="cert-name">{user.name}</div>
          
          <div className="cert-body">
            for successfully participating in and completing the college event{' '}
            <span className="cert-event-title">"{event.title}"</span>, representing a{' '}
            <span style={{ textTransform: 'capitalize' }}>{event.category}</span> event organized by{' '}
            <strong>{event.organizer?.name || 'College Host'}</strong> on{' '}
            <strong>{eventDateStr}</strong>.
          </div>

          <div className="cert-footer">
            <div>
              <div className="cert-sig-line">{event.organizer?.name || 'Event Coordinator'}</div>
              <div>Organizer Signature</div>
            </div>
            <div>
              <div className="cert-sig-line">{event.venue}</div>
              <div>Event Location</div>
            </div>
          </div>
        </div>

        <div className="cert-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            Print / Save to PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
