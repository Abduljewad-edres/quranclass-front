import styles from './Input.module.css';

const Input = ({ label, error, id, className = '', ...props }) => (
  <div className={styles.field}>
    {label && <label htmlFor={id} className={styles.label}>{label}</label>}
    <input
      id={id}
      className={`${styles.input} ${error ? styles.inputError : ''} ${className}`}
      {...props}
    />
    {error && <span className={styles.error} role="alert">{error}</span>}
  </div>
);

export default Input;
