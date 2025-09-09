/**
 * Mock Session Data Utilities for Testing
 * 
 * This file provides utilities for creating mock PromptRefinementSession data
 * for use in component tests. These utilities make it easy to create test data
 * with realistic values and allow for easy customization of specific properties.
 */

import {
  PromptRefinementSession,
  PromptAnalysis,
  PromptImprovement,
  EducationTip,
  RefinementStatus,
  AnalysisType,
  ImprovementType,
  EducationCategory
} from '../../types/core';

/**
 * Creates a mock PromptAnalysis with default values
 */
export const createMockAnalysis = (overrides?: Partial<PromptAnalysis>): PromptAnalysis => ({
  id: `analysis-${Date.now()}-${Math.random()}`,
  type: 'vagueness',
  issue: 'The prompt lacks specificity',
  severity: 'medium',
  suggestion: 'Add more specific details about the desired output',
  originalText: 'Write something',
  position: { start: 0, end: 14 },
  ...overrides
});

/**
 * Creates a mock PromptImprovement with default values
 */
export const createMockImprovement = (overrides?: Partial<PromptImprovement>): PromptImprovement => ({
  id: `improvement-${Date.now()}-${Math.random()}`,
  type: 'specificity_increased',
  description: 'Added specific requirements and constraints',
  before: 'Write something',
  after: 'Write a detailed, well-structured document',
  rationale: 'Specificity helps the AI understand exactly what is needed',
  ...overrides
});

/**
 * Creates a mock EducationTip with default values
 */
export const createMockEducationTip = (overrides?: Partial<EducationTip>): EducationTip => ({
  id: `tip-${Date.now()}-${Math.random()}`,
  technique: 'Context Setting',
  title: 'Adding Context to Your Prompts',
  description: 'Providing context helps AI understand your specific needs',
  example: 'Instead of "Write an email", use "Write a professional email to a client explaining project delays"',
  category: 'fundamentals',
  relevanceScore: 0.8,
  ...overrides
});

/**
 * Creates a mock PromptRefinementSession with default values
 */
export const createMockSession = (overrides?: Partial<PromptRefinementSession>): PromptRefinementSession => ({
  id: `session-${Date.now()}-${Math.random()}`,
  createdAt: new Date('2023-10-01T12:00:00Z'),
  originalPrompt: 'Write a summary',
  refinedPrompt: 'Write a comprehensive, well-structured summary that includes key points, supporting details, and clear conclusions based on the provided information.',
  analysisResults: [
    createMockAnalysis({
      type: 'vagueness',
      issue: 'The prompt lacks specificity about what type of summary is needed',
      severity: 'medium',
      suggestion: 'Specify the type of summary, length, and key elements to include'
    })
  ],
  improvements: [
    createMockImprovement({
      type: 'specificity_increased',
      description: 'Added specific requirements for summary structure and content',
      before: 'Write a summary',
      after: 'Write a comprehensive, well-structured summary'
    })
  ],
  educationTips: [
    createMockEducationTip({
      title: 'Adding Structure to Prompts',
      description: 'Well-structured prompts lead to better outputs'
    })
  ],
  status: 'refined',
  ...overrides
});

/**
 * Pre-configured session scenarios for common test cases
 */
