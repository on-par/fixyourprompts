import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from '@storybook/addon-actions';
// import { fn } from '@storybook/test';
import EducationPanel from './EducationPanel';
import type { EducationTip, EducationCategory } from '../../types/components';

// Helper function to create mock education categories
const createMockCategory = (overrides: Partial<EducationCategory> = {}): EducationCategory => ({
  id: 'basics',
  name: 'Prompt Basics',
  description: 'Fundamental concepts of effective prompt writing',
  icon: '📝',
  ...overrides
});

// Helper function to create mock education tips
const createMockTip = (overrides: Partial<EducationTip> = {}): EducationTip => ({
  id: 'tip-1',
  title: 'Be Specific',
  content: 'Specific prompts yield better results than vague ones.',
  category: createMockCategory(),
  level: 'beginner',
  examples: ['Instead of "Write code", try "Write a Python function to calculate compound interest"'],
  ...overrides
});

// Mock categories
const mockCategories = {
  basics: createMockCategory({
    id: 'basics',
    name: 'Prompt Basics',
    description: 'Fundamental concepts of effective prompt writing',
    icon: '📝'
  }),
  advanced: createMockCategory({
    id: 'advanced',
    name: 'Advanced Techniques',
    description: 'Advanced strategies for complex prompts',
    icon: '🧠'
  }),
  examples: createMockCategory({
    id: 'examples',
    name: 'Examples & Templates',
    description: 'Real-world examples and reusable templates',
    icon: '📋'
  }),
  troubleshooting: createMockCategory({
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Common issues and how to fix them',
    icon: '🔧'
  })
};

// Mock education tips
const mockTips: EducationTip[] = [
  createMockTip({
    id: 'tip-1',
    title: 'Be Specific and Clear',
    content: 'Vague prompts lead to vague responses. Always include specific details about what you want to achieve, who your audience is, and what format you prefer.',
    category: mockCategories.basics,
    level: 'beginner',
    examples: [
      'Instead of: "Write about AI"',
      'Try: "Write a 500-word blog post about AI in healthcare for small clinic owners, focusing on practical applications and ROI"'
    ]
  }),
  createMockTip({
    id: 'tip-2',
    title: 'Provide Context and Background',
    content: 'Help the AI understand your situation by providing relevant background information, constraints, and the broader context of your request.',
    category: mockCategories.basics,
    level: 'beginner',
    examples: [
      'Good context: "I\'m a startup founder with a $50K marketing budget, targeting millennials in urban areas"',
      'Poor context: "Help me with marketing"'
    ]
  }),
  createMockTip({
    id: 'tip-3',
    title: 'Use Examples and Templates',
    content: 'Show the AI what you want by providing examples of the desired output format, style, or similar successful work.',
    category: mockCategories.examples,
    level: 'intermediate',
    examples: [
      'Include sample formats: "Format the response like this example..."',
      'Reference similar work: "Write in a style similar to Seth Godin\'s blog posts"'
    ]
  }),
  createMockTip({
    id: 'tip-4',
    title: 'Structure Complex Requests',
    content: 'For complex tasks, break your request into numbered steps, use bullet points, and organize information with clear headings.',
    category: mockCategories.advanced,
    level: 'advanced',
    examples: [
      'Use numbered lists for multi-step processes',
      'Group related requirements under clear headings',
      'Separate "must-have" from "nice-to-have" requirements'
    ]
  }),
  createMockTip({
    id: 'tip-5',
    title: 'Define Success Criteria',
    content: 'Clearly state how you\'ll measure success and what the ideal outcome looks like. This helps the AI understand your goals.',
    category: mockCategories.advanced,
    level: 'intermediate',
    examples: [
      'Success criteria: "The email should have a 25%+ open rate and drive traffic to our landing page"',
      'Clear outcomes: "I want 3 different headlines that emphasize cost savings and time efficiency"'
    ]
  }),
  createMockTip({
    id: 'tip-6',
    title: 'Iterate and Refine',
    content: 'Don\'t expect perfect results on the first try. Use follow-up prompts to refine, clarify, or expand on the initial response.',
    category: mockCategories.troubleshooting,
    level: 'intermediate',
    examples: [
      'Follow-up: "Make it more conversational and add specific examples"',
      'Refinement: "Focus more on the technical aspects and less on the business case"'
    ]
  })
];

