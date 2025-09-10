/**
 * Footer Component
 * 
 * Footer section for the FixYourPrompts application featuring:
 * - App information and tagline
 * - Links to important pages (Privacy, Terms, Help)
 * - Copyright notice
 * - Responsive design for mobile and desktop
 * - Accessibility features with proper ARIA labels and landmarks
 * - Professional, minimal design
 */

import React from 'react';
import './Footer.css';

export interface FooterProps {
  /** Optional className for custom styling */
  className?: string;
  /** Callback when footer link is clicked */
  onNavigate?: (path: string) => void;
  /** Copyright year (defaults to current year) */
  copyrightYear?: number;
  /** Optional custom tagline */
  tagline?: string;
}

interface FooterLink {
  label: string;
  href: string;
  ariaLabel?: string;
  external?: boolean;
}

const footerLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', ariaLabel: 'Read our privacy policy' },
  { label: 'Terms of Service', href: '/terms', ariaLabel: 'Read our terms of service' },
  { label: 'Help', href: '/help', ariaLabel: 'Get help and support' }
];

export const Footer: React.FC<FooterProps> = ({ 
  className = '',
  onNavigate,
  copyrightYear = new Date().getFullYear(),
  tagline = "Enhance your AI prompts with intelligent analysis and refinement."
}) => {
  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string, external?: boolean) => {
    if (!external && onNavigate) {
      event.preventDefault();
      onNavigate(href);
    }
  };

  const footerStyles: React.CSSProperties = {
    backgroundColor: 'rgba(248, 249, 250, 0.95)',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
    marginTop: 'auto',
    padding: '2rem 0 1rem 0',
    color: '#6b7280',
    fontSize: '0.875rem'
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem'
  };

  const brandSectionStyles: React.CSSProperties = {
    textAlign: 'center',
    maxWidth: '600px'
  };

  const logoStyles: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#646cff',
    marginBottom: '0.5rem',
    display: 'block'
  };

  const taglineStyles: React.CSSProperties = {
    color: '#6b7280',
    lineHeight: '1.6',
    margin: 0
  };

  const linksSectionStyles: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '2rem',
    alignItems: 'center'
  };

  const linkStyles: React.CSSProperties = {
    color: '#6b7280',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem'
  };

  const linkHoverStyles: React.CSSProperties = {
    color: '#646cff'
  };

  const copyrightStyles: React.CSSProperties = {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '0.75rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(0, 0, 0, 0.05)',
    width: '100%'
  };

  const separatorStyles: React.CSSProperties = {
    color: '#d1d5db',
    margin: '0 0.5rem'
  };

  // Media query styles for mobile and dark mode
  const mediaQueryStyles = `
    @media (prefers-color-scheme: dark) {
      .footer {
        background-color: rgba(31, 41, 55, 0.95) !important;
        border-top-color: rgba(255, 255, 255, 0.1) !important;
        color: #9ca3af !important;
      }
      .footer .logo {
        color: #646cff !important;
      }
      .footer .tagline {
        color: #9ca3af !important;
      }
      .footer .footer-link {
        color: #9ca3af !important;
      }
      .footer .footer-link:hover {
        color: #646cff !important;
      }
      .footer .copyright {
        color: #6b7280 !important;
        border-top-color: rgba(255, 255, 255, 0.1) !important;
      }
      .footer .separator {
        color: #4b5563 !important;
      }
    }
    
    @media (max-width: 768px) {
      .footer .links-section {
        flex-direction: column !important;
        gap: 1rem !important;
      }
      .footer .container {
        gap: 1rem !important;
      }
      .footer .brand-section {
        margin-bottom: 0.5rem !important;
      }
    }
    
    @media (max-width: 480px) {
      .footer .links-section {
        gap: 0.75rem !important;
      }
      .footer .links-section .separator {
        display: none !important;
      }
    }
  `;

  return (
    <>
      <style>{mediaQueryStyles}</style>
      <footer 
        className={`footer ${className}`}
        style={footerStyles}
        role="contentinfo"
        aria-label="Site footer"
      >
        <div className="container" style={containerStyles}>
          {/* Brand and Tagline */}
          <section className="brand-section" style={brandSectionStyles}>
            <div className="logo" style={logoStyles}>
              FixYourPrompts
            </div>
            <p className="tagline" style={taglineStyles}>
              {tagline}
            </p>
          </section>

          {/* Footer Links */}
          <nav 
            className="links-section"
            style={linksSectionStyles}
            role="navigation"
            aria-label="Footer navigation"
          >
            {footerLinks.map((link, index) => (
              <React.Fragment key={link.href}>
                {index > 0 && <span className="separator" style={separatorStyles}>•</span>}
                <a
                  href={link.href}
                  className="footer-link"
                  style={linkStyles}
                  aria-label={link.ariaLabel || link.label}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  onClick={(e) => handleLinkClick(e, link.href, link.external)}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, { ...linkStyles, ...linkHoverStyles });
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, linkStyles);
                  }}
                >
                  {link.label}
                </a>
              </React.Fragment>
            ))}
          </nav>

          {/* Copyright */}
          <div className="copyright" style={copyrightStyles}>
            © {copyrightYear} FixYourPrompts. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;