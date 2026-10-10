import React, { useState, useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BestSellers } from './components/BestSellers';
import { FestivalCountdownSection } from './components/FestivalCountdownSection';
import { SweetsMenu } from './components/SweetsMenu';
import { SnacksMenu } from './components/SnacksMenu';
import { SpecialCollection } from './components/SpecialCollection';
import { CelebrationOrders } from './components/CelebrationOrders';
import { AboutSection } from './components/AboutSection';
import { CustomerReviews } from './components/CustomerReviews';
import { ContactSection } from './components/ContactSection';
import { NewsletterSection } from './components/NewsletterSection';
import { Footer } from './components/Footer';
import { FloatingMobileBar } from './components/FloatingMobileBar';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { CartModal } from './components/CartModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AuthModal } from './components/AuthModal';
import { CustomerDashboardModal } from './components/CustomerDashboardModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OrderStatusTracker } from './components/OrderStatusTracker';
import { OwnerLogin } from './components/OwnerLogin';
import { OwnerDashboard } from './components/OwnerDashboard';
import { subscribeToOwnerAuth, isOwnerAuthorized, OwnerAuthState } from './lib/auth';
import { User } from 'firebase/auth';
import { SweetBox3DSection } from './components/3d/SweetBox3DSection';
import { Sweet3DModal } from './components/3d/Sweet3DModal';
import { Ambient3DCanvas } from './components/3d/Ambient3DCanvas';

const ShopAppContent: React.FC = () => {
  const {
    theme,
    trackingOrderId,
    setTrackingOrderId,
    isOwnerPortalOpen,
    setIsOwnerPortalOpen,
    language,
    is3DModalOpen,
    close3DViewer,
    active3DSweetType,
    active3DProduct,
    is3DAmbientEnabled
  } = useShop();
  const isDark = theme === 'dark';

  const [ownerAuth, setOwnerAuth] = useState<OwnerAuthState>({
    user: null,
    isAuthorized: false,
    loading: true,
    error: null
  });

  // Monitor Firebase Auth state specifically checking authorized owner status
  useEffect(() => {
    const unsubscribe = subscribeToOwnerAuth((authState) => {
      setOwnerAuth(authState);
    });
    return () => unsubscribe();
  }, []);

  // Handle URL route changes (browser back/forward or direct navigation)
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/owner')) {
        setIsOwnerPortalOpen(true);
        setTrackingOrderId(null);
      } else {
        const orderMatch = path.match(/^\/order\/([A-Za-z0-9_-]+)/);
        if (orderMatch) {
          setTrackingOrderId(orderMatch[1]);
          setIsOwnerPortalOpen(false);
        } else {
          setIsOwnerPortalOpen(false);
        }
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange();
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [setIsOwnerPortalOpen, setTrackingOrderId]);

  // Synchronize URL when states change
  useEffect(() => {
    if (isOwnerPortalOpen) {
      if (!window.location.pathname.startsWith('/owner')) {
        window.history.pushState({}, '', '/owner/dashboard');
      }
    } else if (trackingOrderId) {
      if (window.location.pathname !== `/order/${trackingOrderId}`) {
        window.history.pushState({}, '', `/order/${trackingOrderId}`);
      }
    } else {
      if (window.location.pathname.startsWith('/owner') || window.location.pathname.startsWith('/order/')) {
        window.history.pushState({}, '', '/');
      }
    }
  }, [isOwnerPortalOpen, trackingOrderId]);

  // View 1: Customer Order Tracking Screen (/order/:orderId)
  if (trackingOrderId) {
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDark
            ? 'bg-[#150D08] text-stone-100 selection:bg-amber-500 selection:text-stone-950'
            : 'bg-[#FCF9F4] text-stone-800 selection:bg-amber-500 selection:text-stone-950'
        }`}
      >
        <OrderStatusTracker
          orderId={trackingOrderId}
          onBack={() => {
            setTrackingOrderId(null);
            window.history.pushState({}, '', '/');
          }}
        />
      </div>
    );
  }

  // View 2: Owner Dashboard or Login Screen (/owner/login, /owner/dashboard)
  if (isOwnerPortalOpen) {
    if (ownerAuth.loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#150D08] text-amber-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
        </div>
      );
    }

    if (ownerAuth.user && ownerAuth.isAuthorized) {
      return (
        <OwnerDashboard
          onLogout={() => {
            setIsOwnerPortalOpen(false);
            window.history.pushState({}, '', '/');
          }}
          onOpenStorefront={() => {
            setIsOwnerPortalOpen(false);
            window.history.pushState({}, '', '/');
          }}
        />
      );
    }

    return (
      <div
        className={`min-h-screen ${
          isDark ? 'bg-[#150D08]' : 'bg-[#FCF9F4]'
        } flex items-center justify-center`}
      >
        <OwnerLogin
          onSuccess={() => {}}
          onCancel={() => {
            setIsOwnerPortalOpen(false);
            window.history.pushState({}, '', '/');
          }}
        />
      </div>
    );
  }

  // View 3: Complete Customer Storefront (Preserved 100%)
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? 'bg-[#150D08] text-stone-100 selection:bg-amber-500 selection:text-stone-950'
          : 'bg-[#FCF9F4] text-stone-800 selection:bg-amber-500 selection:text-stone-950'
      } pb-20 xl:pb-0`}
    >
      {/* Background radial gold illumination highlights */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-[35%] right-0 w-[500px] h-[500px] bg-amber-600/4 rounded-full blur-3xl" />
        <div className="absolute top-[70%] left-0 w-[500px] h-[500px] bg-amber-500/4 rounded-full blur-3xl" />
      </div>

      {/* Ambient 3D Interactive Floating Particles & Parallax Canvas */}
      {is3DAmbientEnabled && <Ambient3DCanvas isDark={isDark} />}

      {/* PWA App Install Banner for Android / Mobile */}
      <PWAInstallButton variant="banner" />

      {/* Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main>
        <Hero />
        <BestSellers />
        <SweetBox3DSection />
        <FestivalCountdownSection />
        <SweetsMenu />
        <SnacksMenu />
        <SpecialCollection />
        <CelebrationOrders />
        <AboutSection />
        <CustomerReviews />
        <ContactSection />
      </main>

      {/* Newsletter Signup */}
      <NewsletterSection />

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Action Button with Cart Pre-fill */}
      <FloatingWhatsAppButton />

      {/* Mobile Sticky Floating Actions */}
      <FloatingMobileBar />

      {/* Interactive Modals */}
      <CartModal />
      <OrderHistoryModal />
      <AuthModal />
      <CustomerDashboardModal />

      {/* 360° Interactive Sweet 3D Inspection Studio Modal */}
      <Sweet3DModal
        isOpen={is3DModalOpen}
        onClose={close3DViewer}
        initialSweetType={active3DSweetType}
        relatedProduct={active3DProduct}
      />

      {/* Offline Status Toast Indicator */}
      <OfflineIndicator />
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
