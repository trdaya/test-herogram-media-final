import classNames from 'classnames';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { routeAnimation } from '../../constants/animations';
import apiClient from '../../constants/apiClient';
import { ROUTES } from '../../constants/routes';
import { LocalStorageTokenEnum } from '../../constants/tokens';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { showToast } from '../ToastManager/ToastManager';
import styles from './SignIn.module.scss';

const SignIn = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { fetchProfile } = useAuth();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const controller = new AbortController();
      try {
        const response = await apiClient.post(`/api/v1/auth/signin`, values);
        localStorage.setItem(
          LocalStorageTokenEnum.accessToken,
          response.data.accessToken
        );
        showToast('Login successful!', 'success');
        await fetchProfile(controller.signal);
        navigate(ROUTES.APP, { replace: true });
      } catch (err) {
        showToast('Invalid credentials.', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <motion.section {...routeAnimation} className={styles.container}>
      <div className={classNames(styles.form, styles.login)}>
        <div className={styles.formContent}>
          <header className={styles.header}>Sign In</header>
          <form onSubmit={formik.handleSubmit}>
            <div className={classNames(styles.field, styles.inputField)}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className={
                  formik.touched.email && formik.errors.email
                    ? styles.errorInput
                    : ''
                }
              />
              <div className={styles.errorText}>
                {formik.touched.email && formik.errors.email
                  ? formik.errors.email
                  : ''}
              </div>
            </div>
            <div className={classNames(styles.field, styles.inputField)}>
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className={
                  formik.touched.password && formik.errors.password
                    ? styles.errorInput
                    : ''
                }
              />
              {isPasswordVisible ? (
                <BsEye
                  className={styles.eyeIcon}
                  size={24}
                  onClick={() => setIsPasswordVisible(false)}
                />
              ) : (
                <BsEyeSlash
                  className={styles.eyeIcon}
                  size={24}
                  onClick={() => setIsPasswordVisible(true)}
                />
              )}
              <div className={styles.errorText}>
                {formik.touched.password && formik.errors.password
                  ? formik.errors.password
                  : ''}
              </div>
            </div>
            <div className={styles.formLink}>
              <a
                href="#"
                className={styles.forgotPass}
                onClick={() =>
                  showToast(
                    'Can be implemented on demand, as it is a big feature',
                    'info'
                  )
                }
              >
                Forgot password?
              </a>
            </div>
            <div className={classNames(styles.field, styles.buttonField)}>
              <button type="submit" disabled={formik.isSubmitting}>
                Sign In
              </button>
            </div>
          </form>
          <div className={styles.formLink}>
            <span>
              Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default SignIn;
