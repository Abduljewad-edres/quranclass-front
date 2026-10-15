import styles from './Spinner.module.css';

const Spinner = ({ size = 'md', label = 'Loading…' }) => (
  <div className={styles.wrap} role="status" aria-label={label}>
    <span className={`${styles.spinner} ${styles[size]}`} aria-hidden="true" />
  </div>
);

export default Spinner;
