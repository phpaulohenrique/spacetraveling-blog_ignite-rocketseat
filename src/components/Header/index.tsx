
import styles from './header.module.scss'
import Link from 'next/link'

export default function Header() {

  return (
    <>
      <header className={styles.header}>
        <div>
          <Link href='/'>
            <img src="/logo-spacetraveling.svg" alt="logo" title="Menu inicial" />
          
          </Link>
        </div>
      </header>
    </>
  );
}



