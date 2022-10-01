
import { GetStaticProps } from 'next';
import styles from './header.module.scss'
import Link from 'next/link'

export default function Header() {
  // TODO


  return (
    <>
      <header className={styles.header}>
        <div>
          <Link href='/'>
            <img src="/logo-spacetraveling.svg" alt="logo" />
          
          </Link>
        </div>
      </header>
    </>
  );
}



