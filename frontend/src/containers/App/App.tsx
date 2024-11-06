import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom';
import { HashLoader } from 'react-spinners';
import Header from '../../components/Header/Header';
import ToastManager from '../../components/ToastManager/ToastManager';
import { ROUTES } from '../../constants/routes';
import { AuthProvider, useAuth } from '../../contexts/AuthContext/AuthContext';
import styles from './App.module.scss';

const SignUp = lazy(() => import('../../components/SignUp/SignUp'));
const SignIn = lazy(() => import('../../components/SignIn/SignIn'));
const AppPage = lazy(() => import('../../components/AppPage/AppPage'));

const AppRoutes = () => {
  const location = useLocation();
  const { isLoading } = useAuth();

  if (isLoading) {
    return <HashLoader color="#ff6600" size={60} />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path={ROUTES.SIGN_UP} element={<SignUp />} />
        <Route path={ROUTES.SIGN_IN} element={<SignIn />} />
        <Route path={ROUTES.APP} element={<AppPage />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const { isLoading } = useAuth();

  return (
    <Router>
      <AuthProvider>
        <div className={styles.wrapper}>
          <Header />
          <ToastManager />
          <div className={styles.page}>
            <Suspense
              fallback={
                <HashLoader color="#ff6600" loading={isLoading} size={60} />
              }
            >
              <AppRoutes />
            </Suspense>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
