import Layout from '../components/Layout';
import '../styles/ApplicationStatus.css';

const ApplicationStatus = () => {
  return (
    <Layout>
      <div className="status-container">
        <div className="status-header">
          <h1>Application Status</h1>
          <p className="status-subtitle">Feature under development</p>
        </div>

        <div className="status-placeholder">
          <div className="placeholder-icon">🚧</div>
          <h2>Feature under development</h2>
         
        </div>
      </div>
    </Layout>
  );
};

export default ApplicationStatus;
