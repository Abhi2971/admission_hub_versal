import React, { useState } from 'react';
import { getRecommendations } from '../../services/ai';
import Alert from '../common/Alert';
import Loader from '../common/Loader';

const Recommendations = () => {
  const [interests, setInterests] = useState('');
  const [skills, setSkills] = useState('');
  const [careerGoals, setCareerGoals] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await getRecommendations({
        interests: interests.split(',').map(s => s.trim()),
        skills: skills.split(',').map(s => s.trim()),
        career_goals: careerGoals,
      });
      setRecommendations(response.data.recommendations);
    } catch (err) {
      setError('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '24px', color: '#185FA5' }}>
        AI Course Recommendations
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            Tell us about yourself
          </h2>
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
                Interests (comma separated)
              </label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g., programming, mathematics, design"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', color: '#374151' }}
                required
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
                Skills (comma separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., Python, communication, analysis"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', color: '#374151' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
                Career Goals
              </label>
              <textarea
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                placeholder="e.g., I want to become a software engineer"
                rows="3"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', color: '#374151' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', backgroundColor: '#185FA5', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
            >
              {loading ? <Loader size="sm" color="white" /> : 'Get Recommendations'}
            </button>
          </form>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            Recommended Courses
          </h2>
          {loading ? (
            <Loader />
          ) : recommendations ? (
            <div style={{ whiteSpace: 'pre-wrap', color: '#374151' }}>
              <p>{recommendations}</p>
            </div>
          ) : (
            <p style={{ color: '#6b7280' }}>No recommendations yet. Fill out the form to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
