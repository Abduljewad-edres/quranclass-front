import styles from './EmptyState.module.css';

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className={styles.wrap}>
    {Icon && <Icon size={40} className={styles.icon} aria-hidden="true" />}
    <p className={styles.title}>{title}</p>
    {description && <p className={styles.desc}>{description}</p>}
    {action && <div className={styles.action}>{action}</div>}
  </div>
);

export default EmptyState;
