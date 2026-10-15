import styles from './Input.module.css'; // reuse same styles

const Select = ({ label, error, id, children, className = '', ...props }) => (
  <div className={styles.field}>
    {label && <label htmlFor={id} className={styles.label}>{label}</label>}
    <select
      id={id}
      className={`${styles.input} ${error ? styles.inputError : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <span className={styles.error} role="alert">{error}</span>}
  </div>
);

export default Select;
