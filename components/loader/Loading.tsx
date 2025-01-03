import styles from './Loader.module.css'
import clsx from 'clsx';


interface LoaderProps {
  className?: string
}

export default function Loader({ className }: LoaderProps) {
  return (
    <div className={clsx(styles.wrapper)}>
      <div className={styles.loader} />
    </div>
  )
}