export const mockSessionScenarios = {
  /**
   * Session in analyzing state with no refined prompt yet
   */
  analyzing: (): PromptRefinementSession => createMockSession({
    status: 'analyzing',
    refinedPrompt: null,
    improvements: [],
    educationTips: []
  }),

  /**
   * Session in error state
   */
  error: (): PromptRefinementSession => createMockSession({
    status: 'error',
    refinedPrompt: null,
    analysisResults: [],
    improvements: [],
    educationTips: []
  }),

  /**
   * Successfully refined session
   */
  refined: (): PromptRefinementSession => createMockSession({
    status: 'refined'
  }),

  /**
   * Session with minimal data (edge case)
   */
  minimal: (): PromptRefinementSession => createMockSession({
    originalPrompt: 'Hi',
    refinedPrompt: 'Hello! How can I help you today?',
    analysisResults: [],
    improvements: [],
    educationTips: [],
    status: 'refined'
  }),

  /**
   * Session with extensive data
   */
  comprehensive: (): PromptRefinementSession => createMockSession({
    originalPrompt: 'Write something about AI',
    refinedPrompt: 'Write a comprehensive, 500-word analysis about the current state of artificial intelligence, focusing on recent developments in machine learning, potential societal impacts, and ethical considerations. Include specific examples and cite recent research where possible.',
    analysisResults: [
      createMockAnalysis({
        type: 'vagueness',
        issue: 'The topic "AI" is too broad',
        severity: 'high',
        suggestion: 'Specify which aspects of AI to focus on'
      }),
      createMockAnalysis({
        type: 'missing_context',
        issue: 'No context about target audience or purpose',
        severity: 'medium',
        suggestion: 'Clarify the intended audience and use case'
      }),
      createMockAnalysis({
        type: 'unclear_constraints',
        issue: 'No length or format requirements specified',
        severity: 'low',
        suggestion: 'Add word count and format preferences'
      })
    ],
    improvements: [
      createMockImprovement({
        type: 'context_added',
        description: 'Added specific focus areas for AI discussion',
        before: 'about AI',
        after: 'about the current state of artificial intelligence, focusing on recent developments'
      }),
      createMockImprovement({
        type: 'constraints_clarified',
        description: 'Added length and formatting requirements',
        before: 'Write something',
        after: 'Write a comprehensive, 500-word analysis'
      })
    ],
    educationTips: [
      createMockEducationTip({
        technique: 'Specificity',
        title: 'Being Specific in Prompts',
        category: 'fundamentals'
      }),
      createMockEducationTip({
        technique: 'Context Setting',
        title: 'Providing Context',
        category: 'fundamentals'
      })
    ]
  }),

  /**
   * Session with long prompts (performance testing)
   */
  longPrompts: (): PromptRefinementSession => {
    const longOriginal = 'Write a detailed analysis of ' + 'machine learning algorithms '.repeat(100);
    const longRefined = 'Write a comprehensive, structured analysis of ' + 'modern machine learning algorithms including their applications, limitations, and future potential. '.repeat(50);
    
    return createMockSession({
      originalPrompt: longOriginal,
      refinedPrompt: longRefined,
      status: 'refined'
    });
  },

  /**
   * Session with special characters and formatting
   */
  withFormatting: (): PromptRefinementSession => createMockSession({
    originalPrompt: `Write about:
• Machine Learning
• AI Ethics  
• Future Trends

Use **bold** for emphasis and include code examples like \`print("hello")\`.`,
    refinedPrompt: `Write a comprehensive analysis covering the following topics:

• **Machine Learning**: Current algorithms and applications
• **AI Ethics**: Bias, fairness, and responsible AI development  
• **Future Trends**: Emerging technologies and potential impacts

Format requirements:
- Use **bold** for key terms and section headers
- Include relevant code examples like \`print("hello world")\`
- Provide specific examples for each topic
- Target length: 1000-1500 words`,
    status: 'refined'
  })
};

/**
 * Utility to create multiple mock sessions for list/history testing
 */
export const createMockSessionHistory = (count: number): PromptRefinementSession[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockSession({
      id: `session-${index}`,
      originalPrompt: `Test prompt ${index + 1}`,
      createdAt: new Date(Date.now() - (count - index) * 60000) // Spaced 1 minute apart
    })
  );
};

/**
 * Mock clipboard for testing copy functionality
 * Note: vi must be imported in the test file where this is used
 */
export const createMockClipboard = (vi: any) => ({
  writeText: vi.fn().mockResolvedValue(undefined),
  readText: vi.fn().mockResolvedValue(''),
});

/**
 * Sets up clipboard mocking for tests
 * @param mockClipboard - The mock clipboard object created with vi
 */
export const setupClipboardMock = (mockClipboard: any) => {
  Object.assign(navigator, {
    clipboard: mockClipboard
  });
  
  // Reset mocks
  mockClipboard.writeText.mockClear();
  mockClipboard.readText.mockClear();
};