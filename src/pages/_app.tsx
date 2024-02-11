// src/pages/_app.tsx

import { AppProps } from 'next/app'; // Importa el tipo AppProps
import RootLayout from '../app/layout'; // Asegúrate de que la ruta sea correcta
import '../styles/globals.css';

// Usa el tipo AppProps para las props de MyApp
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RootLayout>
      <Component {...pageProps} />
    </RootLayout>
  );
}

export default MyApp;