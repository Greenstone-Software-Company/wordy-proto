import '../styles/globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user && router.pathname !== '/login') {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <Component {...pageProps} />;
}

export default MyApp;