import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminApplicationDetails, getApplicationDocuments, verifyDocument, rejectDocument } from '../../services/admin';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import RejectModal from '../common/RejectModal';

const ApplicationDetail = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [appRes, docsRes] = await Promise.all([
        getAdminApplicationDetails(appId),
        getApplicationDocuments(appId)
      ]);
      setApplication(appRes.data);
      setDocuments(docsRes.data);
    } catch (err) {
      setError('Failed to load application details');
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVerify = async (docId) => {
    try {
      await verifyDocument(docId);
      setSuccess('Document verified');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    }
  };

  const handleReject = async (reason) => {
    try {
      await rejectDocument(selectedDocId, reason);
      setSuccess('Document rejected');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Rejection failed');
    }
  };

  const openRejectModal = (docId) => {
    setSelectedDocId(docId);
    setRejectModalOpen(true);
  };

  if (loading) return <Loader size="lg" />;
  if (error) return <Alert type="error" message={error} onClose={() => setError('')} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">
        ← Back
      </button>
      <h1 className="text-3xl font-bold mb-6">Application Details</h1>
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Student Information</h2>
        <p><span className="font-medium">Name:</span> {application?.student_name}</p>
        <p><span className="font-medium">Email:</span> {application?.student_email}</p>
        <p><span className="font-medium">Mobile:</span> {application?.student_mobile}</p>
        <p><span className="font-medium">Course:</span> {application?.course_name}</p>
        <p><span className="font-medium">College:</span> {application?.college_name}</p>
        <p><span className="font-medium">Status:</span> {application?.status}</p>
      </div>

      <h2 className="text-2xl font-bold mb-4">Uploaded Documents</h2>
      {documents.length === 0 ? (
        <p className="text-gray-600">No documents uploaded.</p>
      ) : (
        <div className="space-y-4">
          {documents.map(doc => (
            <div key={doc._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
              <div className="flex-1">
                <p className="font-medium">{doc.document_type.replace(/_/g, ' ').toUpperCase()}</p>
                <p className="text-sm text-gray-500">Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                <p className="text-sm">
                  Status: <span className={`font-medium ${
                    doc.verification_status === 'verified' ? 'text-green-600' :
                    doc.verification_status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {doc.verification_status}
                  </span>
                </p>
                {doc.rejection_reason && (
                  <p className="text-sm text-red-600 mt-1">Reason: {doc.rejection_reason}</p>
                )}
              </div>
              <div className="flex space-x-3">
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  View
                </a>
                {doc.verification_status !== 'verified' && (
                  <>
                    <button
                      onClick={() => handleVerify(doc._id)}
                      className="text-green-600 hover:underline"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => openRejectModal(doc._id)}
                      className="text-red-600 hover:underline"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleReject}
      />
    </div>
  );
};

export default ApplicationDetail;