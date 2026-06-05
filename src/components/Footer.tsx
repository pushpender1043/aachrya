import { Link } from "react-router-dom";
import { useState } from "react";
import { 
  Sparkles, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Send,
  Star,
  Award,
  Shield,
  Linkedin
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "@/hooks/use-toast";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Subscribed!",
      description: "You'll receive cosmic updates in your inbox.",
    });
    setEmail("");
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  const quickLinks = [
    { name: "About Us", path: "/about" },
    { name: "Astrologers", path: "/astrologers" },
    { name: "Kundli", path: "/kundli" },
    { name: "Blogs", path: "/blogs" },
  ];

  const services = [
    { name: "Daily Horoscope", path: "/" },
    { name: "Chat with Astrologer", path: "/astrologers" },
    { name: "Kundli Matching", path: "/kundli" },
    { name: "Spiritual Products", path: "/products" },
    { name: "Vastu Consultation", path: "/contact" },
  ];

  const support = [
    { name: "Contact Us", path: "/contact" },
    { name: "FAQs", path: "#" },
    { name: "Privacy Policy", path: "#" },
    { name: "Terms & Conditions", path: "#" },
    { name: "Refund Policy", path: "#" },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-card/50 to-card border-t border-border overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-1 h-1 bg-accent rounded-full animate-pulse" />
        <div className="absolute top-20 right-20 w-1 h-1 bg-primary rounded-full animate-pulse delay-100" />
        <div className="absolute bottom-20 left-1/4 w-1 h-1 bg-accent rounded-full animate-pulse delay-200" />
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-primary rounded-full animate-pulse delay-300" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 relative">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <Link to="/" className="inline-flex items-center space-x-2 group">
                <div className="relative">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                  <div className="absolute inset-0 w-8 h-8 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-300" />
                </div>
                <span className="text-2xl md:text-3xl font-bold gradient-text">Aachrya</span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your trusted companion for astrological guidance, spiritual wisdom, and cosmic insights. 
                Discover your true path with ancient Vedic astrology.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20 hover:border-primary/40 transition-all group">
                <Shield className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-lg border border-accent/20 hover:border-accent/40 transition-all group">
                <Award className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Verified Astrologers</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20 hover:border-primary/40 transition-all group">
                <Star className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">5000+ Happy Clients</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Get Cosmic Updates
              </h3>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-background/50 border-border/50 focus:border-primary"
                  required
                />
                <Button type="submit" className="glow-effect group">
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground border-b border-border/50 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary mr-0 group-hover:mr-2 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground border-b border-border/50 pb-2">
              Our Services
            </h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    to={service.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary mr-0 group-hover:mr-2 transition-all duration-300" />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground border-b border-border/50 pb-2">
              Support
            </h3>
            <ul className="space-y-3 mb-6">
              {support.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary mr-0 group-hover:mr-2 transition-all duration-300" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <a 
                href="tel:+919876543210" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm group"
              >
                <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>+91 98765 43210</span>
              </a>
              <a 
                href="mailto:support@aachrya.com" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm group"
              >
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>support@aachrya.com</span>
              </a>
              <div className="flex items-start gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>123 Cosmic Lane, Mumbai, Maharashtra 400001, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Payment Methods */}
        <div className="border-t border-border/50 pt-8 space-y-6">
          {/* Social Links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground font-medium">Follow Us:</span>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground hover:scale-110 hover:rotate-12 transition-all duration-300 group"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex flex-col items-center md:items-end gap-3">
              <span className="text-sm text-muted-foreground font-medium">We Accept:</span>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <div className="px-3 py-2 bg-background/50 border border-border/50 rounded hover:border-primary/50 transition-colors">
                  <span className="text-xs font-semibold text-primary">VISA</span>
                </div>
                <div className="px-3 py-2 bg-background/50 border border-border/50 rounded hover:border-primary/50 transition-colors">
                  <span className="text-xs font-semibold text-primary">Mastercard</span>
                </div>
                <div className="px-3 py-2 bg-background/50 border border-border/50 rounded hover:border-primary/50 transition-colors">
                  <span className="text-xs font-semibold text-primary">UPI</span>
                </div>
                <div className="px-3 py-2 bg-background/50 border border-border/50 rounded hover:border-primary/50 transition-colors">
                  <span className="text-xs font-semibold text-primary">Razorpay</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-border/50 pt-6 text-center">
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} Aachrya Astrology. All rights reserved. 
              <span className="mx-2">|</span>
              Made with <span className="text-accent">✨</span> for seekers of cosmic wisdom
            </p>
          </div>
        </div>
      </div>

      {/* Bottom gradient glow */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </footer>
  );
};

export default Footer;
