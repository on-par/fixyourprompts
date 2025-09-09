/**
 * EducationContentService Implementation
 * 
 * GREEN Phase of TDD - Implements the minimum code needed to make all tests pass
 * Provides comprehensive educational content for prompt engineering
 */

import type { EducationContentContract } from '../types/services';
import type { 
  EducationTip, 
  EducationCategory, 
  PromptAnalysis, 
  AnalysisType 
} from '../types/core';

/**
 * Service providing educational content and contextual learning tips
 * for prompt engineering improvement
 */
export class EducationContentService implements EducationContentContract {
  private readonly tipLibrary: EducationTip[] = [
    // Fundamentals Category
    {
      id: 'fund-001',
      technique: 'Specificity',
      title: 'Be Specific and Clear',
      description: 'Replace vague terms with precise, concrete language. Instead of saying "help me with my project," specify exactly what kind of project, what specific help you need, and what outcome you expect.',
      example: 'Instead of: "Help me with my project" → Try: "Help me write a Python function that calculates compound interest for a financial planning application"',
      category: 'fundamentals',
      relevanceScore: 0.9
    },
    {
      id: 'fund-002', 
      technique: 'Context Setting',
      title: 'Provide Rich Context',
      description: 'Give the AI sufficient background information to understand your situation, constraints, and requirements. Context helps the AI provide more relevant and useful responses.',
      example: 'Instead of: "Write code" → Try: "Write a JavaScript function for a React e-commerce app that validates credit card numbers using the Luhn algorithm"',
      category: 'fundamentals',
      relevanceScore: 0.85
    },
    {
      id: 'fund-003',
      technique: 'Clear Instructions',
      title: 'Use Clear, Direct Instructions',
      description: 'Write instructions as if you are explaining to a knowledgeable colleague. Use active voice and specific action verbs to make your intent crystal clear.',
      example: 'Instead of: "Maybe you could help with some writing" → Try: "Proofread this email for grammar errors and suggest improvements for professional tone"',
      category: 'fundamentals',
      relevanceScore: 0.8
    },
    {
      id: 'fund-004',
      technique: 'Output Format',
      title: 'Specify Expected Output Format',
      description: 'Clearly define how you want the response structured - as a list, paragraph, code block, table, or specific format. This prevents mismatched expectations.',
      example: 'Add: "Please provide your response as a numbered list with brief explanations for each point" or "Format the code with comments explaining each step"',
      category: 'fundamentals',
      relevanceScore: 0.75
    },

    // Advanced Techniques Category
    {
      id: 'adv-001',
      technique: 'Chain of Thought',
      title: 'Request Step-by-Step Reasoning',
      description: 'Ask the AI to show its reasoning process by working through problems step-by-step. This improves accuracy and helps you understand the logic.',
      example: 'Add: "Please work through this step-by-step, showing your reasoning at each stage" or "Think through this problem systematically"',
      category: 'advanced_techniques',
      relevanceScore: 0.9
    },
    {
      id: 'adv-002',
      technique: 'Role Playing',
      title: 'Assign Specific Roles',
      description: 'Ask the AI to take on the role of an expert in a specific field. This can improve the quality and perspective of responses.',
      example: 'Try: "Acting as a senior software architect, review this database design and suggest improvements for scalability"',
      category: 'advanced_techniques',
      relevanceScore: 0.85
    },
    {
      id: 'adv-003',
      technique: 'Few-Shot Examples',
      title: 'Provide Examples of Desired Output',
      description: 'Show the AI exactly what you want by providing 2-3 examples of the input-output pattern you are looking for.',
      example: 'Example 1: Input: "tired" → Output: "exhausted, weary, fatigued"\nExample 2: Input: "happy" → Output: "joyful, elated, cheerful"\nNow do: Input: "angry" → Output: ?',
      category: 'advanced_techniques',
      relevanceScore: 0.8
    },
    {
      id: 'adv-004',
      technique: 'Constraint Specification',
      title: 'Define Clear Constraints',
      description: 'Specify limitations, requirements, and boundaries for the response. Include length limits, style requirements, and any restrictions.',
      example: 'Add constraints like: "Keep response under 200 words", "Use only common English words", or "Follow APA citation format"',
      category: 'advanced_techniques',
      relevanceScore: 0.75
    },

    // Best Practices Category
    {
      id: 'bp-001',
      technique: 'Structure Organization',
      title: 'Organize Request Structure',
      description: 'Structure your prompt with clear sections: context, specific request, format requirements, and constraints. Use formatting like bullet points or numbers for complex requests.',
      example: 'Structure: "Context: [background info] \nTask: [specific request] \nFormat: [how to respond] \nConstraints: [limitations]"',
      category: 'best_practices',
      relevanceScore: 0.85
    },
    {
      id: 'bp-002',
      technique: 'Iterative Refinement',
      title: 'Refine Through Iteration',
      description: 'Start with a basic prompt and gradually add more specificity based on the responses you receive. This helps you discover what works best.',
      example: 'Start simple: "Explain photosynthesis" → Refine: "Explain photosynthesis to a 10-year-old using simple analogies and avoiding scientific jargon"',
      category: 'best_practices',
      relevanceScore: 0.8
    },
    {
      id: 'bp-003',
      technique: 'Error Prevention',
      title: 'Anticipate and Prevent Errors',
      description: 'Think about potential misunderstandings and add clarifications to prevent them. Address common failure modes proactively.',
      example: 'Add clarifications: "When I say \'analyze,\' I mean provide both strengths and weaknesses" or "Use metric units, not imperial"',
      category: 'best_practices',
      relevanceScore: 0.75
    },

    // Domain Specific Category
    {
      id: 'dom-001',
      technique: 'Code Generation',
      title: 'Effective Code Requests',
      description: 'For coding tasks, specify the programming language, framework, coding style, and include context about the larger application or system.',
      example: 'Try: "Write a Python function using FastAPI that accepts POST requests with JSON data validation, includes error handling, and follows PEP 8 style guidelines"',
      category: 'domain_specific',
      relevanceScore: 0.9
    },
    {
      id: 'dom-002',
      technique: 'Writing Assistance',
      title: 'Specify Writing Context and Audience',
      description: 'For writing tasks, clearly define the target audience, tone, purpose, and length requirements to get appropriately styled content.',
      example: 'Try: "Write a professional email to a potential client explaining our consulting services, maintaining a confident but not pushy tone, approximately 150 words"',
      category: 'domain_specific',
      relevanceScore: 0.85
    },
    {
      id: 'dom-003',
      technique: 'Analysis Tasks',
      title: 'Structure Analysis Requests',
      description: 'For analytical tasks, specify the type of analysis, depth required, format for results, and any specific frameworks or methodologies to use.',
      example: 'Try: "Perform a SWOT analysis of remote work policies, focusing on impact on productivity and employee satisfaction, presented as a structured table with explanations"',
      category: 'domain_specific',
      relevanceScore: 0.8
    },

    // Troubleshooting Category
    {
      id: 'ts-001',
      technique: 'Debugging Prompts',
      title: 'Troubleshoot Unclear Responses',
      description: 'When you get unsatisfactory responses, add more context, break down complex requests into smaller parts, or rephrase using different terminology.',
      example: 'If response is too general → Add: "Please provide specific, actionable examples" \nIf response is too technical → Add: "Explain this for someone new to the field"',
      category: 'troubleshooting',
      relevanceScore: 0.9
    },
    {
      id: 'ts-002',
      technique: 'Response Quality',
      title: 'Improve Response Relevance',
      description: 'If responses seem off-topic, explicitly state your goal, provide more context about why you need this information, and specify the use case.',
      example: 'Add context: "I need this for [specific purpose]" or "The end goal is to [specific outcome]" or "This will be used in [specific context]"',
      category: 'troubleshooting',
      relevanceScore: 0.85
    },
    {
      id: 'ts-003',
      technique: 'Clarification Requests',
      title: 'Ask for Clarification When Needed',
      description: 'Don\'t hesitate to ask follow-up questions or request clarification on any part of the response that doesn\'t meet your needs.',
      example: 'Follow up with: "Can you explain the third point in more detail?" or "What would be an alternative approach to this solution?"',
      category: 'troubleshooting',
      relevanceScore: 0.8
    }
  ];