/**
 * EducationPanel displays educational tips and guidance to help users write better prompts.
 * It features expandable tips organized by category and difficulty level, with practical
 * examples and actionable advice.
 * 
 * ## Features
 * - Tips organized by category (Basics, Advanced, Examples, Troubleshooting)
 * - Difficulty levels (Beginner, Intermediate, Advanced)
 * - Expandable content with detailed explanations
 * - Practical examples and before/after comparisons
 * - Category filtering to focus on specific topics
 * - User level-based content filtering
 * - Interactive expansion with keyboard support
 * - Comprehensive accessibility features
 * 
 * ## Categories
 * - **Prompt Basics**: Fundamental concepts and best practices
 * - **Advanced Techniques**: Complex strategies for sophisticated prompts
 * - **Examples & Templates**: Real-world examples and reusable patterns
 * - **Troubleshooting**: Common issues and solutions
 */
const meta: Meta<typeof EducationPanel> = {
  title: 'Components/EducationPanel',
  component: EducationPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'An educational panel that provides tips, guidance, and best practices for effective prompt writing, organized by category and skill level.'
      }
    }
  },
  argTypes: {
    tips: {
      description: 'Array of educational tips to display',
      control: { type: 'object' }
    },
    category: {
      description: 'Category filter for tips (optional)',
      control: { type: 'object' }
    },
    onTipExpand: {
      action: 'tip expanded',
      description: 'Called when user expands a tip for more details'
    },
    userLevel: {
      control: { type: 'select' },
      options: ['beginner', 'intermediate', 'advanced'],
      description: 'User\'s current learning level for content filtering'
    }
  },
  args: {
    onTipExpand: action('tip expanded'),
    userLevel: 'beginner'
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state showing all tips for beginner users.
 */
export const Default: Story = {
  args: {
    tips: mockTips,
    userLevel: 'beginner',
  },
};

/**
 * Empty state when no tips are available.
 */
export const EmptyState: Story = {
  args: {
    tips: [],
    userLevel: 'beginner',
  },
};

/**
 * Tips filtered to show only basics category.
 */
export const BasicsOnly: Story = {
  args: {
    tips: mockTips,
    category: mockCategories.basics,
    userLevel: 'beginner',
  },
};

/**
 * Advanced tips for experienced users.
 */
export const AdvancedTips: Story = {
  args: {
    tips: mockTips,
    category: mockCategories.advanced,
    userLevel: 'advanced',
  },
};

/**
 * Example-focused tips showing templates and patterns.
 */
export const ExamplesAndTemplates: Story = {
  args: {
    tips: mockTips,
    category: mockCategories.examples,
    userLevel: 'intermediate',
  },
};

/**
 * Troubleshooting tips for common issues.
 */
export const TroubleshootingTips: Story = {
  args: {
    tips: mockTips,
    category: mockCategories.troubleshooting,
    userLevel: 'intermediate',
  },
};

/**
 * Tips for beginner level users.
 */
export const BeginnerLevel: Story = {
  args: {
    tips: mockTips.filter(tip => tip.level === 'beginner'),
    userLevel: 'beginner',
  },
};

/**
 * Tips for intermediate level users.
 */
export const IntermediateLevel: Story = {
  args: {
    tips: mockTips.filter(tip => tip.level === 'intermediate'),
    userLevel: 'intermediate',
  },
};

/**
 * Tips for advanced level users.
 */
export const AdvancedLevel: Story = {
  args: {
    tips: mockTips.filter(tip => tip.level === 'advanced'),
    userLevel: 'advanced',
  },
};

/**
 * Single tip to show individual tip display.
 */
export const SingleTip: Story = {
  args: {
    tips: [mockTips[0]],
    userLevel: 'beginner',
  },
};

/**
 * Tips with very detailed content to test layout.
 */
export const DetailedContent: Story = {
  args: {
    tips: [
      createMockTip({
        id: 'detailed-tip',
        title: 'Comprehensive Prompt Engineering Strategy',
        content: `
Creating effective prompts is both an art and a science. It requires understanding not just what you want to achieve, but how AI models process and respond to different types of instructions. This comprehensive guide covers the essential elements of prompt engineering.

**Key Principles:**
1. **Clarity Over Brevity**: While concise prompts can be effective, clarity should never be sacrificed for brevity. It's better to be explicit about your requirements than to leave room for misinterpretation.

2. **Context is King**: AI models perform significantly better when they understand the broader context of your request. This includes your role, the intended audience, the purpose of the output, and any constraints you're working within.

3. **Iterative Refinement**: The best prompts are rarely perfect on the first attempt. Plan to refine and iterate based on the results you receive.

**Advanced Techniques:**
- Use role-playing to set context ("As a marketing expert...")
- Provide examples of desired output format
- Use constraints to guide the response ("In exactly 3 bullet points...")
- Chain prompts for complex multi-step tasks

**Common Pitfalls to Avoid:**
- Being too vague about desired outcomes
- Not specifying the target audience
- Asking for too many things in a single prompt
- Not providing enough context about your situation
        `,
        category: mockCategories.advanced,
        level: 'advanced',
        examples: [
          'Example 1: Role-based prompting - "As a senior financial advisor speaking to first-time investors, explain the basics of index fund investing in simple terms, focusing on long-term benefits and addressing common fears about market volatility."',
          'Example 2: Constraint-based prompting - "Write exactly 5 email subject lines for a product launch, each under 50 characters, that emphasize urgency and include the word \'exclusive\'."',
          'Example 3: Context-rich prompting - "I\'m a small business owner with a $10,000 monthly marketing budget, competing against larger established companies in the local home services market. Create a 90-day digital marketing strategy that focuses on local SEO and community engagement."'
        ]
      })
    ],
    userLevel: 'advanced',
  },
};

/**
 * Many tips to test performance and scrolling.
 */
export const ManyTips: Story = {
  args: {
    tips: Array.from({ length: 15 }, (_, index) => 
      createMockTip({
        id: `tip-${index}`,
        title: `Tip #${index + 1}: ${['Clarity', 'Context', 'Structure', 'Examples', 'Constraints'][index % 5]}`,
        content: `This is educational tip number ${index + 1}. It provides valuable guidance on effective prompt writing techniques and best practices. The content is designed to be helpful and actionable for users at different skill levels.`,
        category: Object.values(mockCategories)[index % 4],
        level: (['beginner', 'intermediate', 'advanced'] as const)[index % 3],
        examples: [
          `Example ${index + 1}A: This shows a good approach to the technique`,
          `Example ${index + 1}B: This shows what to avoid`
        ]
      })
    ),
    userLevel: 'intermediate',
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests performance and rendering with many educational tips (15 items).'
      }
    }
  }
};

