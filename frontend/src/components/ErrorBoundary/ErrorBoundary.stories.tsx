import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from '@storybook/addon-actions';
// import { fn } from '@storybook/test';
import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
// import type { ErrorBoundaryProps } from '../../types/components';

// Mock components for testing error scenarios
const ThrowError: React.FC<{ message?: string; shouldThrow?: boolean }> = ({ 
  message = 'Test error', 
  shouldThrow = true 
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error - component renders normally</div>;
};

const WorkingComponent: React.FC = () => (
  <div style={{
    padding: '2rem',
    backgroundColor: '#f0f9ff',
    border: '2px solid #0ea5e9',
    borderRadius: '0.5rem',
    textAlign: 'center'
  }}>
    <h3 style={{ color: '#0369a1', marginTop: 0 }}>✅ Component Working</h3>
    <p>This component renders successfully without any errors.</p>
  </div>
);

// Custom fallback component for demonstration
const CustomErrorFallback: React.FC<{ 
  error: Error; 
  resetError: () => void;
  errorId?: string;
  retryCount?: number;
}> = ({ error, resetError, errorId, retryCount = 0 }) => (
  <div style={{
    padding: '2rem',
    margin: '1rem',
    backgroundColor: '#fef3cd',
    border: '2px solid #f59e0b',
    borderRadius: '0.75rem',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
    <h2 style={{ color: '#92400e', marginTop: 0, marginBottom: '1rem' }}>
      Oops! Something went wrong
    </h2>
    <details style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Error Details
      </summary>
      <pre style={{
        backgroundColor: '#fef2f2',
        padding: '1rem',
        borderRadius: '0.25rem',
        fontSize: '0.875rem',
        overflow: 'auto',
        border: '1px solid #fca5a5'
      }}>
        {error.message}
      </pre>
      {errorId && <p><strong>Error ID:</strong> {errorId}</p>}
      {retryCount > 0 && <p><strong>Retry Count:</strong> {retryCount}</p>}
    </details>
    <button
      onClick={resetError}
      style={{
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      Try Again
    </button>
  </div>
);

/**
 * ErrorBoundary is a React component that catches JavaScript errors anywhere in the
 * child component tree, logs those errors, and displays a fallback UI instead of
 * the crashed component tree.
 * 
 * ## Features
 * - Catches errors during rendering, lifecycle methods, and constructors
 * - Displays customizable fallback UI when errors occur
 * - Logs error details for debugging and monitoring
 * - Supports error recovery with reset functionality
 * - Provides error tracking with unique error IDs
 * - Counts retry attempts for better error monitoring
 * - Supports custom error fallback components
 * - Accessible error messages with proper ARIA roles
 * 
 * ## Error Handling
 * - **Rendering Errors**: Catches errors during component rendering
 * - **Lifecycle Errors**: Catches errors in lifecycle methods
 * - **Event Handler Errors**: Note - does NOT catch errors in event handlers
 * - **Async Errors**: Note - does NOT catch errors in async code
 * 
 * ## Usage
 * Wrap components that might throw errors. Commonly used at:
 * - App root level for global error handling
 * - Route level for page-specific error boundaries
 * - Component level for isolated error handling
 */
const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A React Error Boundary component that catches errors in child components and displays a fallback UI with error recovery options.'
      }
    }
  },
  argTypes: {
    children: {
      description: 'Child components to wrap with error boundary protection',
      control: { type: null } // We'll handle this through stories
    },
    fallback: {
      description: 'Custom fallback component to render when an error occurs',
      control: { type: null }
    },
    onError: {
      action: 'error caught',
      description: 'Callback function called when an error is caught'
    },
    name: {
      control: 'text',
      description: 'Optional name for the error boundary (used for tracking)'
    }
  },
  args: {
    onError: action('error caught'),
    name: 'StoryErrorBoundary'
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ErrorBoundary with working children - shows normal operation.
 */
export const WithWorkingChildren: Story = {
  args: {
    children: <WorkingComponent />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the ErrorBoundary with children that render successfully without errors.'
      }
    }
  }
};

/**
 * ErrorBoundary with default fallback UI when an error occurs.
 */
export const WithErrorDefaultFallback: Story = {
  args: {
    children: <ThrowError message="This is a test error to demonstrate the default fallback UI" />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the default error fallback UI when a child component throws an error.'
      }
    }
  }
};

/**
 * ErrorBoundary with custom fallback component.
 */
export const WithCustomFallback: Story = {
  args: {
    children: <ThrowError message="Custom fallback error message" />,
    fallback: CustomErrorFallback,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how to use a custom fallback component instead of the default error UI.'
      }
    }
  }
};

/**
 * ErrorBoundary with multiple child components.
 */
export const WithMultipleChildren: Story = {
  args: {
    children: (
      <div>
        <WorkingComponent />
        <div style={{ margin: '1rem 0' }}>
          <ThrowError message="Error in second component" />
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how the ErrorBoundary handles errors when there are multiple child components. If one throws an error, the entire boundary shows the fallback.'
      }
    }
  }
};

/**
 * ErrorBoundary with named boundary for tracking.
 */
export const WithNamedBoundary: Story = {
  args: {
    children: <ThrowError message="Error in named boundary" />,
    name: 'ProductListBoundary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates using a named error boundary for better error tracking and debugging.'
      }
    }
  }
};

/**
 * Nested ErrorBoundary components.
 */
