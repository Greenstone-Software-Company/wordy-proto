// pages/_app.js
<link rel="icon" href="/favicon.ico" />
import '../styles/globals.css';
import { AppProvider } from '../context/appcontext';
import ErrorBoundary from '../components/ErrorBoundary';

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Component {...pageProps} />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default MyApp;