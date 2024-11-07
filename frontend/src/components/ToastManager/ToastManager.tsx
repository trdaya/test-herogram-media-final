import { FaInfoCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const showToast = (
  message: string,
  type: 'success' | 'error' | 'info',
  showIcon: boolean = true,
  autoCloseTime?: number
) => {
  if (type === 'success') {
    toast.success(message, {
      position: 'top-right',
      autoClose: 5000,
    });
  } else if (type === 'error') {
    toast.error(message, { position: 'top-right', autoClose: 5000 });
  } else {
    toast.info(message, {
      position: 'top-right',
      autoClose: autoCloseTime || 5000,
      progressStyle: { background: 'gray' },
      icon: showIcon ? (
        <FaInfoCircle style={{ color: 'gray' }} size={20} />
      ) : (
        false
      ),
    });
  }
};

const ToastManager = () => {
  return <ToastContainer />;
};

export default ToastManager;
