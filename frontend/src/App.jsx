import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CaseList from './pages/CaseList';
import CaseDetail from './pages/CaseDetail';

const Statistics = lazy(() => import('./pages/Statistics'));
const Education = lazy(() => import('./pages/Education'));
const TUE = lazy(() => import('./pages/TUE'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cases" element={<CaseList />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/education" element={<Education />} />
            <Route path="/tue" element={<TUE />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
