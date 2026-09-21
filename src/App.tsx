import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BestSellers } from './components/BestSellers';
import { SweetsMenu } from './components/SweetsMenu';
import { SnacksMenu } from './components/SnacksMenu';
import { SpecialCollection } from './components/SpecialCollection';
import { CelebrationOrders } from './components/CelebrationOrders';
import { AboutSection } from './components/AboutSection';
import { CustomerReviews } from './components/CustomerReviews';
import { OrderCTA } from './components/OrderCTA';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { FloatingMobileBar } from './components/FloatingMobileBar';
import { CartModal } from './components/CartModal';
import { AdminPriceModal } from './components/AdminPriceModal';

const ShopAppContent: React.FC = () => {
  const { theme } = useShop();
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? 'bg-[#150D08] text-stone-100 selection:bg-amber-500 selection:text-stone-950'
          : 'bg-[#FCF9F4] text-stone-800 selection:bg-amber-500 selection:text-stone-950'
      } pb-16 xl:pb-0`}
    >
      {/* Background radial gold illumination highlights */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-[35%] right-0 w-[500px] h-[500px] bg-amber-600/4 rounded-full blur-3xl" />
        <div className="absolute top-[70%] left-0 w-[500px] h-[500px] bg-amber-500/4 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main>
        <Hero />
        <BestSellers />
        <SweetsMenu />
        <SnacksMenu />
        <SpecialCollection />
        <CelebrationOrders />
        <AboutSection />
        <CustomerReviews />
        <OrderCTA />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Sticky Floating Actions */}
      <FloatingMobileBar />

      {/* Interactive Modals */}
      <CartModal />
      <AdminPriceModal />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <ShopAppContent />
    </ShopProvider>
  );
}
