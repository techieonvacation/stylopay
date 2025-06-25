import { useState, useEffect } from "react";
import { Menu, X, Globe, Phone, Mail, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./Button";

// Professional User Navbar with Design System
export default function UserNavbar5() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Bar */}
      <div className="py-2 hidden lg:block border-b bg-neutral-900 text-inverse border-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-inverse hover:opacity-80 transition-opacity">
                <Phone className="h-4 w-4 text-brand-accent" />
                <span>+91 8851967714</span>
              </div>
              <div className="flex items-center space-x-2 text-inverse hover:opacity-80 transition-opacity">
                <Mail className="h-4 w-4 text-brand-accent" />
                <span>info@stylopay.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                to="/careers"
                className="text-inverse text-fs6 fw-400 transition-colors hover:opacity-80"
              >
                Careers
              </Link>
              <Link
                to="/investor-relations"
                className="text-inverse text-fs6 fw-400 transition-colors hover:opacity-80"
              >
                Investor Relations
              </Link>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-brand-accent" />
                <select className="bg-transparent text-sm border-none outline-none cursor-pointer text-inverse">
                  <option value="en" className="bg-gray-800 text-white">
                    English
                  </option>
                  <option value="es" className="bg-gray-800 text-white">
                    Español
                  </option>
                  <option value="fr" className="bg-gray-800 text-white">
                    Français
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav
        className={`sticky top-0 z-50 transition-base bg-surface-primary ${
          isScrolled ? "shadow-custom-lg" : "shadow-custom-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-xl lg:text-2xl font-bold text-primary font-primary fw-600">
                StyloPay
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-1">
                <Link
                  to="/"
                  className="px-4 py-2 rounded-lg transition-base text-primary text-fs5 fw-500 hover:bg-hover-overlay hover:text-brand-primary"
                >
                  Home
                </Link>

                <div className="relative group">
                  <button className="flex items-center px-4 py-2 rounded-lg transition-base text-secondary text-fs5 fw-500 hover:bg-hover-overlay hover:text-brand-primary">
                    Solutions
                    <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
                  </button>
                </div>

                <Link
                  to="/industries"
                  className="px-4 py-2 rounded-lg transition-base text-secondary text-fs5 fw-500 hover:bg-hover-overlay hover:text-brand-primary"
                >
                  Industries
                </Link>
                <Link
                  to="/insights"
                  className="px-4 py-2 rounded-lg transition-base text-secondary text-fs5 fw-500 hover:bg-hover-overlay hover:text-brand-primary"
                >
                  Insights
                </Link>
                <Link
                  to="/about"
                  className="px-4 py-2 rounded-lg transition-base text-secondary text-fs5 fw-500 hover:bg-hover-overlay hover:text-brand-primary"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="px-4 py-2 rounded-lg transition-base text-secondary text-fs5 fw-500 hover:bg-hover-overlay hover:text-brand-primary"
                >
                  Contact
                </Link>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <Button variant="outline" size="sm">Login</Button>
              <Button variant="default" size="sm">Sign Up</Button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg transition-base text-secondary hover:bg-hover-overlay"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="lg:hidden border-t border-primary">
              <div className="px-2 pt-4 pb-3 space-y-1 bg-surface-secondary">
                {/* Mobile Contact Info */}
                <div className="px-3 py-3 mb-4 rounded-lg border-b bg-surface-primary border-primary">
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="h-4 w-4 text-brand-primary" />
                    <span className="text-secondary text-fs6">
                      +91 8851967714
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-brand-primary" />
                    <span className="text-secondary text-fs6">
                      info@stylopay.com
                    </span>
                  </div>
                </div>

                {/* Mobile Menu Items */}
                <Link
                  to="/"
                  className="block px-4 py-3 rounded-lg transition-base text-brand-primary text-fs4 fw-600 active:bg-hover-overlay"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/solutions"
                  className="block px-4 py-3 rounded-lg transition-base text-primary text-fs4 fw-500 active:bg-hover-overlay"
                  onClick={() => setIsOpen(false)}
                >
                  Solutions
                </Link>
                <Link
                  to="/industries"
                  className="block px-4 py-3 rounded-lg transition-base text-primary text-fs4 fw-500 active:bg-hover-overlay"
                  onClick={() => setIsOpen(false)}
                >
                  Industries
                </Link>
                <Link
                  to="/insights"
                  className="block px-4 py-3 rounded-lg transition-base text-primary text-fs4 fw-500 active:bg-hover-overlay"
                  onClick={() => setIsOpen(false)}
                >
                  Insights
                </Link>
                <Link
                  to="/about"
                  className="block px-4 py-3 rounded-lg transition-base text-primary text-fs4 fw-500 active:bg-hover-overlay"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="block px-4 py-3 rounded-lg transition-base text-primary text-fs4 fw-500 active:bg-hover-overlay"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </Link>

                {/* Mobile Action Buttons */}
                <div className="px-3 pt-4 space-y-3">
                  <button className="w-full px-4 py-3 rounded-lg fw-500 transition-base border-2 border-brand-primary text-brand-primary text-fs4 active:bg-brand-primary active:text-on-brand">
                    Login
                  </button>
                  <button className="w-full px-4 py-3 rounded-lg fw-500 transition-base bg-brand-primary text-on-brand text-fs4 shadow-custom-md active:bg-brand-primary-hover">
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
