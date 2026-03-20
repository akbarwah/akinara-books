import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login Admin | Akinara Books',
  description: 'Halaman login admin Akinara Books.',
  // Jangan diindex oleh Google
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}