import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
// import { fn } from '@storybook/test';
import { AnalysisPanel } from './AnalysisPanel';
import type { AnalysisPanelProps, PromptAnalysis } from '../../types/components';

// Helper function to create mock analysis data
const createMockAnalysis = (overrides: Partial<PromptAnalysis> = {}): PromptAnalysis => ({
  id: 'analysis-1',
  type: 'vagueness',
  score: 0.8,
  message: 'The prompt lacks specific details and could be more precise.',
  severity: 'high',
  suggestions: ['Be more specific about the desired outcome', 'Add context about the target audience'],
  ...overrides
});

const mockAnalyses: PromptAnalysis[] = [
  createMockAnalysis({
    id: 'analysis-1',
    type: 'vagueness',
    score: 0.9,
    message: 'The prompt is too vague and lacks specific requirements. This makes it difficult to provide targeted, actionable results.',
    severity: 'high',
    suggestions: [
      'Specify exactly what you want to achieve',
      'Add details about the target audience or use case',
      'Include examples of what success looks like'
    ]
  }),
  createMockAnalysis({
    id: 'analysis-2',
    type: 'missing_context',
    score: 0.7,
    message: 'Important context is missing that would help provide better results.',
    severity: 'medium',
    suggestions: [
      'Provide background information about your project',
      'Explain the constraints or requirements you\'re working with',
      'Mention any specific tools or platforms you\'re using'
    ]
  }),
  createMockAnalysis({
    id: 'analysis-3',
    type: 'unclear_constraints',
    score: 0.6,
    message: 'The constraints and limitations are not clearly defined.',
    severity: 'medium',
    suggestions: [
      'Specify budget or time constraints',
      'Mention technical limitations or requirements',
      'Clarify the scope of what you\'re asking for'
    ]
  }),
  createMockAnalysis({
    id: 'analysis-4',
    type: 'poor_structure',
    score: 0.4,
    message: 'The prompt structure could be improved for better clarity.',
    severity: 'low',
    suggestions: [
      'Use bullet points or numbered lists for multiple requirements',
      'Separate different aspects of your request into sections',
      'Start with the main goal and then add supporting details'
    ]
  })
];

/**
 * AnalysisPanel displays prompt analysis results with visual severity indicators,
 * expandable suggestions, and interactive selection capabilities. It provides
 * comprehensive feedback on prompt quality and actionable suggestions for improvement.
 * 
 * ## Features
 * - Analysis items sorted by severity (high to low)
 * - Visual severity indicators with color coding
 * - Analysis type display with descriptive icons
 * - Interactive selection with keyboard support
 * - Compact/expanded view modes
 * - Expandable suggestions with detailed explanations
 * - Comprehensive accessibility support
 * - Empty state handling for no analysis results
 * 
 * ## Analysis Types
 * - **Vagueness**: Prompts that lack specific details
 * - **Missing Context**: Prompts missing important background information
 * - **Unclear Constraints**: Prompts without clear limitations or requirements
 * - **Poor Structure**: Prompts with confusing or disorganized presentation
 * - **Tone Inconsistency**: Prompts with unclear or inconsistent tone
 * - **Missing Examples**: Prompts that would benefit from examples
 */
