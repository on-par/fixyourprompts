import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
  parameters: {
    // Actions
    actions: { argTypesRegex: "^on[A-Z].*" },
    
    // Controls
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
      sort: 'alpha',
    },

    // Documentation
    docs: {
      toc: true, // Enable table of contents
    },

    // Accessibility testing
    a11y: {
      // Configuration for accessibility testing
      element: '#root',
      config: {
        rules: [
          {
            // Disable color-contrast rule for now due to CSS-in-JS
            id: 'color-contrast',
            enabled: false,
          },
        ],
      },
      options: {
        checks: { 'color-contrast': { options: { noScroll: true } } },
        restoreScroll: true,
      },
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations  
      // 'off' - skip a11y checks entirely
      manual: false,
    },

    // Layout options
    layout: 'padded', // default layout for stories

    // Viewport settings for responsive testing
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1200px',
            height: '900px',
          },
        },
        wide: {
          name: 'Wide Desktop',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
      },
    },

    // Background options for testing different themes
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'gray',
          value: '#f8fafc',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
      ],
    },
  },

  // Global arg types
  argTypes: {
    // Common props that many components might have
    className: {
      control: 'text',
      description: 'CSS class name for custom styling',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '""' },
      },
    },
  },

  // Tags for organizing stories
  tags: ['autodocs'],
}

export default preview
