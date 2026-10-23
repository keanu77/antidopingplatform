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
const DrugSearch = lazy(() => import("./pages/DrugSearch"));
const ProductCatalogSearch = lazy(() => import("./pages/ProductCatalogSearch"));
const ProhibitedList = lazy(() => import("./pages/ProhibitedList"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Learning = lazy(() => import("./pages/Learning"));
const TestingProcess = lazy(() => import("./pages/TestingProcess"));
const News = lazy(() => import("./pages/News"));
const Resources = lazy(() => import("./pages/Resources"));
const ADeL = lazy(() => import("./pages/ADeL"));
const ContentSources = lazy(() => import("./pages/ContentSources"));
const EditorialPolicy = lazy(() => import("./pages/EditorialPolicy"));
const CaseLearning = lazy(() => import("./pages/CaseLearning"));
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
              <Route path="/drug-search" element={<DrugSearch />} />
              <Route path="/herbal-search" element={<ProductCatalogSearch key="herbal" category="herbal" />} />
              <Route path="/supplement-search" element={<ProductCatalogSearch key="supplements" category="supplements" />} />
              <Route path="/prohibited-list" element={<ProhibitedList />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/learning" element={<Learning />} />
              <Route path="/testing-process" element={<TestingProcess />} />
              <Route path="/news" element={<News />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/adel" element={<ADeL />} />
              <Route path="/sources" element={<ContentSources />} />
              <Route path="/editorial-policy" element={<EditorialPolicy />} />
              <Route path="/case-learning" element={<CaseLearning />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
