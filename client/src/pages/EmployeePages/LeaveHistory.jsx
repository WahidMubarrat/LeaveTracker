import Layout from '../../components/Layout';
import '../../styles/LeaveHistory.css';

const LeaveHistory = () => {
  return (
    <Layout>
      <div className="history-container">
        <div className="history-header">
          <h1>Leave History</h1>
          <p className="history-subtitle">Feature under development</p>
        </div>

        <div className="history-empty">
          <div className="empty-icon">🚧</div>
          <p>Feature under development</p>
          <p className="empty-subtitle">
          
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default LeaveHistory;
