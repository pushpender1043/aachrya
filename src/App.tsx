import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import MobileBottomNav from "./components/MobileBottomNav";
import Preloader from "./components/Preloader"; // ✅ 1. Import Preloader

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Blogs from "./pages/Blogs";
import Astrologers from "./pages/Astrologers";
import Contact from "./pages/Contact";
import Kundli from "./pages/Kundli";
import Consultation from "./pages/Consultation";
import Poojas from "./pages/Poojas";
import Calculators from "./pages/Calculators";
import MyAppointments from "./pages/MyAppointments";
import Panchang from "./pages/Panchang";
import MyOrders from "./pages/MyOrders";
// Admin Imports
import AdminDashboard from "./pages/admin/Dashboard";
import ProductsManagement from "./pages/admin/ProductsManagement";
import OrdersManagement from "./pages/admin/OrdersManagement";
import AstrologersManagement from "./pages/admin/AstrologersManagement";
import BlogsManagement from "./pages/admin/BlogsManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import PoojasManagement from "./pages/admin/PoojasManagement";
import PoojaBookingsManagement from "./pages/admin/PoojaBookingsManagement";
import AdminAppointments from "./pages/admin/Appointments";
import SupportManagement from "./pages/admin/SupportManagement";
import BannersManagement from "./pages/admin/BannersManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {/* ✅ 2. Preloader Added Here - It will show on top of everything */}
        <Preloader />

        <BrowserRouter>
          <div className="pb-16 md:pb-0">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/astrologers" element={<Astrologers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/kundli" element={<Kundli />} />
              <Route path="/consultation/:type/:astrologerId" element={<Consultation />} />
              <Route path="/poojas" element={<Poojas />} />
              <Route path="/calculators" element={<Calculators />} />
              <Route path="/my-appointments" element={<MyAppointments />} />
              <Route path="/panchang" element={<Panchang />} />
              <Route path="/my-orders" element={<MyOrders />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/appointments" element={<AdminAppointments />} />
              <Route path="/admin/products" element={<ProductsManagement />} />
              <Route path="/admin/orders" element={<OrdersManagement />} />
              <Route path="/admin/astrologers" element={<AstrologersManagement />} />
              <Route path="/admin/blogs" element={<BlogsManagement />} />
              <Route path="/admin/users" element={<UsersManagement />} />
              <Route path="/admin/poojas" element={<PoojasManagement />} />
              <Route path="/admin/pooja-bookings" element={<PoojaBookingsManagement />} />
              <Route path="/admin/support" element={<SupportManagement />} />
              {/* <Route path="/admin/banners" element={<BannersManagement />} /> */}
              {/* Catch All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          
          <MobileBottomNav />
          
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;