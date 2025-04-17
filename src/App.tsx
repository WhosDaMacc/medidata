import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import HospitalRecords from './components/HospitalRecords';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const App: React.FC = () => {
  return (
    <Router>
      <AppContainer>
        <Routes>
          <Route path="/" element={<HospitalRecords />} />
          {/* Add more routes as needed */}
        </Routes>
      </AppContainer>
    </Router>
  );
};

export default App; 