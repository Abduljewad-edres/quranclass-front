import styles from './Button.module.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => (
  <button
    type={type}
    className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
    disabled={disabled || loading}
    onClick={onClick}
    {...props}
  >
    {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
    {children}
  </button>
);

export default Button;