/**
 * Interactive story for testing expansion and user interactions.
 */
export const Interactive: Story = {
  args: {
    tips: mockTips,
    userLevel: 'intermediate',
  },
  play: async ({ canvasElement: _canvasElement, args: _args }) => {
    // This could include interaction tests for:
    // - Clicking on tips to expand them
    // - Keyboard navigation through tips
    // - Category filtering functionality
    // For now, it's a placeholder showing the structure
  },
};

/**
 * Accessibility testing story with enhanced a11y checks.
 */
export const AccessibilityTest: Story = {
  args: {
    tips: mockTips,
    userLevel: 'beginner',
  },
  parameters: {
    docs: {
      description: {
        story: `
This story tests accessibility features including:
- ARIA labels and descriptions for tip cards
- Keyboard navigation (Tab, Enter, Space for expansion)
- Screen reader compatibility with proper headings
- Focus management for expandable content
- Semantic HTML structure with proper roles
- Color contrast for category indicators and level badges
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
            id: 'heading-order',
            enabled: true,
          }
        ]
      }
    }
  },
};

/**
 * Tips with no examples to test edge case handling.
 */
export const NoExamples: Story = {
  args: {
    tips: mockTips.map(tip => ({ ...tip, examples: undefined })),
    userLevel: 'beginner',
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests the component behavior when tips have no examples provided.'
      }
    }
  }
};

/**
 * Tips with different category types to test category filtering.
 */
export const CategoryFiltering: Story = {
  args: {
    tips: mockTips,
    category: mockCategories.basics,
    userLevel: 'beginner',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates category filtering functionality, showing only tips from the "Prompt Basics" category.'
      }
    }
  }
};