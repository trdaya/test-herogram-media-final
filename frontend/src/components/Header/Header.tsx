import classNames from 'classnames';
import { useState } from 'react';
import { MdExitToApp } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../constants/apiClient';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import styles from './Header.module.scss';

const Header = () => {
  const { isLoggedIn, userName, userEmail, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await apiClient.post(`/api/v1/auth/logout`);
    } catch (err) {
      console.error(err);
    } finally {
      logout();
    }
  };

  const avatarLetter = userName ? userName.charAt(0).toUpperCase() : '';

  return (
    <header
      className={classNames(styles.header, {
        [styles.headerAfterLogin]: isLoggedIn,
      })}
    >
      <img
        className={styles.logo}
        src="https://static.wixstatic.com/media/14322a_5e5a7fdd4d584d5083e00449c25cb990~mv2.png/v1/fill/w_336,h_336,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/herogram_mark_1080.png"
        alt="Herogram logo"
        onClick={() => navigate(ROUTES.APP)}
      />
      {isLoggedIn && (
        <div
          className={styles.avatarContainer}
          onClick={() => setIsDropdownVisible(val => !val)}
        >
          <div className={styles.avatar}>{avatarLetter}</div>
          <div
            className={classNames(styles.dropdown, {
              [styles.showDropdown]: isDropdownVisible,
            })}
          >
            <span className={styles.email}>{userEmail}</span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <MdExitToApp className={styles.logoutIcon} /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
