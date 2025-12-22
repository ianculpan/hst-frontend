import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute.jsx';

// Lazy load pages for code splitting
const PublicPage = lazy(() => import('../Pages/PublicPage.jsx'));
const LoginPage = lazy(() => import('../Pages/LoginPage.jsx'));
const HomePage = lazy(() => import('../Pages/HomePage.jsx'));
const PrivatePage = lazy(() => import('../Pages/PrivatePage.jsx'));
const TodoList = lazy(() => import('../Pages/TodoList.jsx'));
const ContactList = lazy(() => import('../Pages/ContactList.jsx'));
const ProductList = lazy(() => import('../Pages/ProductList.jsx'));
const InvoiceList = lazy(() => import('../Pages/InvoiceList.jsx'));
const StockPage = lazy(() => import('../Pages/StockPage.jsx'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="text-lg">Loading...</div>
    </div>
  </div>
);

const AppRouter = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/public" element={<PublicPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/todo"
          element={
            <PrivateRoute>
              <TodoList />
            </PrivateRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <PrivateRoute>
              <ContactList />
            </PrivateRoute>
          }
        />
        <Route
          path="/product"
          element={
            <PrivateRoute>
              <ProductList />
            </PrivateRoute>
          }
        />
        <Route
          path="/invoice"
          element={
            <PrivateRoute>
              <InvoiceList />
            </PrivateRoute>
          }
        />
        <Route
          path="/stock"
          element={
            <PrivateRoute>
              <StockPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/private"
          element={
            <PrivateRoute>
              <PrivatePage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
