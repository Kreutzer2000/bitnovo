// src/app/layout.tsx

import { Inter } from "next/font/google";
import { ReactNode } from 'react';

const inter = Inter({ subsets: ["latin"] });

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <div className={inter.className}>{children}</div>
    </>
  );
}