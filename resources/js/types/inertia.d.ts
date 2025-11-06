// resources/js/types/inertia.d.ts
import { NotificationI } from '@/interfaces/NotificationInterface';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

export interface DefaultProps {
  auth?: {
    user?: {
      id: number;
      name: string;
      email: string;
      notifications?: NotificationI[]
    };
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

// Global generic type
declare global {
  interface PageProps extends InertiaPageProps, DefaultProps {}
}
