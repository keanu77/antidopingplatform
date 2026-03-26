import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import CaseList from "./pages/CaseList";
import CaseDetail from "./pages/CaseDetail";

const Statistics = lazy(() => import("./pages/Statistics"));
const Education = lazy(() => import("./pages/Education"));
const TUE = lazy(() => import("./pages/TUE"));
const ProhibitedList = lazy(() => import("./pages/ProhibitedList"));
const Quiz = lazy(() => import("./pages/Quiz"));
const TestingProcess = lazy(() => import("./pages/TestingProcess"));
const News = lazy(() => import("./pages/News"));
const Resources = lazy(() => import("./pages/Resources"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-64">
                <div className="relative">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-200 border-t-emerald-600"></div>
                </div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cases" element={<CaseList />} />
              <Route path="/cases/:id" element={<CaseDetail />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/education" element={<Education />} />
              <Route path="/tue" element={<TUE />} />
              <Route path="/prohibited-list" element={<ProhibitedList />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/testing-process" element={<TestingProcess />} />
              <Route path="/news" element={<News />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
