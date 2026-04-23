import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getDocuments, uploadDocument, deleteDocument } from '../../services/student';
import { getStudentApplications } from '../../services/student';
import Alert from '../common/Alert';
import Loader from '../common/Loader';

const StudentDocuments = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const applicationId = queryParams.get('applicationId');

  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('mark_sheet');

  useEffect(() => {
    if (!applicationId) {
      fetchApplications();
    } else {
      fetchDocuments();
    }
  }, [applicationId]);

  const fetchApplications = async () => {
    try {
      const response = await getStudentApplications();
      setApplications(response.data);
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await getDocuments(applicationId);
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('application_id', applicationId);
    formData.append('document_type', documentType);
    try {
      await uploadDocument(formData);
      setSuccess('Document uploaded successfully');
      setSelectedFile(null);
      fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(docId);
      setSuccess('Document deleted');
      fetchDocuments();
    } catch (err) {
      setError('Delete failed');
    }
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {applicationId ? 'Documents for Application' : 'Select an Application'}
      </h1>
      
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}

      {!applicationId ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
          {applications.length === 0 ? (
            <p className="text-gray-600">No applications found.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app._id} className="border p-4 rounded flex justify-between items-center">
                  <div>
                    <p className="font-medium">{app.course_name}</p>
                    <p className="text-sm text-gray-600">{app.college_name}</p>
                    <p className="text-xs text-gray-500">Status: {app.status}</p>
                  </div>
                  <Link
                    to={`/student/documents?applicationId=${app._id}`}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    View Documents
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
            <form onSubmit={handleUpload} encType="multipart/form-data">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mark_sheet">Mark Sheet</option>
                  <option value="id_proof">ID Proof</option>
                  <option value="photo">Photo</option>
                  <option value="signature">Signature</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full"
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? <Loader size="sm" color="white" /> : 'Upload'}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Uploaded Documents</h2>
            {documents.length === 0 ? (
              <p className="text-gray-600">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc._id} className="flex justify-between items-center p-4 border rounded">
                    <div>
                      <p className="font-medium">{doc.document_type.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        Status:{' '}
                        <span className={`font-medium ${
                          doc.verification_status === 'verified' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {doc.verification_status}
                        </span>
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Link
                to="/student/applications"
                className="text-blue-600 hover:underline"
              >
                ← Back to Applications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDocuments;