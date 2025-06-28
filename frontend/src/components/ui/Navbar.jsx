import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import logo from "../../../public/images/logo.png";

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
      {/* Top Bar - Professional Dark Navy */}
      <div className="py-2.5 hidden lg:block border-b bg-brand-secondary text-secondary-foreground border-border/20">
        <div className="container">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2 text-secondary-foreground hover:text-brand-accent transition-colors duration-200">
                <Phone className="h-4 w-4" />
                <span className="font-medium">+91 8851967714</span>
              </div>
              <div className="flex items-center space-x-2 text-secondary-foreground hover:text-brand-accent transition-colors duration-200">
                <Mail className="h-4 w-4" />
                <span className="font-medium">info@stylopay.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <Link
                to="/careers"
                className="text-secondary-foreground hover:text-brand-accent transition-colors duration-200 font-medium"
              >
                Careers
              </Link>
              <Link
                to="/investor-relations"
                className="text-secondary-foreground hover:text-brand-accent transition-colors duration-200 font-medium"
              >
                Investor Relations
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation - Clean Professional White */}
      <nav
        className={`sticky top-0 z-50 transition-base bg-surface-primary border-b border-border/10 ${
          isScrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="container">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo - Strong Brand Presence */}
            <Link
              to="/"
              className="flex items-center space-x-2 hover:opacity-90 transition-opacity duration-200"
            >
              <img src={logo} alt="StyloPay" className="h-10 w-10" />
              <span className="text-xl lg:text-2xl font-bold text-brand-primary font-primary">
                StyloPay
              </span>
            </Link>

            {/* Desktop Navigation - Clear Hierarchy */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-2">
                <Link
                  to="/"
                  className="px-4 py-2 rounded-lg font-family transition-base text-foreground font-medium hover:text-primary"
                >
                  Home
                </Link>

                <div className="relative group">
                  <button className="flex items-center px-4 py-2 rounded-lg font-family transition-base text-foreground font-medium hover:text-primary">
                    Solutions
                    <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
                  </button>
                </div>

                <Link
                  to="/industries"
                  className="px-4 py-2 rounded-lg font-family transition-base text-foreground font-medium hover:text-primary"
                >
                  Industries
                </Link>
                <Link
                  to="/insights"
                  className="px-4 py-2 rounded-lg font-family transition-base text-foreground font-medium hover:text-primary"
                >
                  Insights
                </Link>
                <Link
                  to="/about"
                  className="px-4 py-2 rounded-lg font-family transition-base text-foreground font-medium hover:text-primary"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="px-4 py-2 rounded-lg font-family transition-base text-foreground font-medium hover:text-primary"
                >
                  Contact
                </Link>
              </div>
            </div>

            {/* Desktop Actions - Professional Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <ThemeToggleButton />
              <Link to="/login">
                <Button
                  variant="outline"
                  size="md"
                >
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  variant="default"
                  size="md"
                >
                  Sign Up
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-3">
              <ThemeToggleButton />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg transition-base text-text-secondary hover:bg-brand-primary/8 hover:text-brand-primary"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Enhanced Professional Look */}
          {isOpen && (
            <div className="lg:hidden border-t border-border/20">
              <div className="px-4 pt-4 pb-6 space-y-2 bg-neutral-50">
                {/* Mobile Contact Info - Professional Card */}
                <div className="px-4 py-4 mb-6 rounded-xl bg-brand-secondary/5 border border-brand-primary/10">
                  <div className="flex items-center space-x-3 mb-3">
                    <Phone className="h-4 w-4 text-brand-primary" />
                    <span className="text-text-primary font-medium">
                      +91 8851967714
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-brand-primary" />
                    <span className="text-text-primary font-medium">
                      info@stylopay.com
                    </span>
                  </div>
                </div>

                {/* Mobile Menu Items - Clear Hierarchy */}
                <Link
                  to="/"
                  className="block px-4 py-3 rounded-lg transition-base text-text-primary text-base font-semibold hover:bg-brand-primary/8 hover:text-brand-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/solutions"
                  className="block px-4 py-3 rounded-lg transition-base text-text-secondary text-base font-medium hover:bg-brand-primary/8 hover:text-brand-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Solutions
                </Link>
                <Link
                  to="/industries"
                  className="block px-4 py-3 rounded-lg transition-base text-text-secondary text-base font-medium hover:bg-brand-primary/8 hover:text-brand-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Industries
                </Link>
                <Link
                  to="/insights"
                  className="block px-4 py-3 rounded-lg transition-base text-text-secondary text-base font-medium hover:bg-brand-primary/8 hover:text-brand-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Insights
                </Link>
                <Link
                  to="/about"
                  className="block px-4 py-3 rounded-lg transition-base text-text-secondary text-base font-medium hover:bg-brand-primary/8 hover:text-brand-primary"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="block px-4 py-3 rounded-lg transition-base text-text-secondary text-base font-medium hover:bg-brand-primary/8 hover:text-brand-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </Link>

                {/* Mobile Action Buttons - Professional Styling */}
                <div className="pt-6 space-y-3">
                  <Link
                    to="/login"
                    className="block"
                    onClick={() => setIsOpen(false)}
                  >
                    <button className="w-full px-6 py-3 rounded-lg font-semibold transition-base border-2 border-brand-primary/30 text-brand-primary hover:bg-brand-primary/5">
                      Login
                    </button>
                  </Link>
                  <Link
                    to="/signup"
                    className="block"
                    onClick={() => setIsOpen(false)}
                  >
                    <button className="w-full px-6 py-3 rounded-lg font-semibold transition-base bg-brand-primary text-white shadow-custom-md hover:bg-brand-primary-hover">
                      Sign Up
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
