import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { OrderModal } from './components/OrderModal.tsx';

// Views
import { HomeView } from './views/HomeView.tsx';
import { CatalogView } from './views/CatalogView.tsx';
import { ProductDetailView } from './views/ProductDetailView.tsx';
import { SubmitProductView } from './views/SubmitProductView.tsx';
import { CartView } from './views/CartView.tsx';
import { ContactView } from './views/ContactView.tsx';
import {
  AboutView,
  HowToSellView,
  FaqView,
  PrivacyPolicyView,
  TermsView,
  ProductListingTermsView,
  CancellationPolicyView,
} from './views/StaticPages.tsx';
import { AdminView } from './views/AdminView.tsx';

const AppContent: React.FC = () => {
  const { view } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {view === 'home' && <HomeView />}
        {view === 'catalog' && <CatalogView />}
        {view === 'product-detail' && <ProductDetailView />}
        {view === 'submit-product' && <SubmitProductView />}
        {view === 'cart' && <CartView />}
        {view === 'contact' && <ContactView />}
        {view === 'about' && <AboutView />}
        {view === 'how-to-sell' && <HowToSellView />}
        {view === 'faq' && <FaqView />}
        {view === 'privacy' && <PrivacyPolicyView />}
        {view === 'terms' && <TermsView />}
        {view === 'product-terms' && <ProductListingTermsView />}
        {view === 'cancellation-policy' && <CancellationPolicyView />}
        {view === 'admin' && <AdminView />}
      </main>

      <Footer />

      {/* Global Modals & Fixed Overlays */}
      <OrderModal />
      <FloatingWhatsApp />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
