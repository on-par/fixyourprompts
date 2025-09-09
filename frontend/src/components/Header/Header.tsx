/**
 * Header Component
 * 
 * Navigation header for the FixYourPrompts application featuring:
 * - App branding and logo
 * - Primary navigation menu
 * - Responsive design for mobile and desktop
 * - Accessibility features with proper ARIA labels and landmarks
 * - Modern, clean design suitable for an AI tool
 */

import React, { useState } from 'react';

export interface HeaderProps {
  /** Optional className for custom styling */
  className?: string;
  /** Whether to show the mobile menu by default */
  mobileMenuOpen?: boolean;
  /** Callback when navigation item is clicked */
  onNavigate?: (path: string) => void;
}

interface NavigationItem {
  label: string;
  href: string;
  ariaLabel?: string;
}

const navigationItems: NavigationItem[] = [
  { label: 'Home', href: '/', ariaLabel: 'Go to home page' },
  { label: 'Help', href: '/help', ariaLabel: 'Get help and documentation' },
  { label: 'About', href: '/about', ariaLabel: 'Learn about FixYourPrompts' }
];

export const Header: React.FC<HeaderProps> = ({ 
  className = '',
  mobileMenuOpen = false,
  onNavigate
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(mobileMenuOpen);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const handleNavigationClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onNavigate) {
      event.preventDefault();
      onNavigate(href);
    }
    // Close mobile menu when navigation item is clicked
    setIsMobileMenuOpen(false);
  };

  const headerStyles: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    transition: 'all 0.3s ease'
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '4rem'
  };

  const logoStyles: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#646cff',
    textDecoration: 'none',
    transition: 'color 0.3s ease'
  };

  const navStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  };

  const navListStyles: React.CSSProperties = {
    display: 'flex',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    gap: '2rem',
    alignItems: 'center'
  };

  const navLinkStyles: React.CSSProperties = {
    color: '#213547',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    transition: 'all 0.3s ease',
    position: 'relative'
  };

  const navLinkHoverStyles: React.CSSProperties = {
    color: '#646cff',
    backgroundColor: 'rgba(100, 108, 255, 0.1)'
  };

  const mobileMenuButtonStyles: React.CSSProperties = {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.5rem',
    color: '#213547',
    borderRadius: '0.25rem',
    transition: 'background-color 0.3s ease'
  };

  const mobileNavStyles: React.CSSProperties = {
    display: isMobileMenuOpen ? 'block' : 'none',
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 999
  };

  const mobileNavListStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    listStyle: 'none',
    margin: 0,
    padding: '1rem',
    gap: '0.5rem'
  };

  const mobileNavLinkStyles: React.CSSProperties = {
    ...navLinkStyles,
    display: 'block',
    padding: '1rem',
    borderRadius: '0.5rem'
  };

  // Media query styles for mobile
  const mediaQueryStyles = `
    @media (prefers-color-scheme: dark) {
      .header {
        background-color: rgba(36, 36, 36, 0.95) !important;
        border-bottom-color: rgba(255, 255, 255, 0.1) !important;
      }
      .header .logo {
        color: #646cff !important;
      }
      .header .nav-link {
        color: rgba(255, 255, 255, 0.87) !important;
      }
      .header .nav-link:hover {
        color: #646cff !important;
        background-color: rgba(100, 108, 255, 0.2) !important;
      }
      .header .mobile-menu-button {
        color: rgba(255, 255, 255, 0.87) !important;
      }
      .header .mobile-nav {
        background-color: rgba(36, 36, 36, 0.98) !important;
        border-bottom-color: rgba(255, 255, 255, 0.1) !important;
      }
    }
    
    @media (max-width: 768px) {
      .header .desktop-nav {
        display: none !important;
      }
      .header .mobile-menu-button {
        display: block !important;
      }
    }
  `;

  return (
    <>
      <style>{mediaQueryStyles}</style>
      <header 
        className={`header ${className}`}
        style={headerStyles}
        role="banner"
        aria-label="Main navigation"
      >
        <div style={containerStyles}>
          {/* Logo/Brand */}
          <a 
            href="/" 
            className="logo"
            style={logoStyles}
            aria-label="FixYourPrompts - Go to home page"
            onClick={(e) => handleNavigationClick(e, '/')}
          >
            FixYourPrompts
          </a>

          {/* Desktop Navigation */}
          <nav 
            className="desktop-nav"
            style={navStyles} 
            role="navigation"
            aria-label="Primary navigation"
          >
            <ul style={navListStyles}>
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="nav-link"
                    style={navLinkStyles}
                    aria-label={item.ariaLabel || item.label}
                    onClick={(e) => handleNavigationClick(e, item.href)}
                    onMouseEnter={(e) => {
                      Object.assign(e.currentTarget.style, navLinkHoverStyles);
                    }}
                    onMouseLeave={(e) => {
                      Object.assign(e.currentTarget.style, navLinkStyles);
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            style={mobileMenuButtonStyles}
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          style={mobileNavStyles}
          role="navigation"
          aria-label="Mobile navigation"
          aria-hidden={!isMobileMenuOpen}
        >
          <ul style={mobileNavListStyles}>
            {navigationItems.map((item) => (
              <li key={`mobile-${item.href}`}>
                <a
                  href={item.href}
                  className="nav-link"
                  style={mobileNavLinkStyles}
                  aria-label={item.ariaLabel || item.label}
                  onClick={(e) => handleNavigationClick(e, item.href)}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, { ...mobileNavLinkStyles, ...navLinkHoverStyles });
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, mobileNavLinkStyles);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Header;