import { AppProps } from 'next/app';
import '../styles/globals.scss';
import '../styles/common.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return <Component {...pageProps} />;
}

export default MyApp;