const meta: Meta<typeof AnalysisPanel> = {
  title: 'Components/AnalysisPanel',
  component: AnalysisPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A comprehensive analysis panel that displays prompt analysis results with severity indicators, interactive selection, and actionable suggestions.'
      }
    }
  },
  argTypes: {
    analyses: {
      description: 'Array of analysis results to display',
      control: { type: 'object' }
    },
    onAnalysisSelect: {
      action: 'analysis selected',
      description: 'Called when an analysis item is selected'
    },
    compact: {
      control: 'boolean',
      description: 'Whether to show a compact view of the analysis'
    }
  },
  args: {
    onAnalysisSelect: action('analysis selected'),
    compact: false
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state showing multiple analysis results with different severity levels.
 */
export const Default: Story = {
  args: {
    analyses: mockAnalyses,
  },
};

/**
 * Empty state when no analysis results are available.
 */
export const EmptyState: Story = {
  args: {
    analyses: [],
  },
};

/**
 * Compact view mode with reduced spacing and simplified layout.
 */
export const CompactView: Story = {
  args: {
    analyses: mockAnalyses,
    compact: true,
  },
};

/**
 * Only high severity issues to show critical problems.
 */
export const HighSeverityOnly: Story = {
  args: {
    analyses: [
      createMockAnalysis({
        id: 'critical-1',
        type: 'vagueness',
        severity: 'high',
        message: 'This prompt is extremely vague and provides no actionable information.',
        suggestions: [
          'Start with a clear goal statement',
          'Define exactly what success looks like',
          'Provide specific requirements and constraints'
        ]
      }),
      createMockAnalysis({
        id: 'critical-2',
        type: 'missing_context',
        severity: 'high',
        message: 'Critical context is missing that makes this prompt impossible to fulfill effectively.',
        suggestions: [
          'Explain the business context or use case',
          'Provide background on your current situation',
          'Include relevant technical or domain-specific information'
        ]
      }),
    ],
  },
};

/**
 * Only low severity issues to show minor improvements.
 */
export const LowSeverityOnly: Story = {
  args: {
    analyses: [
      createMockAnalysis({
        id: 'minor-1',
        type: 'poor_structure',
        severity: 'low',
        message: 'The prompt structure could be slightly improved for better readability.',
        suggestions: [
          'Consider using bullet points for multiple items',
          'Break long sentences into shorter, clearer ones'
        ]
      }),
      createMockAnalysis({
        id: 'minor-2',
        type: 'tone_inconsistency',
        severity: 'low',
        message: 'The tone shifts slightly between formal and casual language.',
        suggestions: [
          'Choose either formal or casual tone and stick with it',
          'Review for consistent language style throughout'
        ]
      }),
    ],
  },
};

/**
 * Mixed severity levels to show how different issues are prioritized.
 */
export const MixedSeverity: Story = {
  args: {
    analyses: [
      ...mockAnalyses,
      createMockAnalysis({
        id: 'extra-high',
        type: 'missing_examples',
        severity: 'high',
        message: 'This complex request would greatly benefit from specific examples.',
        suggestions: [
          'Provide examples of similar successful outcomes',
          'Show what you don\'t want as well as what you do want',
          'Include sample formats or templates if relevant'
        ]
      }),
    ],
  },
};

/**
 * Single analysis result to show individual item display.
 */
export const SingleAnalysis: Story = {
  args: {
    analyses: [mockAnalyses[0]],
  },
};

/**
 * All analysis types to demonstrate different categories and their icons.
 */
export const AllAnalysisTypes: Story = {
  args: {
    analyses: [
      createMockAnalysis({
        id: 'vagueness-example',
        type: 'vagueness',
        severity: 'high',
        message: 'The prompt lacks specific details and measurable outcomes.',
        suggestions: ['Define specific, measurable goals', 'Add concrete examples']
      }),
      createMockAnalysis({
        id: 'context-example',
        type: 'missing_context',
        severity: 'medium',
        message: 'Important background information is missing.',
        suggestions: ['Explain the current situation', 'Provide relevant background']
      }),
      createMockAnalysis({
        id: 'constraints-example',
        type: 'unclear_constraints',
        severity: 'medium',
        message: 'Constraints and limitations are not well defined.',
        suggestions: ['Specify time and budget limits', 'Define scope boundaries']
      }),
      createMockAnalysis({
        id: 'structure-example',
        type: 'poor_structure',
        severity: 'low',
        message: 'The prompt organization could be improved.',
        suggestions: ['Use clear headings and bullet points', 'Organize information logically']
      }),
      createMockAnalysis({
        id: 'tone-example',
        type: 'tone_inconsistency',
        severity: 'low',
        message: 'The tone varies throughout the prompt.',
        suggestions: ['Maintain consistent formality level', 'Choose appropriate tone for audience']
      }),
      createMockAnalysis({
        id: 'examples-example',
        type: 'missing_examples',
        severity: 'medium',
        message: 'Examples would help clarify the requirements.',
        suggestions: ['Include specific examples', 'Show desired format or style']
      }),
    ],
  },
};

/**
 * Long analysis messages to test text wrapping and truncation.
 */
export const LongMessages: Story = {
  args: {
    analyses: [
      createMockAnalysis({
        id: 'long-message',
        type: 'vagueness',
        severity: 'high',
        message: 'This is a very long analysis message that goes into great detail about the specific issues found in the prompt. It explains not only what the problem is, but also why it\'s a problem, how it affects the quality of responses you\'ll get, and what the downstream consequences might be if you don\'t address these issues. The message continues to provide comprehensive context about best practices for prompt writing and how this particular issue fits into the broader landscape of effective AI communication. This level of detail helps users understand not just what to fix, but why fixing it matters for achieving their goals.',
        suggestions: [
          'This is also a very long suggestion that provides detailed, step-by-step guidance on exactly how to address the identified issue, including specific examples of what good prompts look like in this context.',
          'Another comprehensive suggestion that goes beyond just telling you what to do and actually explains the reasoning behind the recommendation, helping you understand the principles so you can apply them to future prompts.',
          'A third detailed suggestion that includes multiple approaches you could take, explains the trade-offs between different options, and helps you choose the best approach for your specific situation and goals.'
        ]
      }),
    ],
  },
};

/**
 * Interactive story for testing selection and expansion functionality.
 */
export const Interactive: Story = {
  args: {
    analyses: mockAnalyses,
  },
  play: async ({ canvasElement, args }) => {
    // This could include interaction tests for:
    // - Clicking on analysis items to select them
    // - Expanding/collapsing suggestions
    // - Keyboard navigation testing
    // For now, it's a placeholder showing the structure
  },
};

/**
 * Accessibility testing story with enhanced a11y checks.
 */
export const AccessibilityTest: Story = {
  args: {
    analyses: mockAnalyses,
  },
  parameters: {
    docs: {
      description: {
        story: `
This story specifically tests accessibility features including:
- ARIA labels and descriptions for analysis items
- Keyboard navigation (Tab, Enter, Space)
- Screen reader announcements for selections
- Semantic HTML structure with proper roles
- Color contrast for severity indicators
- Focus management and visual focus indicators
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
          }
        ]
      }
    }
  },
};

/**
 * Performance testing story with many analysis items.
 */
export const ManyAnalyses: Story = {
  args: {
    analyses: Array.from({ length: 20 }, (_, index) => 
      createMockAnalysis({
        id: `analysis-${index}`,
        type: ['vagueness', 'missing_context', 'unclear_constraints', 'poor_structure', 'tone_inconsistency', 'missing_examples'][index % 6] as any,
        severity: ['high', 'medium', 'low'][index % 3] as any,
        message: `Analysis result #${index + 1}: This is a test analysis to verify performance with many items.`,
        suggestions: [`Suggestion ${index + 1}A: First recommendation`, `Suggestion ${index + 1}B: Second recommendation`]
      })
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests performance and rendering with a large number of analysis results (20 items).'
      }
    }
  }
};