export const NestedBoundaries: Story = {
  render: (args) => (
    <ErrorBoundary name="OuterBoundary" onError={args.onError}>
      <div style={{ padding: '1rem', border: '2px dashed #10b981', borderRadius: '0.5rem' }}>
        <h3>Outer Error Boundary</h3>
        <WorkingComponent />
        <div style={{ marginTop: '1rem' }}>
          <ErrorBoundary name="InnerBoundary" onError={args.onError}>
            <div style={{ padding: '1rem', border: '2px dashed #f59e0b', borderRadius: '0.5rem' }}>
              <h4>Inner Error Boundary</h4>
              <ThrowError message="Error in inner boundary" />
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows nested ErrorBoundary components where the inner boundary catches errors before they reach the outer boundary.'
      }
    }
  }
};

/**
 * ErrorBoundary that can be reset to try rendering again.
 */
export const WithErrorRecovery: Story = {
  render: (args) => {
    const [shouldError, setShouldError] = React.useState(true);
    
    return (
      <div>
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <button
            onClick={() => setShouldError(!shouldError)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: shouldError ? '#ef4444' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            {shouldError ? 'Component will error' : 'Component will work'}
          </button>
        </div>
        <ErrorBoundary {...args} key={shouldError ? 'error' : 'working'}>
          <ThrowError 
            message="Toggle error recovery test" 
            shouldThrow={shouldError}
          />
        </ErrorBoundary>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example showing error recovery. Use the button to toggle between error and working states.'
      }
    }
  }
};

/**
 * ErrorBoundary with different types of errors.
 */
export const DifferentErrorTypes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      <ErrorBoundary name="TypeError" onError={args.onError}>
        <ThrowError message="TypeError: Cannot read property 'foo' of undefined" />
      </ErrorBoundary>
      
      <ErrorBoundary name="ReferenceError" onError={args.onError}>
        <ThrowError message="ReferenceError: undefined is not defined" />
      </ErrorBoundary>
      
      <ErrorBoundary name="RangeError" onError={args.onError}>
        <ThrowError message="RangeError: Maximum call stack size exceeded" />
      </ErrorBoundary>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows how the ErrorBoundary handles different types of JavaScript errors.'
      }
    }
  }
};

/**
 * ErrorBoundary accessibility testing.
 */
export const AccessibilityTest: Story = {
  args: {
    children: <ThrowError message="Accessibility test error" />,
    fallback: ({ error, resetError, errorId, retryCount }) => (
      <div 
        role="alert"
        aria-live="assertive"
        style={{
          padding: '2rem',
          backgroundColor: '#fef2f2',
          border: '2px solid #ef4444',
          borderRadius: '0.5rem'
        }}
      >
        <h2 id="error-title">An error occurred</h2>
        <div aria-describedby="error-title">
          <p>The application encountered an error and cannot continue.</p>
          <details>
            <summary>Technical details</summary>
            <p>Error: {error.message}</p>
            {errorId && <p>Error ID: {errorId}</p>}
            {retryCount && <p>Retry attempt: {retryCount}</p>}
          </details>
        </div>
        <button 
          onClick={resetError}
          aria-label="Try to reload the failed component"
        >
          Try Again
        </button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: `
This story tests accessibility features of the ErrorBoundary including:
- Proper use of role="alert" for error announcements
- ARIA live regions for screen reader updates
- Descriptive error messages and labels
- Keyboard accessible retry functionality
- Semantic HTML structure with proper headings
        `
      }
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'aria-roles',
            enabled: true,
          },
          {
            id: 'color-contrast',
            enabled: true,
          }
        ]
      }
    }
  },
};

/**
 * Performance impact demonstration.
 */
export const PerformanceTest: Story = {
  render: (args) => (
    <div>
      <p style={{ marginBottom: '1rem' }}>
        This demonstrates that ErrorBoundary has minimal performance impact on working components.
      </p>
      <ErrorBoundary {...args}>
        <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {Array.from({ length: 100 }, (_, i) => (
            <div 
              key={i}
              style={{
                padding: '0.5rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.25rem',
                textAlign: 'center',
                fontSize: '0.875rem'
              }}
            >
              Component {i + 1}
            </div>
          ))}
        </div>
      </ErrorBoundary>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows that ErrorBoundary can wrap many components without performance issues when no errors occur.'
      }
    }
  }
};

/**
 * Real-world usage example wrapping a complex component.
 */
export const RealWorldExample: Story = {
  render: (args): JSX.Element => {
    const MockComplexComponent = (): JSX.Element => (
      <div style={{
        padding: '2rem',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        backgroundColor: '#ffffff'
      }}>
        <h3>Complex Component</h3>
        <p>This represents a complex component that might fail in production.</p>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(2, 1fr)', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
            <h4>Feature A</h4>
            <p>Working normally</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
            <h4>Feature B</h4>
            <p>Also working</p>
          </div>
        </div>
      </div>
    );

    return (
      <div>
        <h2>Application with Error Boundaries</h2>
        
        {/* Header - no error boundary needed for static content */}
        <div style={{ padding: '1rem', backgroundColor: '#3b82f6', color: 'white', marginBottom: '1rem' }}>
          App Header
        </div>

        {/* Main content with error boundary */}
        <ErrorBoundary name="MainContent" onError={args.onError}>
          <MockComplexComponent />
        </ErrorBoundary>

        {/* Sidebar with separate error boundary */}
        <ErrorBoundary name="Sidebar" onError={args.onError}>
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: '#f3f4f6',
            borderRadius: '0.5rem'
          }}>
            <h4>Sidebar</h4>
            <p>Independent from main content</p>
          </div>
        </ErrorBoundary>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of how to structure ErrorBoundary components in a real application with multiple independent sections.'
      }
    }
  }
};