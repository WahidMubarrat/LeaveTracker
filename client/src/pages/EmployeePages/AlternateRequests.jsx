import Layout from '../../components/Layout';
import '../../styles/AlternateRequests.css';

const AlternateRequests = () => {
  return (
    <Layout>
      <div className="alternate-requests-page">
        <header className="alternate-requests-header">
          <div>
         
            <h1>Alternate Requests</h1>
            <p className="alternate-requests-status">Feature under development</p>
          </div>
        </header>

        <section className="alternate-requests-placeholder">
          <div className="placeholder-icon">🚧</div>
          <h2>Feature under development</h2>
     
        </section>
      </div>
    </Layout>
  );
};

export default AlternateRequests;
