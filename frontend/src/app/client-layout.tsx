'use client'

import { useState } from "react";
import { Providers } from "./providers";
import Header from "../components/Header";
import { Toaster } from "../components/ui/sonner";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDarkMode, setIsDarkMode] = useState(true)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <Providers>
        <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        {children}
        <Toaster />
      </Providers>
    </div>
  );
}
