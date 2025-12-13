import Navbar from './Navbar';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Navbar />
      <main className="layout-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
