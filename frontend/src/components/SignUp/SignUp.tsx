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
import { showToast } from '../ToastManager/ToastManager';
import styles from './SignUp.module.scss';

const SignUp = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    name: Yup.string().required('Name is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(20, 'Password must not exceed 20 characters')
      .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
      .matches(/\d/, 'Password must contain at least one number')
      .matches(
        /[@$!%*?&]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const formik = useFormik({
    initialValues: { email: '', name: '', password: '', confirmPassword: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await apiClient.post(`/api/v1/auth/signup`, values);
        showToast('Signup successful!', 'success');
        navigate(ROUTES.SIGN_IN, { replace: true });
      } catch (err) {
        showToast('Oops! Something went wrong. Please try again.', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const passwordValidations = [
    {
      rule: (password: string) => password.length >= 8 && password.length <= 20,
      label: '8-20 characters',
    },
    {
      rule: (password: string) => /[a-zA-Z]/.test(password),
      label: '1 letter',
    },
    { rule: (password: string) => /\d/.test(password), label: '1 number' },
    {
      rule: (password: string) => /[@$!%*?&]/.test(password),
      label: '1 special character',
    },
  ];

  return (
    <motion.section {...routeAnimation} className={styles.container}>
      <div className={classNames(styles.form, styles.login)}>
        <div className={styles.formContent}>
          <header className={styles.header}>Sign Up</header>
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
                {formik.touched.email && formik.errors.email}
              </div>
            </div>
            <div className={classNames(styles.field, styles.inputField)}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                className={
                  formik.touched.name && formik.errors.name
                    ? styles.errorInput
                    : ''
                }
              />
              <div className={styles.errorText}>
                {formik.touched.name && formik.errors.name}
              </div>
            </div>
            <div className={classNames(styles.field, styles.inputField)}>
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                onChange={formik.handleChange}
                onFocus={() => setIsPasswordFocused(true)}
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
                {formik.touched.password && formik.errors.password}
              </div>
            </div>
            <div className={classNames(styles.field, styles.inputField)}>
              <input
                type={isConfirmPasswordVisible ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
                className={
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                    ? styles.errorInput
                    : ''
                }
              />
              {isConfirmPasswordVisible ? (
                <BsEye
                  className={styles.eyeIcon}
                  size={24}
                  onClick={() => setIsConfirmPasswordVisible(false)}
                />
              ) : (
                <BsEyeSlash
                  className={styles.eyeIcon}
                  size={24}
                  onClick={() => setIsConfirmPasswordVisible(true)}
                />
              )}
              <div className={styles.errorText}>
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword}
              </div>
            </div>
            {isPasswordFocused && (
              <div className={styles.validationHints}>
                {passwordValidations.map(({ rule, label }) => (
                  <div
                    key={label}
                    className={
                      rule(formik.values.password)
                        ? styles.valid
                        : styles.invalid
                    }
                  >
                    {rule(formik.values.password) ? '✓' : '✗'} {label}
                  </div>
                ))}
              </div>
            )}
            <div className={classNames(styles.field, styles.buttonField)}>
              <button type="submit" disabled={formik.isSubmitting}>
                Sign Up
              </button>
            </div>
          </form>
          <div className={styles.formLink}>
            <span>
              Already have an account? <Link to={ROUTES.SIGN_IN}>Sign In</Link>
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default SignUp;
