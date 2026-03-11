

// FILE: src/pages/members/Members.jsx
// PURPOSE: Displays all members of the logged-in user's department.
// This page loads colleague information using the CollegueInfo component
// and shows the total number of department members in the header.


import { useState, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import CollegueInfo from '../../components/CollegueInfo';
import '../../styles/Members.css';

const Members = () => {
  const { user } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const handleMembersLoaded = useCallback((memberList) => {
    setMembers(memberList);
  }, []);

  return (
    <Layout>
      <div className="members-container">
        <div className="members-header">
          <h1>Department Members</h1>
          <p className="members-subtitle">
            {user?.department?.name} Department - {members.length} Members
          </p>
        </div>

        <div className="members-content">
          <CollegueInfo onMembersLoaded={handleMembersLoaded} />
        </div>
      </div>
    </Layout>
  );
};

export default Members;
