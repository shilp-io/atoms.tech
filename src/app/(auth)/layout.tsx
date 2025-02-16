import { GridBackground } from '@/components/custom/LandingPage/grid-background';
import { Navbar } from '@/components/custom/LandingPage/navbar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      <div className="bg-[url('/../../../geoLandscape.jpg')] bg-cover bg-center">
        {children}
      </div>
    </div>
  );
}
