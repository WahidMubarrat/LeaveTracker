import HRLayout from '../../components/HRLayout';
import '../../styles/ReviewApplication.css';

const ReviewApplication = () => {
  return (
    <HRLayout>
      <div className="review-application-container">
        <div className="page-header">
          <h1>Review Application</h1>
          <p className="page-subtitle">Review and approve pending leave applications</p>
        </div>

        <div className="review-content">
          <div className="filter-section">
            <button className="filter-btn active">All Applications</button>
            <button className="filter-btn">Pending</button>
            <button className="filter-btn">Approved</button>
            <button className="filter-btn">Declined</button>
          </div>

          <div className="applications-list">
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No Applications</h3>
              <p>There are no leave applications to review at the moment</p>
            </div>
          </div>
        </div>
      </div>
    </HRLayout>
  );
};

export default ReviewApplication;
