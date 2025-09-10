import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from '@storybook/addon-actions';
// import { fn } from '@storybook/test';
import PromptOutput from './PromptOutput';
import type { PromptRefinementSession } from '../../types/components';

// Helper function to create mock session data
const createMockSession = (overrides: Partial<PromptRefinementSession> = {}): PromptRefinementSession => ({
  id: 'session-123',
  originalPrompt: 'Write a blog post about AI',
  refinedPrompt: 'Write a comprehensive blog post about artificial intelligence, focusing on its current applications in healthcare, finance, and education. Include specific examples and cite recent research from 2024.',
  analyses: [],
  improvements: [
    {
      id: 'improvement-1',
      description: 'Added specific domains (healthcare, finance, education)',
      rationale: 'Provides clear focus areas for the blog post content',
      before: 'Write a blog post about AI',
      after: 'Write a comprehensive blog post about artificial intelligence, focusing on its current applications in healthcare, finance, and education'
    },
    {
      id: 'improvement-2',
      description: 'Added requirement for examples and citations',
      rationale: 'Makes the content more credible and actionable',
      before: 'focusing on its current applications',
      after: 'Include specific examples and cite recent research from 2024'
    }
  ],
  status: 'complete',
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-15T10:35:00Z'),
  // Add properties that the component expects
  analysisResults: [
    {
      id: 'analysis-1',
      type: 'vagueness',
      severity: 'high' as const,
      issue: 'The prompt lacks specific details about what aspects of AI to cover',
      suggestion: 'Add specific domains, examples, or outcomes you want the blog post to address'
    },
    {
      id: 'analysis-2', 
      type: 'missing_context',
      severity: 'medium' as const,
      issue: 'No target audience specified',
      suggestion: 'Specify who the blog post is for (beginners, professionals, general audience)'
    }
  ],
  educationTips: [
    {
      id: 'tip-1',
      title: 'Be Specific About Scope',
      description: 'When asking for content creation, define the specific areas or topics you want covered',
      example: 'Instead of "write about AI", say "write about AI in healthcare applications"'
    },
    {
      id: 'tip-2',
      title: 'Specify Your Audience',
      description: 'Always indicate who the content is for to get appropriately tailored results',
      example: 'Add phrases like "for beginners" or "for technical professionals"'
    }
  ],
  ...overrides
});

/**
 * PromptOutput displays the results of prompt refinement sessions, showing the
 * comparison between original and refined prompts along with analysis results,
 * improvements made, and educational tips.
 * 
 * ## Features
 * - Side-by-side comparison of original vs refined prompts
 * - Copy functionality for refined prompts
 * - Analysis results with severity indicators
 * - Improvement explanations with before/after comparisons
 * - Educational tips for better prompt writing
 * - Session management controls
 * - Responsive design for different screen sizes
 * 
 * ## Usage
 * The component requires a PromptRefinementSession object containing all the
 * data to display, along with callback functions for user interactions.
 */
