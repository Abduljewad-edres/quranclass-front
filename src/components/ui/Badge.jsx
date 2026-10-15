import { statusClass } from '../../utils/helpers';
import styles from './Badge.module.css';

const Badge = ({ status, label }) => (
  <span className={`${styles.badge} ${styles[statusClass(status)]}`}>
    {label || status}
  </span>
);

export default Badge;
