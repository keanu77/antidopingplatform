import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CaseList from './pages/CaseList';
import CaseDetail from './pages/CaseDetail';
import Statistics from './pages/Statistics';
import Education from './pages/Education';
import TUE from './pages/TUE';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cases" element={<CaseList />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/education" element={<Education />} />
          <Route path="/tue" element={<TUE />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;