import type { Meta, StoryObj } from '@storybook/react';
// import { action } from '@storybook/addon-actions';
// // import { fn } from '@storybook/test';
import { PromptInput } from './PromptInput';
import type { PromptInputProps } from '../../types/components';

/**
 * PromptInput is the main input component for entering prompts to be analyzed.
 * It features a multi-line textarea with character counting, keyboard shortcuts,
 * and comprehensive accessibility support.
 * 
 * ## Features
 * - Multi-line textarea input with auto-resize
 * - Character count display with visual feedback for limits
 * - Submit via button click or Ctrl+Enter keyboard shortcut
 * - Error state handling with ARIA support
 * - Disabled state support
 * - Comprehensive accessibility features
 * 
 * ## Usage
 * The component is controlled, meaning you need to manage the value state
 * externally and pass it via the `value` prop.
 */
const meta: Meta<typeof PromptInput> = {
  title: 'Components/PromptInput',
  component: PromptInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A comprehensive prompt input component with built-in validation, character counting, and accessibility features.'
      }
    }
  },
  // Define the prop types for better controls
  argTypes: {
    value: {
      control: 'text',
      description: 'Current value of the prompt input'
    },
    onChange: {
      action: 'value changed',
      description: 'Called when the input value changes'
    },
    onSubmit: {
      action: 'prompt submitted',
      description: 'Called when the prompt is submitted (button click or Ctrl+Enter)'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input field'
    },
    maxLength: {
      control: { type: 'number', min: 0, max: 10000, step: 50 },
      description: 'Maximum allowed character length'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled'
    },
    error: {
      control: 'text',
      description: 'Error message to display below the input'
    }
  },
  // Default args for all stories
  args: {
    onChange: (value: string) => console.log('value changed:', value),
    onSubmit: (prompt: string) => console.log('prompt submitted:', prompt),
  },
  // Tags for organization
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state of the PromptInput component with basic functionality.
 */
export const Default: Story = {
  args: {
    value: '',
    placeholder: 'Enter your prompt here...',
  },
};

/**
 * PromptInput with some initial text content to show how it appears with content.
 */
export const WithText: Story = {
  args: {
    value: 'Write a comprehensive guide about machine learning that covers the basics and advanced topics.',
    placeholder: 'Enter your prompt here...',
  },
};

/**
 * PromptInput with a character limit to demonstrate the character counter feature.
 */
export const WithCharacterLimit: Story = {
  args: {
    value: 'This prompt has a character limit of 200 characters. You can see the character count in the bottom right.',
    placeholder: 'Enter your prompt here...',
    maxLength: 200,
  },
};

/**
 * PromptInput approaching the character limit to show warning styling.
 */
export const NearCharacterLimit: Story = {
  args: {
    value: 'This is a very long prompt that is approaching the character limit. The character counter should show warning colors when you get close to the limit. Let me add more text to reach',
    placeholder: 'Enter your prompt here...',
    maxLength: 200,
  },
};

/**
 * PromptInput that has exceeded the character limit (though the component prevents this via maxLength).
 */
export const OverCharacterLimit: Story = {
  args: {
    value: 'This is a very long prompt that has exceeded the character limit. The character counter should show error colors when you go over the limit. This demonstrates the visual feedback when the limit is exceeded.',
    placeholder: 'Enter your prompt here...',
    maxLength: 150,
  },
};

/**
 * PromptInput in an error state with an error message displayed.
 */
export const WithError: Story = {
  args: {
    value: 'This prompt has an error',
    placeholder: 'Enter your prompt here...',
    error: 'Please enter a more detailed prompt. Your prompt should be at least 20 characters long.',
  },
};

/**
 * PromptInput in a disabled state to show how it appears when interaction is disabled.
 */
export const Disabled: Story = {
  args: {
    value: 'This input is disabled and cannot be edited',
    placeholder: 'Enter your prompt here...',
    disabled: true,
  },
};

/**
 * PromptInput with a custom placeholder text to show customization options.
 */
export const CustomPlaceholder: Story = {
  args: {
    value: '',
    placeholder: 'Describe your AI task in detail. Be specific about what you want to achieve...',
  },
};

/**
 * PromptInput with both character limit and error state to show combined functionality.
 */
export const ErrorWithCharacterLimit: Story = {
  args: {
    value: 'Short prompt',
    placeholder: 'Enter your prompt here...',
    maxLength: 500,
    error: 'Your prompt is too short. Please provide more details about what you want to achieve.',
  },
};

/**
 * PromptInput with very long text to demonstrate text wrapping and textarea behavior.
 */
export const LongText: Story = {
  args: {
    value: `Please analyze this comprehensive marketing strategy for a new SaaS product targeting small to medium businesses in the healthcare sector. The product is a patient management system that includes features like appointment scheduling, billing integration, medical records management, and telemedicine capabilities. 

I need the analysis to cover:
1. Market positioning against competitors
2. Pricing strategy recommendations
3. Key messaging for different buyer personas
4. Channel partner opportunities
5. Content marketing approach
6. Risk assessment and mitigation strategies

The target market includes:
- Private practice physicians (1-10 doctors)
- Small medical clinics (2-5 locations)  
- Specialty practices (dermatology, orthopedics, etc.)
- Telehealth startups

Budget constraints: $500K marketing budget for the first year
Timeline: 18-month go-to-market plan
Competition: Epic MyChart, Athenahealth, Practice Fusion

Please provide specific, actionable recommendations with supporting rationale for each suggestion.`,
    placeholder: 'Enter your prompt here...',
    maxLength: 2000,
  },
};

/**
 * Interactive example that shows real-time character counting and state changes.
 */
export const Interactive: Story = {
  args: {
    value: 'Start typing to see the character count update in real-time...',
    placeholder: 'Type here to test the interactive features...',
    maxLength: 300,
  },
  play: async ({ canvasElement, args }) => {
    // This play function can be used for interaction testing
    // For now, it's just a placeholder showing how to set up interactions
  },
};

/**
 * Test various edge cases and accessibility features.
 */
export const AccessibilityTest: Story = {
  args: {
    value: '',
    placeholder: 'This story tests accessibility features like ARIA labels and keyboard navigation',
    maxLength: 100,
  },
  parameters: {
    docs: {
      description: {
        story: `
This story is specifically designed to test accessibility features:
- ARIA labels and descriptions
- Keyboard navigation (Tab, Ctrl+Enter for submit)
- Screen reader compatibility
- Error state announcements
- Focus management
        `
      }
    }
  },
};