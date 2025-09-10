import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
// import { fn } from '@storybook/test';
import { Header } from './Header';
import type { HeaderProps } from '../../types/components';

/**
 * Header provides the main navigation for the FixYourPrompts application.
 * It features responsive design that adapts to different screen sizes with
 * a collapsible mobile menu and modern, accessible navigation.
 * 
 * ## Features
 * - App branding and logo with clickable home link
 * - Primary navigation menu with Home, Help, and About pages
 * - Responsive design that collapses to hamburger menu on mobile
 * - Sticky positioning that stays at the top while scrolling
 * - Accessible navigation with proper ARIA labels and landmarks
 * - Smooth animations and hover effects
 * - Support for custom navigation handlers
 * - Dark mode support with CSS media queries
 * 
 * ## Navigation Items
 * - **Home**: Main application page
 * - **Help**: Documentation and support resources
 * - **About**: Information about FixYourPrompts
 * 
 * ## Responsive Behavior
 * - Desktop: Horizontal navigation menu always visible
 * - Mobile (< 768px): Collapsible hamburger menu
 */
const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main navigation header component with responsive design, mobile menu, and accessibility features.'
      }
    }
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Optional CSS class name for custom styling'
    },
    mobileMenuOpen: {
      control: 'boolean',
      description: 'Whether the mobile menu is open by default'
    },
    onNavigate: {
      action: 'navigate',
      description: 'Callback function called when navigation items are clicked'
    }
  },
  args: {
    onNavigate: action('navigate'),
    className: '',
    mobileMenuOpen: false
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default header state with standard navigation.
 */
export const Default: Story = {
  args: {},
};

/**
 * Header with custom CSS class for styling demonstration.
 */
export const WithCustomClass: Story = {
  args: {
    className: 'custom-header-style',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how to apply custom CSS classes to the header component.'
      }
    }
  }
};

/**
 * Header with mobile menu open by default.
 */
export const MobileMenuOpen: Story = {
  args: {
    mobileMenuOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the header with the mobile menu expanded. This is useful for testing mobile navigation behavior.'
      }
    }
  }
};

/**
 * Mobile viewport simulation to show responsive behavior.
 */
export const MobileView: Story = {
  args: {},
  parameters: {
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
      },
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Simulates mobile viewport to demonstrate responsive header behavior with hamburger menu.'
      }
    }
  }
};

/**
 * Tablet viewport simulation to show medium screen behavior.
 */
export const TabletView: Story = {
  args: {},
  parameters: {
    viewport: {
      viewports: {
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
      },
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Simulates tablet viewport to show header behavior at medium screen sizes.'
      }
    }
  }
};

/**
 * Desktop viewport with full navigation visible.
 */
export const DesktopView: Story = {
  args: {},
  parameters: {
    viewport: {
      viewports: {
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1200px',
            height: '900px',
          },
        },
      },
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story: 'Shows the header on desktop screens with full horizontal navigation menu.'
      }
    }
  }
};

/**
 * Header with custom navigation handler for SPA routing.
 */
export const WithCustomNavigation: Story = {
  args: {
    onNavigate: (path: string) => {
      action('navigate')(path);
      console.log(`Navigating to: ${path}`);
      // In a real app, this would integrate with your router
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates custom navigation handling, useful for single-page applications with client-side routing.'
      }
    }
  }
};

/**
 * Dark mode preview (simulated with CSS media query).
 */
export const DarkModePreview: Story = {
  args: {},
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#1a1a1a',
        },
      ],
    },
    docs: {
      description: {
        story: 'Simulates dark mode appearance. The actual dark mode is handled by CSS media queries for `prefers-color-scheme: dark`.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ 
        backgroundColor: '#1a1a1a',
        minHeight: '100vh',
        color: 'white',
        // Simulate dark mode media query
        filter: 'invert(1) hue-rotate(180deg)'
      }}>
        <div style={{ filter: 'invert(1) hue-rotate(180deg)' }}>
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * Interactive story for testing navigation and menu functionality.
 */
export const Interactive: Story = {
  args: {},
  play: async ({ canvasElement, args }) => {
    // This could include interaction tests for:
    // - Clicking on navigation links
    // - Opening/closing mobile menu
    // - Keyboard navigation testing
    // - Logo click functionality
    // For now, it's a placeholder showing the structure
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive version for testing navigation clicks, mobile menu toggle, and keyboard navigation.'
      }
    }
  }
};

/**
 * Accessibility testing story with enhanced a11y checks.
 */
export const AccessibilityTest: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: `
This story tests accessibility features including:
- Proper semantic HTML with banner role and navigation landmarks
- ARIA labels for navigation elements and mobile menu button
- Keyboard navigation support (Tab, Enter, Space)
- Screen reader compatibility with descriptive link text
- Focus management and visual focus indicators
- Mobile menu ARIA states (expanded/collapsed)
        `
      }
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'keyboard-accessible',
            enabled: true,
          },
          {
            id: 'aria-roles',
            enabled: true,
          },
          {
            id: 'landmark-navigation',
            enabled: true,
          }
        ]
      }
    }
  },
};

/**
 * Header in a content context to show sticky positioning.
 */
export const WithContentBelow: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div>
        <Story />
        <div style={{ 
          padding: '2rem',
          minHeight: '150vh',
          background: 'linear-gradient(to bottom, #f3f4f6, #e5e7eb)'
        }}>
          <h1>Page Content</h1>
          <p>
            This demonstrates how the header behaves with content below it. 
            The header uses sticky positioning to stay at the top when scrolling.
          </p>
          <p>
            Scroll down to see the sticky header behavior in action. The header
            will remain visible at the top of the viewport while the content
            scrolls beneath it.
          </p>
          {/* Add more content to enable scrolling */}
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i}>
              This is paragraph {i + 1} to create scrollable content. 
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          ))}
        </div>
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Shows the header with content below to demonstrate sticky positioning behavior during scrolling.'
      }
    }
  }
};