const meta: Meta<typeof PromptOutput> = {
  title: 'Components/PromptOutput',
  component: PromptOutput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A comprehensive component for displaying prompt refinement results with analysis, improvements, and educational content.'
      }
    }
  },
  argTypes: {
    session: {
      description: 'The prompt refinement session data to display',
      control: { type: 'object' }
    },
    onCopyRefined: {
      action: 'copied refined prompt',
      description: 'Called when user copies the refined prompt'
    },
    onStartNewSession: {
      action: 'new session requested',
      description: 'Called when user wants to start a new session'
    },
    showComparison: {
      control: 'boolean',
      description: 'Whether to show side-by-side comparison of prompts'
    }
  },
  args: {
    onCopyRefined: action('copied refined prompt'),
    onStartNewSession: action('new session requested'),
    showComparison: true
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state showing a completed refinement session with comparison view.
 */
export const Default: Story = {
  args: {
    session: createMockSession(),
  },
};

/**
 * Shows the analyzing state while a prompt is being processed.
 */
export const Analyzing: Story = {
  args: {
    session: createMockSession({
      status: 'analyzing',
      refinedPrompt: undefined,
    }),
  },
};

/**
 * Shows the error state when prompt refinement fails.
 */
export const Error: Story = {
  args: {
    session: createMockSession({
      status: 'error',
      refinedPrompt: undefined,
    }),
  },
};

/**
 * Shows a session with no refined prompt available.
 */
export const NoRefinement: Story = {
  args: {
    session: createMockSession({
      refinedPrompt: undefined,
      status: 'complete',
    }),
  },
};

/**
 * Shows the single prompt view without side-by-side comparison.
 */
export const SinglePromptView: Story = {
  args: {
    session: createMockSession(),
    showComparison: false,
  },
};

/**
 * Shows a session with extensive analysis results and multiple improvements.
 */
export const ExtensiveAnalysis: Story = {
  args: {
    session: createMockSession({
      originalPrompt: 'Make me a website',
      refinedPrompt: 'Create a responsive business website for a local restaurant with the following features: online menu with prices, contact information and location map, photo gallery of the restaurant and food, table reservation system integration, mobile-friendly design optimized for local SEO, and social media integration for Instagram and Facebook.',
      analysisResults: [
        {
          id: 'analysis-1',
          type: 'vagueness',
          severity: 'high' as const,
          issue: 'The request is extremely vague - "website" could mean anything from a simple landing page to a complex e-commerce platform',
          suggestion: 'Specify the type of website, target audience, key features needed, and business requirements'
        },
        {
          id: 'analysis-2',
          type: 'missing_context',
          severity: 'high' as const,
          issue: 'No information about the business, industry, target audience, or specific requirements',
          suggestion: 'Provide context about what the website is for, who will use it, and what it needs to accomplish'
        },
        {
          id: 'analysis-3',
          type: 'unclear_constraints',
          severity: 'medium' as const,
          issue: 'No technical requirements, budget constraints, timeline, or platform preferences specified',
          suggestion: 'Include technical requirements, preferred technologies, timeline, and any constraints'
        },
        {
          id: 'analysis-4',
          type: 'missing_examples',
          severity: 'medium' as const,
          issue: 'No reference websites, design preferences, or examples of desired functionality',
          suggestion: 'Provide examples of websites you like or specific features you want to include'
        }
      ],
      improvements: [
        {
          id: 'improvement-1',
          description: 'Added specific business type (restaurant)',
          rationale: 'Provides clear context for the type of website and its intended purpose',
          before: 'Make me a website',
          after: 'Create a responsive business website for a local restaurant'
        },
        {
          id: 'improvement-2',
          description: 'Specified core features and functionality',
          rationale: 'Defines clear requirements for what the website must include',
          before: 'a website',
          after: 'online menu with prices, contact information and location map, photo gallery'
        },
        {
          id: 'improvement-3',
          description: 'Added technical requirements',
          rationale: 'Ensures the website will be modern, functional, and discoverable',
          before: 'website',
          after: 'responsive... mobile-friendly design optimized for local SEO'
        },
        {
          id: 'improvement-4',
          description: 'Included integration requirements',
          rationale: 'Specifies modern business needs for reservations and social media presence',
          before: 'website',
          after: 'table reservation system integration... social media integration for Instagram and Facebook'
        }
      ],
      educationTips: [
        {
          id: 'tip-1',
          title: 'Always Specify the Domain or Industry',
          description: 'Different industries have different website requirements. A restaurant website needs different features than a law firm or e-commerce site.',
          example: 'Instead of "make a website", say "create a website for my dental practice" or "build an e-commerce site for handmade jewelry"'
        },
        {
          id: 'tip-2',
          title: 'List Essential Features',
          description: 'Think about what your website visitors need to do and include those features in your prompt.',
          example: 'For a restaurant: "include online menu, reservation system, photo gallery, and contact info"'
        },
        {
          id: 'tip-3',
          title: 'Specify Technical Requirements',
          description: 'Modern websites should be responsive, fast, and SEO-friendly. Include these requirements upfront.',
          example: 'Add phrases like "mobile-responsive", "SEO optimized", "fast loading", or specific platform requirements'
        }
      ]
    }),
  },
};

/**
 * Shows a session with a very long prompt to test text wrapping and layout.
 */
export const LongPrompts: Story = {
  args: {
    session: createMockSession({
      originalPrompt: `I need help creating a comprehensive marketing strategy for my new technology startup that focuses on developing AI-powered tools for small and medium-sized businesses. The company has been in stealth mode for 18 months and we're preparing for our public launch in Q2 2024. We have a team of 25 engineers and data scientists, $12M in Series A funding, and partnerships with three major cloud providers. Our flagship product is an AI assistant that integrates with existing business software like CRM systems, accounting platforms, and project management tools to provide intelligent insights, automate routine tasks, and predict business trends. We're targeting businesses with 50-500 employees across industries like professional services, retail, and manufacturing. The main competitors include established players like Salesforce Einstein, Microsoft's AI offerings, and several smaller AI startups. Our unique value proposition is that our solution requires minimal technical setup and can be deployed in under 48 hours, compared to enterprise solutions that take months to implement. We need to develop positioning, messaging, pricing strategy, channel partnerships, content marketing approach, lead generation tactics, and a comprehensive go-to-market timeline. The marketing budget is $3M for the first 12 months, and we need to achieve 100 paying customers and $2M ARR by the end of year one. Please provide detailed recommendations for each aspect of the marketing strategy, including specific tactics, timelines, budget allocation, success metrics, and risk mitigation strategies.`,
      refinedPrompt: `Create a comprehensive go-to-market strategy for an AI-powered business intelligence platform targeting SMBs (50-500 employees) in professional services, retail, and manufacturing sectors. 

**Company Context:**
- B2B SaaS startup with $12M Series A funding
- 25-person engineering team, 18 months in development
- Q2 2024 public launch target
- Partnerships with 3 major cloud providers

**Product Details:**
- AI assistant integrating with existing business software (CRM, accounting, project management)
- Key features: intelligent insights, task automation, business trend prediction  
- Unique advantage: 48-hour deployment vs months for enterprise competitors
- Main competitors: Salesforce Einstein, Microsoft AI, emerging AI startups

**Business Objectives:**
- Target: 100 paying customers, $2M ARR by end of year one
- Marketing budget: $3M over 12 months
- Target market: SMBs with 50-500 employees

**Required Strategy Components:**
1. Market positioning and competitive differentiation strategy
2. Messaging framework for each target industry vertical
3. Pricing and packaging strategy with clear value tiers
4. Channel partnership development plan (focus on integration partners)
5. Content marketing strategy including thought leadership and case studies
6. Multi-channel lead generation approach (paid, organic, partnerships)
7. Sales enablement and customer success framework
8. Detailed 12-month timeline with milestones and dependencies
9. Budget allocation across channels and tactics
10. Success metrics and KPI framework for each channel
11. Risk assessment and mitigation strategies for competitive threats

**Deliverables Format:**
- Executive summary with key recommendations
- Detailed tactical plans for each component
- Month-by-month implementation timeline
- Budget breakdown and ROI projections
- Success metrics and reporting framework

Please provide specific, actionable recommendations with supporting rationale for a VP of Marketing to execute this strategy.`,
      analysisResults: [
        {
          id: 'analysis-1',
          type: 'poor_structure',
          severity: 'high' as const,
          issue: 'The original prompt is a single, dense paragraph that\'s difficult to parse and act upon',
          suggestion: 'Break complex requests into clearly structured sections with headers and bullet points'
        }
      ]
    }),
  },
};

/**
 * Shows a minimal session with just basic information.
 */
export const Minimal: Story = {
  args: {
    session: createMockSession({
      analysisResults: [],
      improvements: [],
      educationTips: [],
      originalPrompt: 'Hello world',
      refinedPrompt: 'Create a friendly "Hello World" example that demonstrates basic programming concepts and includes comments explaining each step for beginners learning to code.'
    }),
  },
};

/**
 * Interactive story for testing copy functionality and user interactions.
 */
export const Interactive: Story = {
  args: {
    session: createMockSession(),
  },
  play: async () => {
    // This could include interaction tests for copy button, new session dialog, etc.
    // For now, it's a placeholder showing the structure
  },
};

/**
 * Tests accessibility features like ARIA labels, keyboard navigation, and screen reader support.
 */
export const AccessibilityTest: Story = {
  args: {
    session: createMockSession(),
  },
  parameters: {
    docs: {
      description: {
        story: `
This story tests accessibility features including:
- ARIA labels and descriptions for all interactive elements
- Keyboard navigation support
- Screen reader announcements for state changes
- Focus management for dialogs and buttons
- Semantic HTML structure with proper headings
        `
      }
    },
    a11y: {
      // Enable more thorough accessibility testing
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'keyboard-accessible',
            enabled: true,
          }
        ]
      }
    }
  },
};