  private readonly categories: EducationCategory[] = [
    'fundamentals',
    'advanced_techniques', 
    'domain_specific',
    'troubleshooting',
    'best_practices'
  ];

  getRelevantTips(prompt: string, analyses: PromptAnalysis[]): EducationTip[] {
    // Handle null/undefined inputs as specified in tests
    if (prompt === null || prompt === undefined || analyses === null || analyses === undefined) {
      throw new Error('Prompt and analyses are required');
    }

    // Return empty array for empty prompt as per test requirements
    if (prompt.trim().length === 0) {
      return [];
    }

    // Return empty array for empty analyses as per test requirements  
    if (analyses.length === 0) {
      return [];
    }

    const relevantTips: EducationTip[] = [];
    const analysisTypes = new Set(analyses.map(a => a.type));
    
    // Map analysis types to relevant tip categories and techniques
    const analysisToTipMapping: Record<AnalysisType, (tip: EducationTip) => boolean> = {
      vagueness: (tip) => tip.technique.toLowerCase().includes('specificity') || tip.category === 'fundamentals',
      missing_context: (tip) => tip.technique.toLowerCase().includes('context') || tip.category === 'fundamentals',
      poor_structure: (tip) => tip.technique.toLowerCase().includes('structure') || tip.category === 'best_practices',
      unclear_constraints: (tip) => tip.technique.toLowerCase().includes('constraint') || tip.category === 'advanced_techniques',
      missing_examples: (tip) => tip.technique.toLowerCase().includes('example') || tip.category === 'advanced_techniques',
      tone_inconsistency: (tip) => tip.category === 'best_practices' || tip.category === 'domain_specific'
    };

    // Find tips relevant to each analysis type
    for (const analysisType of analysisTypes) {
      const matcher = analysisToTipMapping[analysisType];
      if (matcher) {
        const matchingTips = this.tipLibrary.filter(matcher);
        relevantTips.push(...matchingTips);
      }
    }

    // Remove duplicates and ensure we have tips for complex scenarios
    const uniqueTips = Array.from(new Map(relevantTips.map(tip => [tip.id, tip])).values());
    
    // Add advanced technique tips for complex scenarios (multiple analysis types)
    if (analysisTypes.size > 1) {
      const advancedTips = this.tipLibrary.filter(tip => tip.category === 'advanced_techniques');
      advancedTips.forEach(tip => {
        if (!uniqueTips.find(existing => existing.id === tip.id)) {
          uniqueTips.push(tip);
        }
      });
    }

    // Assign relevance scores based on analysis severity and type match
    const tipsWithRelevance = uniqueTips.map(tip => {
      let relevanceScore = tip.relevanceScore;
      
      // Boost relevance for direct matches
      for (const analysis of analyses) {
        const matcher = analysisToTipMapping[analysis.type];
        if (matcher && matcher(tip)) {
          // Boost based on severity
          const severityBoost = analysis.severity === 'high' ? 0.1 : analysis.severity === 'medium' ? 0.05 : 0.02;
          relevanceScore = Math.min(1.0, relevanceScore + severityBoost);
        }
      }

      return { ...tip, relevanceScore };
    });

    // Sort by relevance score in descending order as required by tests
    return tipsWithRelevance.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  getAllCategories(): EducationCategory[] {
    return [...this.categories];
  }

  getTipsByCategory(category: EducationCategory): EducationTip[] {
    // Handle null/undefined inputs
    if (!category) {
      throw new Error('Category is required');
    }

    // Return empty array for invalid categories as per test requirements
    if (!this.categories.includes(category)) {
      return [];
    }

    return this.tipLibrary.filter(tip => tip.category === category);
  }
}