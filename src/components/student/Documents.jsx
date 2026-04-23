import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getStudentProfile, updateStudentProfile, getMyDocuments, getEligibleCourses } from '../../services/student';
import Alert from '../common/Alert';
import Loader from '../common/Loader';

const StudentDocuments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [eligibleCourses, setEligibleCourses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('documents');
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('10th_marksheet');
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '', mobile: '', qualification: '12th', stream: 'science', location: ''
  });

  const documentTypes = [
    { value: '10th_marksheet', label: '10th Marksheet', requiredFor: ['12th', 'diploma', 'graduation'] },
    { value: '12th_marksheet', label: '12th Marksheet', requiredFor: ['btech', 'mbbs', 'bds', 'bsc', 'bca', 'bcom', 'bba'] },
    { value: 'graduation_marksheet', label: 'Graduation Marksheet', requiredFor: ['mba', 'mtech', 'msc'] },
    { value: 'entrance_score', label: 'Entrance Exam Score', requiredFor: ['btech', 'mbbs', 'bds', 'mba', 'mtech'] },
    { value: 'photo', label: 'Passport Photo', requiredFor: ['all'] },
    { value: 'id_proof', label: 'ID Proof (Aadhaar/PAN)', requiredFor: ['all'] },
    { value: 'domicile', label: 'Domicile Certificate', requiredFor: ['btech', 'mbbs', 'bds'] },
    { value: 'caste_certificate', label: 'Caste Certificate', requiredFor: ['btech', 'mbbs'] },
    { value: 'income_certificate', label: 'Income Certificate', requiredFor: ['scholarship'] },
    { value: 'experience_letter', label: 'Experience Letter', requiredFor: ['mba'] },
    { value: 'diploma_certificate', label: 'Diploma Certificate', requiredFor: ['btech_lateral'] },
    { value: 'leaving_certificate', label: 'Leaving Certificate', requiredFor: ['all'] },
    { value: 'migration_certificate', label: 'Migration Certificate', requiredFor: ['graduation'] },
  ];

  const qualifications = [
    { value: '10th', label: '10th Pass', eligibleCourses: ['Diploma in Engineering', 'ITI Courses', '11th/12th'] },
    { value: '12th', label: '12th Pass', eligibleCourses: ['B.Tech', 'MBBS', 'B.Sc', 'BCA', 'B.Com', 'BBA', 'BA'] },
    { value: 'diploma', label: 'Diploma', eligibleCourses: ['B.Tech (Lateral Entry)', 'B.Sc (Lateral Entry)'] },
    { value: 'graduation', label: 'Graduation', eligibleCourses: ['MBA', 'M.Tech', 'M.Sc', 'MA'] },
  ];

  const streams = [
    { value: 'science', label: 'Science (PCM/PCB)', courses: ['B.Tech', 'MBBS', 'B.Sc', 'BCA', 'B.Pharm', 'B.Arch', 'BDS'] },
    { value: 'commerce', label: 'Commerce', courses: ['B.Com', 'BBA', 'BMS', 'BAF', 'BBI', 'BFM'] },
    { value: 'arts', label: 'Arts/Humanities', courses: ['BA', 'BFA', 'B.Voc', 'B.Journalism', 'B.Law'] },
  ];

  const getRecommendedCourses = () => {
    const qual = profileForm.qualification || '12th';
    if (qual === '10th') return ['Diploma in Engineering', 'ITI Courses', 'Certificate Courses', '11th/12th'];
    if (qual === '12th') {
      if (profileForm.stream === 'science') return ['B.Tech', 'MBBS', 'B.Sc', 'BCA', 'B.Pharm', 'B.Arch', 'BDS', 'B.Vet'];
      if (profileForm.stream === 'commerce') return ['B.Com', 'BBA', 'BMS', 'BAF', 'BBI', 'CA Foundation'];
      if (profileForm.stream === 'arts') return ['BA', 'BFA', 'B.Voc', 'B.Journalism', 'B.Law (5yr)'];
    }
    if (qual === 'diploma') return ['B.Tech Lateral Entry', 'B.Sc Lateral Entry', 'Direct 2nd Year'];
    if (qual === 'graduation') return ['MBA', 'M.Tech', 'M.Sc', 'MA', 'M.Com', 'MCA'];
    return [];
  };

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, docsRes] = await Promise.all([
        getStudentProfile(),
        getMyDocuments()
      ]);
      
      setProfile(profileRes.data);
      setDocuments(docsRes.data.documents || []);
      
      // Fetch eligible courses based on qualification
      const qualification = profileRes.data.qualification || '12th';
      const stream = profileRes.data.stream || 'science';
      const coursesRes = await getEligibleCourses(qualification, stream);
      setEligibleCourses(coursesRes.data.courses || []);
      
      setProfileForm({
        name: profileRes.data.name || '',
        email: profileRes.data.email || '',
        mobile: profileRes.data.mobile || '',
        qualification: profileRes.data.qualification || '12th',
        stream: profileRes.data.stream || 'science',
        location: profileRes.data.location || '',
        dob: profileRes.data.dob || '',
        gender: profileRes.data.gender || '',
        father_name: profileRes.data.father_name || '',
        mother_name: profileRes.data.mother_name || '',
        address: profileRes.data.address || '',
        city: profileRes.data.city || '',
        state: profileRes.data.state || '',
        pincode: profileRes.data.pincode || '',
        preferred_course: profileRes.data.preferred_course || '',
        year_of_passing: profileRes.data.year_of_passing || ''
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchEligibleCourses = async (qualification) => {
    try {
      const res = await api.get('/courses/eligible', { params: { qualification } });
      setEligibleCourses(res.data.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateStudentProfile(profileForm);
      await api.put('/students/qualification', {
        qualification: profileForm.qualification,
        stream: profileForm.stream
      });
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      fetchEligibleCourses(profileForm.qualification);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
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
    formData.append('document_type', documentType);
    formData.append('is_profile_document', 'true');
    
    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Document uploaded successfully!');
      setSelectedFile(null);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      setSuccess('Document deleted');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Delete failed');
    }
  };

  const getRequiredDocsForCourses = () => {
    if (profile?.qualification === '12th') {
      if (profile?.stream === 'science') {
        return ['10th_marksheet', '12th_marksheet', 'entrance_score', 'photo', 'id_proof', 'domicile'];
      } else if (profile?.stream === 'commerce') {
        return ['10th_marksheet', '12th_marksheet', 'photo', 'id_proof', 'domicile'];
      }
      return ['10th_marksheet', '12th_marksheet', 'photo', 'id_proof'];
    }
    return ['10th_marksheet', 'photo', 'id_proof'];
  };

  const docsMap = documents.reduce((acc, doc) => {
    acc[doc.document_type] = doc;
    return acc;
  }, {});

  const requiredDocs = getRequiredDocsForCourses();

  if (loading) return <Loader size="lg" />;

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Documents & Admissions</h1>
          <p style={styles.headerSubtitle}>Upload documents once, apply to multiple courses</p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.qualificationBadge}>
            <span style={styles.qualificationLabel}>Qualification:</span>
            <span style={styles.qualificationValue}>
              {qualifications.find(q => q.value === profile?.qualification)?.label || '12th'}
              {profile?.qualification === '12th' && ` - ${streams.find(s => s.value === profile?.stream)?.label}`}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'documents' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('documents')}
        >
          📄 My Documents
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'required' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('required')}
        >
          📋 Required Documents
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'courses' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('courses')}
        >
          🎓 Eligible Courses
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'profile' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
      </div>

      <div style={styles.content}>
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* My Documents Tab */}
        {activeTab === 'documents' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>My Documents</h2>
              <p style={styles.sectionSubtitle}>These documents are saved to your profile and reused for all applications</p>
            </div>

            {/* Upload Form */}
            <div style={styles.uploadCard}>
              <h3 style={styles.uploadTitle}>Upload New Document</h3>
              <form onSubmit={handleUpload} style={styles.uploadForm}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Document Type</label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      style={styles.formSelect}
                    >
                      {documentTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Select File</label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={styles.formFile}
                    />
                  </div>
                </div>
                <button type="submit" disabled={uploading || !selectedFile} style={styles.uploadBtn}>
                  {uploading ? 'Uploading...' : '📤 Upload Document'}
                </button>
              </form>
            </div>

            {/* Uploaded Documents */}
            <div style={styles.documentsGrid}>
              {documents.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📄</div>
                  <h3>No documents uploaded</h3>
                  <p>Upload your documents above to use them for course applications</p>
                </div>
              ) : (
                documents.map(doc => (
                  <div key={doc._id} style={styles.documentCard}>
                    <div style={styles.documentIcon}>
                      {doc.document_type.includes('photo') ? '📷' : '📄'}
                    </div>
                    <div style={styles.documentInfo}>
                      <h4 style={styles.documentName}>
                        {documentTypes.find(t => t.value === doc.document_type)?.label || doc.document_type}
                      </h4>
                      <p style={styles.documentDate}>
                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                      <span style={{
                        ...styles.documentStatus,
                        background: doc.verification_status === 'verified' ? '#DCFCE7' : 
                                   doc.verification_status === 'rejected' ? '#FEE2E2' : '#FEF3C7',
                        color: doc.verification_status === 'verified' ? '#166534' :
                               doc.verification_status === 'rejected' ? '#DC2626' : '#92400E'
                      }}>
                        {doc.verification_status || 'pending'}
                      </span>
                    </div>
                    <div style={styles.documentActions}>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" style={styles.viewBtn}>
                        View
                      </a>
                      <button onClick={() => handleDelete(doc._id)} style={styles.deleteBtn}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Required Documents Tab */}
        {activeTab === 'required' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Documents Required for Your Courses</h2>
              <p style={styles.sectionSubtitle}>
                Based on your qualification ({qualifications.find(q => q.value === profile?.qualification)?.label})
                {profile?.qualification === '12th' && ` - ${streams.find(s => s.value === profile?.stream)?.label}`}
              </p>
            </div>

            <div style={styles.requiredDocsGrid}>
              {requiredDocs.map(docType => {
                const doc = docsMap[docType];
                const docInfo = documentTypes.find(d => d.value === docType);
                return (
                  <div key={docType} style={{
                    ...styles.requiredDocCard,
                    borderColor: doc ? '#10B981' : '#E5E7EB',
                    background: doc ? '#F0FDF4' : '#FFFFFF'
                  }}>
                    <div style={styles.requiredDocHeader}>
                      <span style={styles.requiredDocIcon}>{doc ? '✅' : '⬜'}</span>
                      <h4 style={styles.requiredDocName}>{docInfo?.label || docType}</h4>
                    </div>
                    <p style={styles.requiredDocStatus}>
                      {doc ? 'Uploaded' : 'Not uploaded'}
                    </p>
                    {!doc && (
                      <button 
                        onClick={() => { setDocumentType(docType); setActiveTab('documents'); }}
                        style={styles.uploadRequiredBtn}
                      >
                        Upload Now
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={styles.documentsChecklist}>
              <h3 style={styles.checklistTitle}>📝 Application Checklist</h3>
              <ul style={styles.checklist}>
                <li style={{ ...styles.checklistItem, color: docsMap['10th_marksheet'] ? '#10B981' : '#EF4444' }}>
                  {docsMap['10th_marksheet'] ? '✅' : '❌'} 10th Marksheet
                </li>
                <li style={{ ...styles.checklistItem, color: docsMap['12th_marksheet'] ? '#10B981' : '#EF4444' }}>
                  {docsMap['12th_marksheet'] ? '✅' : '❌'} 12th Marksheet
                </li>
                {profile?.qualification === '12th' && profile?.stream === 'science' && (
                  <li style={{ ...styles.checklistItem, color: docsMap['entrance_score'] ? '#10B981' : '#EF4444' }}>
                    {docsMap['entrance_score'] ? '✅' : '❌'} Entrance Exam Score (JEE/NEET)
                  </li>
                )}
                <li style={{ ...styles.checklistItem, color: docsMap['photo'] ? '#10B981' : '#EF4444' }}>
                  {docsMap['photo'] ? '✅' : '❌'} Passport Size Photo
                </li>
                <li style={{ ...styles.checklistItem, color: docsMap['id_proof'] ? '#10B981' : '#EF4444' }}>
                  {docsMap['id_proof'] ? '✅' : '❌'} ID Proof (Aadhaar/PAN)
                </li>
                <li style={{ ...styles.checklistItem, color: docsMap['domicile'] ? '#10B981' : '#EF4444' }}>
                  {docsMap['domicile'] ? '✅' : '❌'} Domicile Certificate
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Eligible Courses Tab */}
        {activeTab === 'courses' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Eligible Courses for You</h2>
              <p style={styles.sectionSubtitle}>
                Based on your qualification, you can apply for these courses
              </p>
            </div>

            <div style={styles.coursesGrid}>
              {eligibleCourses.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🎓</div>
                  <h3>No courses available</h3>
                  <p>Update your qualification in the Profile tab</p>
                </div>
              ) : (
                eligibleCourses.map(course => (
                  <div key={course._id} style={styles.courseCard}>
                    <div style={styles.courseBadge}>
                      {qualifications.find(q => q.value === course.required_qualification)?.label}
                    </div>
                    <h3 style={styles.courseName}>{course.course_name}</h3>
                    <p style={styles.courseCollege}>{course.college_name}</p>
                    <div style={styles.courseMeta}>
                      <span>💰 ₹{course.fees?.toLocaleString()}</span>
                      <span>🎓 {course.available_seats} seats</span>
                    </div>
                    <div style={styles.courseEligibility}>
                      <strong>Eligibility:</strong> {course.eligibility}
                    </div>
                    <button 
                      onClick={() => navigate(`/apply?courseId=${course._id}`)}
                      style={styles.applyCourseBtn}
                    >
                      Apply Now
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Your Profile</h2>
              <p style={styles.sectionSubtitle}>Update your qualification to see relevant courses</p>
              {!editMode && (
                <button onClick={() => setEditMode(true)} style={styles.editProfileBtn}>
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleProfileUpdate} style={styles.profileForm}>
                <div style={styles.profileFormHeader}>
                  <div style={styles.profileAvatarEdit}>
                    <span style={styles.avatarInitial}>{profileForm.name?.[0]?.toUpperCase() || 'S'}</span>
                  </div>
                  <div>
                    <p style={styles.avatarHint}>Profile photo can be uploaded after account creation</p>
                  </div>
                </div>
                
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Full Name *</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      style={styles.formInput}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      style={{...styles.formInput, backgroundColor: '#F3F4F6'}}
                      disabled
                    />
                    <span style={styles.fieldHint}>Email cannot be changed</span>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Mobile *</label>
                    <input
                      type="tel"
                      value={profileForm.mobile}
                      onChange={(e) => setProfileForm({...profileForm, mobile: e.target.value})}
                      style={styles.formInput}
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Date of Birth</label>
                    <input
                      type="date"
                      value={profileForm.dob || ''}
                      onChange={(e) => setProfileForm({...profileForm, dob: e.target.value})}
                      style={styles.formInput}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Gender</label>
                    <select
                      value={profileForm.gender || ''}
                      onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                      style={styles.formSelect}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Father's Name</label>
                    <input
                      type="text"
                      value={profileForm.father_name || ''}
                      onChange={(e) => setProfileForm({...profileForm, father_name: e.target.value})}
                      style={styles.formInput}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Mother's Name</label>
                    <input
                      type="text"
                      value={profileForm.mother_name || ''}
                      onChange={(e) => setProfileForm({...profileForm, mother_name: e.target.value})}
                      style={styles.formInput}
                    />
                  </div>
                </div>

                <div style={styles.formSectionTitle}>Education Details</div>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Highest Qualification *</label>
                    <select
                      value={profileForm.qualification}
                      onChange={(e) => {
                        setProfileForm({...profileForm, qualification: e.target.value, stream: e.target.value === '12th' ? 'science' : ''});
                        fetchEligibleCourses(e.target.value);
                      }}
                      style={styles.formSelect}
                      required
                    >
                      {qualifications.map(q => (
                        <option key={q.value} value={q.value}>{q.label}</option>
                      ))}
                    </select>
                  </div>
                  {profileForm.qualification === '12th' && (
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Stream *</label>
                      <select
                        value={profileForm.stream}
                        onChange={(e) => setProfileForm({...profileForm, stream: e.target.value})}
                        style={styles.formSelect}
                        required
                      >
                        {streams.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Preferred Course</label>
                    <input
                      type="text"
                      value={profileForm.preferred_course || ''}
                      onChange={(e) => setProfileForm({...profileForm, preferred_course: e.target.value})}
                      style={styles.formInput}
                      placeholder="e.g., B.Tech in Computer Science"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Year of Passing</label>
                    <select
                      value={profileForm.year_of_passing || ''}
                      onChange={(e) => setProfileForm({...profileForm, year_of_passing: e.target.value})}
                      style={styles.formSelect}
                    >
                      <option value="">Select Year</option>
                      {[2024, 2023, 2022, 2021, 2020, 2019, 2018].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={styles.formSectionTitle}>Contact Details</div>
                <div style={styles.formGrid}>
                  <div style={{...styles.formGroup, gridColumn: 'span 2'}}>
                    <label style={styles.formLabel}>Address</label>
                    <textarea
                      value={profileForm.address || ''}
                      onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                      style={{...styles.formInput, minHeight: '80px', resize: 'vertical'}}
                      placeholder="Enter your full address"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>City</label>
                    <input
                      type="text"
                      value={profileForm.city || ''}
                      onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                      style={styles.formInput}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>State</label>
                    <input
                      type="text"
                      value={profileForm.state || ''}
                      onChange={(e) => setProfileForm({...profileForm, state: e.target.value})}
                      style={styles.formInput}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Pincode</label>
                    <input
                      type="text"
                      value={profileForm.pincode || ''}
                      onChange={(e) => setProfileForm({...profileForm, pincode: e.target.value})}
                      style={styles.formInput}
                      pattern="[0-9]{6}"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Location</label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                      style={styles.formInput}
                      placeholder="e.g., Mumbai, Pune, Delhi"
                    />
                  </div>
                </div>

                {(profileForm.qualification === '12th' || profileForm.preferred_course) && (
                  <div style={styles.streamCourses}>
                    <h4 style={styles.streamCoursesTitle}>
                      <span>📚</span> Recommended courses for {qualifications.find(q => q.value === profileForm.qualification)?.label}
                      {profileForm.qualification === '12th' && ` - ${streams.find(s => s.value === profileForm.stream)?.label}`}
                    </h4>
                    <div style={styles.streamCoursesList}>
                      {getRecommendedCourses().map(course => (
                        <span key={course} style={styles.streamCourseTag}>{course}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={styles.formActions}>
                  <button type="button" onClick={() => {
                    setEditMode(false);
                    setProfileForm({
                      name: profile?.name || '',
                      email: profile?.email || '',
                      mobile: profile?.mobile || '',
                      qualification: profile?.qualification || '12th',
                      stream: profile?.stream || 'science',
                      location: profile?.location || '',
                      dob: profile?.dob || '',
                      gender: profile?.gender || '',
                      father_name: profile?.father_name || '',
                      mother_name: profile?.mother_name || '',
                      address: profile?.address || '',
                      city: profile?.city || '',
                      state: profile?.state || '',
                      pincode: profile?.pincode || '',
                      preferred_course: profile?.preferred_course || '',
                      year_of_passing: profile?.year_of_passing || ''
                    });
                  }} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} style={styles.saveBtn}>
                    {loading ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div style={styles.profileHeader}>
                  <div style={styles.profileAvatar}>
                    <span style={styles.avatarInitial}>{profile?.name?.[0]?.toUpperCase() || 'S'}</span>
                  </div>
                  <div style={styles.profileHeaderInfo}>
                    <h3 style={styles.profileName}>{profile?.name}</h3>
                    <p style={styles.profileEmail}>{profile?.email}</p>
                    <span style={styles.qualificationBadge}>
                      {qualifications.find(q => q.value === profile?.qualification)?.label}
                      {profile?.qualification === '12th' && ` - ${streams.find(s => s.value === profile?.stream)?.label}`}
                    </span>
                  </div>
                </div>

                <div style={styles.profileStats}>
                  <div style={styles.profileStat}>
                    <span style={styles.statValue}>{documents.length}</span>
                    <span style={styles.statLabel}>Documents</span>
                  </div>
                  <div style={styles.profileStat}>
                    <span style={styles.statValue}>{eligibleCourses.length}</span>
                    <span style={styles.statLabel}>Eligible Courses</span>
                  </div>
                  <div style={styles.profileStat}>
                    <span style={styles.statValue}>0</span>
                    <span style={styles.statLabel}>Applications</span>
                  </div>
                </div>

                <div style={styles.profileCard}>
                  <h4 style={styles.profileCardTitle}>Personal Information</h4>
                  <div style={styles.profileGrid}>
                    <div style={styles.profileGridItem}>
                      <span style={styles.profileLabel}>Mobile</span>
                      <span style={styles.profileValue}>{profile?.mobile || 'Not provided'}</span>
                    </div>
                    <div style={styles.profileGridItem}>
                      <span style={styles.profileLabel}>Date of Birth</span>
                      <span style={styles.profileValue}>{profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided'}</span>
                    </div>
                    <div style={styles.profileGridItem}>
                      <span style={styles.profileLabel}>Gender</span>
                      <span style={styles.profileValue}>{profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Not provided'}</span>
                    </div>
                    <div style={styles.profileGridItem}>
                      <span style={styles.profileLabel}>Father's Name</span>
                      <span style={styles.profileValue}>{profile?.father_name || 'Not provided'}</span>
                    </div>
                    <div style={styles.profileGridItem}>
                      <span style={styles.profileLabel}>Mother's Name</span>
                      <span style={styles.profileValue}>{profile?.mother_name || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div style={styles.profileCard}>
                  <h4 style={styles.profileCardTitle}>Education Details</h4>
                  <div style={styles.profileGrid}>
                    <div style={styles.profileGridItem}>
                      <span style={styles.profileLabel}>Qualification</span>
                      <span style={styles.profileValue}>
                        {qualifications.find(q => q.value === profile?.qualification)?.label}
                        {profile?.qualification === '12th' && ` - ${streams.find(s => s.value === profile?.stream)?.label}`}
                      </span>
                    </div>
                    <div style={styles.profileGridItem}>
                      <span style={styles.profileLabel}>Preferred Course</span>
                      <span style={styles.profileValue}>{profile?.preferred_course || 'Not specified'}</span>
                    </div>
                    <div style={styles.profileGridItem}>
                      <span style={styles.profileLabel}>Year of Passing</span>
                      <span style={styles.profileValue}>{profile?.year_of_passing || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div style={styles.profileCard}>
                  <h4 style={styles.profileCardTitle}>Address & Location</h4>
                  <div style={styles.profileGrid}>
                    <div style={{...styles.profileGridItem, gridColumn: 'span 2'}}>
                      <span style={styles.profileLabel}>Address</span>
                      <span style={styles.profileValue}>{profile?.address || 'Not provided'}</span>
                    </div>
                    <div style={styles.profileGridItem}>
                      <span style={styles.profileLabel}>City</span>
                      <span style={styles.profileValue}>{profile?.city || 'Not provided'}</span>
                    </div>
                    <div style={styles.profileGridItem}>
                      <span style={styles.profileLabel}>State</span>
                      <span style={styles.profileValue}>{profile?.state || 'Not provided'}</span>
                    </div>
                    <div style={styles.profileGridItem}>
                      <span style={styles.profileLabel}>Pincode</span>
                      <span style={styles.profileValue}>{profile?.pincode || 'Not provided'}</span>
                    </div>
                    <div style={styles.profileGridItem}>
                      <span style={styles.profileLabel}>Location</span>
                      <span style={styles.profileValue}>{profile?.location || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {profile?.qualification && (
                  <div style={styles.profileCard}>
                    <h4 style={styles.profileCardTitle}>Recommended Courses</h4>
                    <div style={styles.recommendedCourses}>
                      {getRecommendedCourses().slice(0, 6).map(course => (
                        <span key={course} style={styles.recommendedCourseTag}>{course}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    backgroundColor: '#F9FAFB',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 32px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '4px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  qualificationBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#EFF6FF',
    borderRadius: '10px',
    border: '1px solid #BFDBFE',
  },
  qualificationLabel: {
    fontSize: '13px',
    color: '#6B7280',
  },
  qualificationValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1E40AF',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    padding: '12px 32px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
  },
  tab: {
    padding: '10px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
    cursor: 'pointer',
  },
  tabActive: {
    backgroundColor: '#EFF6FF',
    color: '#185FA5',
    fontWeight: '600',
  },
  content: {
    padding: '24px 32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  section: {
    animation: 'fadeIn 0.3s ease',
  },
  sectionHeader: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '4px 0 0 0',
  },
  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #E5E7EB',
  },
  uploadTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 16px 0',
  },
  uploadForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
  },
  formInput: {
    padding: '10px 14px',
    fontSize: '14px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    color: '#111111',
  },
  formSelect: {
    padding: '10px 14px',
    fontSize: '14px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    color: '#111111',
  },
  formFile: {
    padding: '8px 14px',
    fontSize: '14px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    color: '#111111',
  },
  uploadBtn: {
    padding: '12px 24px',
    backgroundColor: '#185FA5',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  documentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  documentCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
  },
  documentIcon: {
    fontSize: '32px',
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  documentDate: {
    fontSize: '12px',
    color: '#6B7280',
    margin: '4px 0',
  },
  documentStatus: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '10px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  documentActions: {
    display: 'flex',
    gap: '8px',
  },
  viewBtn: {
    padding: '6px 12px',
    backgroundColor: '#EFF6FF',
    color: '#185FA5',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  requiredDocsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  requiredDocCard: {
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid',
  },
  requiredDocHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  requiredDocIcon: {
    fontSize: '20px',
  },
  requiredDocName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  requiredDocStatus: {
    fontSize: '13px',
    color: '#6B7280',
  },
  uploadRequiredBtn: {
    marginTop: '12px',
    padding: '8px 16px',
    backgroundColor: '#185FA5',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  documentsChecklist: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #E5E7EB',
  },
  checklistTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 16px 0',
  },
  checklist: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  checklistItem: {
    padding: '10px 0',
    fontSize: '14px',
    borderBottom: '1px solid #F3F4F6',
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #E5E7EB',
  },
  courseBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: '#EFF6FF',
    color: '#1E40AF',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: '100px',
    marginBottom: '12px',
  },
  courseName: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  courseCollege: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 12px 0',
  },
  courseMeta: {
    display: 'flex',
    gap: '16px',
    fontSize: '13px',
    color: '#374151',
    marginBottom: '12px',
  },
  courseEligibility: {
    fontSize: '13px',
    color: '#6B7280',
    marginBottom: '16px',
  },
  applyCourseBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#185FA5',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  profileForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #E5E7EB',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  streamCourses: {
    padding: '16px',
    backgroundColor: '#F0FDF4',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  streamCoursesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
  },
  streamCourseTag: {
    padding: '6px 12px',
    backgroundColor: '#DCFCE7',
    color: '#166534',
    fontSize: '13px',
    borderRadius: '6px',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 20px',
    backgroundColor: '#185FA5',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  editProfileBtn: {
    padding: '8px 16px',
    backgroundColor: '#EFF6FF',
    color: '#185FA5',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #E5E7EB',
    marginBottom: '20px',
  },
  profileRow: {
    display: 'flex',
    padding: '12px 0',
    borderBottom: '1px solid #F3F4F6',
  },
  profileLabel: {
    width: '150px',
    fontSize: '14px',
    color: '#6B7280',
  },
  profileValue: {
    flex: 1,
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    marginBottom: '20px',
  },
  profileAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#185FA5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarEdit: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#185FA5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileHeaderInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  profileEmail: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 8px 0',
  },
  profileStats: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
  },
  profileStat: {
    flex: 1,
    padding: '20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    textAlign: 'center',
  },
  statValue: {
    display: 'block',
    fontSize: '28px',
    fontWeight: '700',
    color: '#185FA5',
  },
  statLabel: {
    fontSize: '13px',
    color: '#6B7280',
  },
  profileCardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 16px 0',
    paddingBottom: '12px',
    borderBottom: '1px solid #E5E7EB',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  profileGridItem: {
    padding: '8px 0',
  },
  profileFormHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
    padding: '20px',
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
  },
  avatarHint: {
    fontSize: '13px',
    color: '#6B7280',
    margin: 0,
  },
  formSectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    margin: '24px 0 16px 0',
    paddingBottom: '8px',
    borderBottom: '2px solid #185FA5',
  },
  streamCoursesTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 12px 0',
  },
  fieldHint: {
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '4px',
  },
  recommendedCourses: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  recommendedCourseTag: {
    padding: '6px 12px',
    backgroundColor: '#EFF6FF',
    color: '#185FA5',
    borderRadius: '100px',
    fontSize: '13px',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
};

export default StudentDocuments;
