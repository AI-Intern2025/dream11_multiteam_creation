'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/use-auth';

interface AuthProviderWrapperProps {
  children: ReactNode;
}

export default function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
