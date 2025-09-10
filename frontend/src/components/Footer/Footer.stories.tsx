import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
// import { fn } from '@storybook/test';
import { Footer } from './Footer';
import type { FooterProps } from '../../types/components';

/**
 * Footer provides essential links and information for the FixYourPrompts application.
 * It's positioned at the bottom of pages and includes legal links, support resources,
 * and copyright information with professional, accessible design.
 * 
 * ## Features
 * - App tagline and brief description
 * - Essential navigation links (Privacy Policy, Terms of Service, Help)
 * - Copyright notice with customizable year
 * - Responsive design that adapts to different screen sizes
 * - Accessible navigation with proper ARIA labels and landmarks
 * - Support for custom navigation handlers (useful for SPAs)
 * - Clean, minimal design that complements the app
 * - Optional custom tagline support
 * 
 * ## Links Included
 * - **Privacy Policy**: Link to privacy policy page
 * - **Terms of Service**: Link to terms and conditions
 * - **Help**: Link to help and support resources
 * 
 * ## Usage
 * Typically placed at the bottom of page layouts. Can integrate with routing
 * systems through the `onNavigate` callback for single-page applications.
 */
const meta: Meta<typeof Footer> = {
  title: 'Components/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main footer component with essential links, copyright information, and accessibility features.'
      }
    }
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Optional CSS class name for custom styling'
    },
    onNavigate: {
      action: 'navigate',
      description: 'Callback function called when footer links are clicked'
    },
    copyrightYear: {
      control: { type: 'number', min: 2020, max: 2030 },
      description: 'Copyright year (defaults to current year)'
    },
    tagline: {
      control: 'text',
      description: 'Custom tagline text (optional)'
    }
  },
  args: {
    onNavigate: action('navigate'),
    className: '',
    copyrightYear: new Date().getFullYear(),
    tagline: "Enhance your AI prompts with intelligent analysis and refinement."
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default footer with standard configuration.
 */
export const Default: Story = {
  args: {},
};

/**
 * Footer with custom CSS class for styling demonstration.
 */
export const WithCustomClass: Story = {
  args: {
    className: 'custom-footer-style',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how to apply custom CSS classes to the footer component.'
      }
    }
  }
};

/**
 * Footer with custom copyright year.
 */
export const CustomCopyrightYear: Story = {
  args: {
    copyrightYear: 2023,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how to set a custom copyright year instead of using the current year.'
      }
    }
  }
};

/**
 * Footer with custom tagline.
 */
export const CustomTagline: Story = {
  args: {
    tagline: "Transform your prompts into powerful AI interactions with expert guidance and analysis.",
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates using a custom tagline instead of the default one.'
      }
    }
  }
};

/**
 * Footer with both custom year and tagline.
 */
export const FullyCustomized: Story = {
  args: {
    copyrightYear: 2024,
    tagline: "Your AI prompt optimization toolkit - powered by advanced analysis and educational guidance.",
    className: 'premium-footer'
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a fully customized footer with custom year, tagline, and CSS class.'
      }
    }
  }
};

/**
 * Footer with custom navigation handler for SPA routing.
 */
export const WithCustomNavigation: Story = {
  args: {
    onNavigate: (path: string) => {
      action('navigate')(path);
      console.log(`Footer navigation to: ${path}`);
      // In a real app, this would integrate with your router
      // Example: router.push(path) or history.push(path)
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates custom navigation handling for single-page applications with client-side routing.'
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
        story: 'Simulates mobile viewport to demonstrate responsive footer behavior on small screens.'
      }
    }
  }
};

/**
 * Tablet viewport simulation.
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
        story: 'Shows footer behavior on tablet-sized screens.'
      }
    }
  }
};

/**
 * Desktop viewport with full layout.
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
        story: 'Shows the footer on desktop screens with full horizontal layout.'
      }
    }
  }
};

/**
 * Footer in a complete page context to show positioning.
 */
export const InPageContext: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column'
      }}>
        {/* Mock header */}
        <div style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #e1e5e9',
          padding: '1rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#646cff' }}>
            FixYourPrompts
          </h1>
        </div>
        
        {/* Main content area */}
        <main style={{ 
          flex: '1', 
          padding: '2rem',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2>Main Content Area</h2>
            <p>
              This demonstrates how the footer appears in a complete page layout.
              The footer is positioned at the bottom of the page content.
            </p>
            <p>
              In a real application, the footer would be placed at the end of your
              main content area, typically within your page layout component.
            </p>
            {/* Add some content to show realistic page length */}
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} style={{ 
                marginBottom: '1.5rem', 
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3>Content Section {i + 1}</h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco.
                </p>
              </div>
            ))}
          </div>
        </main>
        
        {/* Footer */}
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Shows the footer positioned at the bottom of a complete page layout with header and main content.'
      }
    }
  }
};

/**
 * Dark mode preview (simulated).
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
        story: 'Preview of footer appearance in dark mode. Actual dark mode would be handled by CSS media queries.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ 
        backgroundColor: '#1a1a1a',
        minHeight: '100vh',
        padding: '2rem 0',
        // Simulate dark mode appearance
      }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Interactive story for testing link functionality.
 */
export const Interactive: Story = {
  args: {},
  play: async ({ canvasElement, args }) => {
    // This could include interaction tests for:
    // - Clicking on footer links
    // - Keyboard navigation testing
    // - Link accessibility testing
    // For now, it's a placeholder showing the structure
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive version for testing footer link clicks and keyboard navigation.'
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
- Proper semantic HTML with contentinfo landmark
- ARIA labels for footer links with descriptive text
- Keyboard navigation support (Tab, Enter)
- Screen reader compatibility with meaningful link text
- Focus management and visual focus indicators
- Proper contrast ratios for text and links
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
            id: 'landmark-contentinfo',
            enabled: true,
          }
        ]
      }
    }
  },
};

/**
 * Minimal footer with just copyright (no custom tagline).
 */
export const MinimalVersion: Story = {
  args: {
    tagline: "",  // Empty tagline for minimal version
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal footer version with just links and copyright, no tagline.'
      }
    }
  }
};

/**
 * Footer with very long custom tagline to test text wrapping.
 */
export const LongTagline: Story = {
  args: {
    tagline: "Transform your AI interactions with FixYourPrompts - the comprehensive platform for prompt analysis, refinement, and optimization that helps you achieve better results through intelligent suggestions, educational guidance, and real-time feedback on your prompt quality.",
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests footer layout with a very long tagline to ensure proper text wrapping and layout.'
      }
    }
  }
};