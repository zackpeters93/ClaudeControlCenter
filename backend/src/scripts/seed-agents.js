/**
 * Seed Agents - Import Claude Code Agents & Anthropic Workflow Patterns
 *
 * This script seeds the database with:
 * 1. Claude Code Task tool agents (general-purpose, explore, plan, statusline-setup)
 * 2. Anthropic workflow patterns from "Building Effective Agents" guide
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Claude Code Task Agents
const CLAUDE_CODE_AGENTS = [
  {
    name: 'General-Purpose Agent',
    type: 'general-purpose',
    category: 'claude-code',
    description: 'Autonomous multi-step task execution with full tool access',
    longDescription: 'The general-purpose agent handles complex tasks requiring research, code generation, and execution. It has access to all tools and can work autonomously through multiple steps. Use this when you need Claude to take initiative and solve problems end-to-end.',
    icon: 'fa-robot',
    color: '#0984e3',
    tools: ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'Bash', 'WebFetch', 'WebSearch', 'Task', 'TodoWrite'],
    parallelCapable: true,
    thoroughnessLevels: null,
    whenToUse: [
      'Complex multi-step tasks requiring multiple tools',
      'Tasks combining research + code changes',
      'When you need autonomous problem-solving',
      'Long-running workflows with decision trees',
      'Bug hunting and fixing across multiple files'
    ],
    whenNotToUse: [
      'Simple file reads or searches (use direct tools)',
      'When you need precise control over each step',
      'Single-operation tasks',
      'Quick lookups or information retrieval'
    ],
    examplePrompts: [
      {
        title: 'Complex refactoring',
        prompt: 'Search for all instances of the old API pattern, update them to the new pattern, and run tests'
      },
      {
        title: 'Feature implementation',
        prompt: 'Research authentication patterns in the codebase, implement JWT auth, and add tests'
      },
      {
        title: 'Bug investigation',
        prompt: 'Find all error handlers, identify inconsistent patterns, and standardize them'
      },
      {
        title: 'Documentation generation',
        prompt: 'Analyze the API endpoints and generate OpenAPI documentation'
      }
    ],
    bestPractices: [
      'Provide clear, specific task description',
      'Include expected outcome in prompt',
      'Let agent determine implementation steps',
      'Use for tasks taking >5 steps to complete',
      'Can run multiple GP agents in parallel for independent tasks'
    ],
    source: 'anthropic'
  },
  {
    name: 'Explore Agent',
    type: 'explore',
    category: 'claude-code',
    description: 'Specialized codebase exploration with thoroughness levels',
    longDescription: 'The Explore agent is optimized for understanding codebases through systematic exploration. It supports three thoroughness levels (quick, medium, very thorough) and is more context-efficient than direct search commands. Use this for open-ended questions about code architecture.',
    icon: 'fa-search',
    color: '#00b894',
    tools: ['Glob', 'Grep', 'Read', 'Task'],
    parallelCapable: true,
    thoroughnessLevels: {
      quick: 'Basic search, first few results, minimal file reads. Use for simple lookups.',
      medium: 'Standard exploration, multiple search strategies, follows references. Default choice.',
      'very thorough': 'Comprehensive analysis, multiple locations, various naming conventions, deep dive.'
    },
    whenToUse: [
      'Open-ended codebase exploration',
      'Understanding architecture or patterns',
      'Finding implementation across multiple files',
      'When multiple search rounds expected',
      'Answering "how does X work?" questions'
    ],
    whenNotToUse: [
      'Searching for specific file/class (use Glob)',
      'Single keyword search (use Grep directly)',
      'When you know exact location',
      'Simple file path lookups'
    ],
    examplePrompts: [
      {
        title: 'Quick exploration',
        prompt: 'Explore the authentication system (thoroughness: quick)'
      },
      {
        title: 'Medium exploration',
        prompt: 'Find all API endpoint definitions (thoroughness: medium)'
      },
      {
        title: 'Thorough exploration',
        prompt: 'Understand the complete error handling architecture (thoroughness: very thorough)'
      },
      {
        title: 'Pattern finding',
        prompt: 'How are database queries structured in this codebase? (thoroughness: medium)'
      }
    ],
    bestPractices: [
      'Specify thoroughness level in prompt',
      'Use for understanding, not simple searches',
      'More context-efficient than direct tools',
      'Can run multiple Explore agents in parallel',
      'Start with "medium" if unsure'
    ],
    source: 'anthropic'
  },
  {
    name: 'Plan Agent',
    type: 'plan',
    category: 'claude-code',
    description: 'Structured planning mode for implementation steps',
    longDescription: 'The Plan agent helps structure implementation steps for coding tasks. It explores the codebase to understand context, then presents a plan for user approval before execution. Uses ExitPlanMode to signal completion and await user confirmation.',
    icon: 'fa-clipboard-list',
    color: '#fdcb6e',
    tools: ['Glob', 'Grep', 'Read', 'ExitPlanMode'],
    parallelCapable: false,
    thoroughnessLevels: {
      quick: 'Basic planning with minimal exploration',
      medium: 'Standard planning with adequate research',
      'very thorough': 'Comprehensive planning with deep analysis'
    },
    whenToUse: [
      'Planning code implementation before writing',
      'Need to see plan before execution',
      'Complex features requiring approval',
      'Want structured breakdown of work',
      'When stakeholder buy-in is needed'
    ],
    whenNotToUse: [
      'Simple, straightforward changes',
      'When immediate execution is desired',
      'Research-only tasks (use Explore)',
      'Small bug fixes or one-line changes'
    ],
    examplePrompts: [
      {
        title: 'Feature planning',
        prompt: 'Plan how to add dark mode support to the application'
      },
      {
        title: 'Refactoring plan',
        prompt: 'Create a plan to migrate from REST to GraphQL'
      },
      {
        title: 'Implementation strategy',
        prompt: 'Plan the implementation of user authentication system'
      },
      {
        title: 'Architecture decision',
        prompt: 'Plan how to restructure the database schema for better performance'
      }
    ],
    bestPractices: [
      'Review plan before confirming execution',
      'Ask clarifying questions during planning',
      'Specify thoroughness if needed',
      'Use when stakeholder approval required',
      'Agent will use ExitPlanMode when ready'
    ],
    source: 'anthropic'
  },
  {
    name: 'Statusline Setup Agent',
    type: 'statusline-setup',
    category: 'claude-code',
    description: 'Configure Claude Code status line settings',
    longDescription: 'Specialized agent for managing Claude Code\'s status line configuration. Handles specific setup and customization tasks for the status line display in the Claude Code interface.',
    icon: 'fa-sliders-h',
    color: '#d63031',
    tools: ['Read', 'Edit', 'Write'],
    parallelCapable: false,
    thoroughnessLevels: null,
    whenToUse: [
      'Configuring status line display',
      'Customizing editor UI elements',
      'Status line troubleshooting'
    ],
    whenNotToUse: [
      'General configuration tasks',
      'Any non-statusline related work',
      'Code editing or development'
    ],
    examplePrompts: [
      {
        title: 'Basic setup',
        prompt: 'Configure my status line to show git branch and file info'
      },
      {
        title: 'Customization',
        prompt: 'Update the status line to display current working directory'
      }
    ],
    bestPractices: [
      'Specific use case - rarely needed',
      'Use only for statusline configuration',
      'Not applicable for general tasks'
    ],
    source: 'anthropic'
  }
];

// Anthropic Workflow Patterns (from "Building Effective Agents" guide)
const WORKFLOW_PATTERNS = [
  {
    name: 'Prompt Chaining',
    type: 'prompt-chaining',
    category: 'workflow-pattern',
    description: 'Decompose tasks into sequential steps where each LLM call processes previous output',
    longDescription: 'Prompt chaining decomposes a task into a sequence of steps, where each LLM call processes the output of the previous one. You can add programmatic checks ("gates") on any intermediate steps to ensure the process is still on track. This pattern is ideal when the task naturally decomposes into fixed subtasks and you want to trade latency for higher accuracy.',
    icon: 'fa-link',
    color: '#74b9ff',
    tools: null,
    parallelCapable: false,
    thoroughnessLevels: null,
    whenToUse: [
      'Tasks that naturally break into fixed subtasks',
      'When higher accuracy is more important than speed',
      'Need validation gates between steps',
      'Transforming data through multiple stages',
      'Document processing pipelines'
    ],
    whenNotToUse: [
      'Simple, single-step tasks',
      'When latency is critical',
      'Highly dynamic or unpredictable workflows',
      'When steps cannot be predetermined'
    ],
    examplePrompts: [
      {
        title: 'Document analysis',
        prompt: 'Step 1: Extract key themes → Step 2: Identify entities → Step 3: Summarize findings'
      },
      {
        title: 'Code review',
        prompt: 'Step 1: Parse code → Step 2: Check for issues → Step 3: Generate report'
      },
      {
        title: 'Translation pipeline',
        prompt: 'Step 1: Translate text → Step 2: Back-translate → Step 3: Compare and refine'
      }
    ],
    bestPractices: [
      'Add validation gates between steps',
      'Keep each step focused on one transformation',
      'Design clear input/output contracts',
      'Consider rollback strategies for failed steps',
      'Log intermediate results for debugging'
    ],
    source: 'anthropic'
  },
  {
    name: 'Routing',
    type: 'routing',
    category: 'workflow-pattern',
    description: 'Classify inputs and direct them to specialized downstream processes',
    longDescription: 'Routing classifies an input and directs it to a specialized followup task. This workflow allows for separation of concerns, optimizing for different input types. Without this, optimizing for one type of input might hurt performance on others. Use routing when you have distinct categories that benefit from specialized handling.',
    icon: 'fa-random',
    color: '#a29bfe',
    tools: null,
    parallelCapable: true,
    thoroughnessLevels: null,
    whenToUse: [
      'Handling distinct categories of inputs',
      'When different inputs need specialized processing',
      'Building multi-purpose assistants',
      'Customer service with varied query types',
      'Content moderation with different categories'
    ],
    whenNotToUse: [
      'Uniform input processing',
      'When all inputs need same handling',
      'Simple, single-purpose tasks',
      'When routing overhead exceeds benefit'
    ],
    examplePrompts: [
      {
        title: 'Support routing',
        prompt: 'Classify query as: billing, technical, general → route to specialized handler'
      },
      {
        title: 'Content router',
        prompt: 'Identify content type: code, prose, data → process with appropriate pipeline'
      },
      {
        title: 'Language detection',
        prompt: 'Detect language → route to language-specific model/prompt'
      }
    ],
    bestPractices: [
      'Define clear classification categories',
      'Include a "fallback" or "other" category',
      'Test routing accuracy separately',
      'Consider confidence thresholds',
      'Monitor routing distribution for anomalies'
    ],
    source: 'anthropic'
  },
  {
    name: 'Parallelization',
    type: 'parallelization',
    category: 'workflow-pattern',
    description: 'Run multiple LLM calls simultaneously for speed or voting confidence',
    longDescription: 'LLMs can sometimes work simultaneously on a task through sectioning (independent subtasks) or voting (multiple attempts for confidence). Parallelization is effective when the divided subtasks can be parallelized for speed, or when multiple perspectives or attempts are needed to increase confidence.',
    icon: 'fa-code-branch',
    color: '#00cec9',
    tools: null,
    parallelCapable: true,
    thoroughnessLevels: null,
    whenToUse: [
      'Independent subtasks that can run in parallel',
      'Need multiple perspectives on same input',
      'Voting/consensus for higher confidence',
      'Batch processing multiple items',
      'Time-critical tasks with independent components'
    ],
    whenNotToUse: [
      'Sequential dependent tasks',
      'When outputs depend on previous steps',
      'Resource-constrained environments',
      'Simple tasks where overhead exceeds benefit'
    ],
    examplePrompts: [
      {
        title: 'Sectioning',
        prompt: 'Analyze document: run sentiment, entities, and summary extraction in parallel'
      },
      {
        title: 'Voting',
        prompt: 'Generate 3 responses, score each, select best by consensus'
      },
      {
        title: 'Batch processing',
        prompt: 'Process 10 code files in parallel for security vulnerabilities'
      }
    ],
    bestPractices: [
      'Identify truly independent subtasks',
      'Use voting for higher-stakes decisions',
      'Aggregate results intelligently',
      'Handle partial failures gracefully',
      'Monitor for consensus disagreements'
    ],
    source: 'anthropic'
  },
  {
    name: 'Orchestrator-Workers',
    type: 'orchestrator-workers',
    category: 'workflow-pattern',
    description: 'Central LLM dynamically breaks down tasks and delegates to workers',
    longDescription: 'In the orchestrator-workers workflow, a central LLM dynamically breaks down tasks, delegates them to worker LLMs, and synthesizes their results. This workflow is well-suited for complex tasks where you can\'t predict the subtasks needed. The key difference from parallelization is that task breakdown itself is dynamic and unpredictable.',
    icon: 'fa-sitemap',
    color: '#fd79a8',
    tools: null,
    parallelCapable: true,
    thoroughnessLevels: null,
    whenToUse: [
      'Complex tasks with unpredictable subtasks',
      'Multi-step workflows requiring coordination',
      'When subtask types vary based on input',
      'Large-scale content generation',
      'Research tasks requiring multiple approaches'
    ],
    whenNotToUse: [
      'Simple, predictable workflows',
      'When subtasks are known in advance',
      'Tightly coupled operations',
      'Resource-constrained environments'
    ],
    examplePrompts: [
      {
        title: 'Research orchestration',
        prompt: 'Research topic: orchestrator decides what to search, delegates searches, synthesizes findings'
      },
      {
        title: 'Code generation',
        prompt: 'Build feature: orchestrator plans components, delegates to specialized coders, integrates results'
      },
      {
        title: 'Content creation',
        prompt: 'Create report: orchestrator outlines sections, delegates writing, assembles final document'
      }
    ],
    bestPractices: [
      'Keep orchestrator focused on coordination',
      'Design clear worker interfaces',
      'Allow orchestrator to adapt plans',
      'Include synthesis/integration step',
      'Monitor worker outputs for consistency'
    ],
    source: 'anthropic'
  },
  {
    name: 'Evaluator-Optimizer',
    type: 'evaluator-optimizer',
    category: 'workflow-pattern',
    description: 'One LLM generates responses while another provides iterative feedback',
    longDescription: 'In the evaluator-optimizer workflow, one LLM call generates a response while another provides evaluation and feedback in a loop. This is particularly effective when clear evaluation criteria exist and when iterative refinement provides measurable value. Similar to human revision processes.',
    icon: 'fa-sync-alt',
    color: '#e17055',
    tools: null,
    parallelCapable: false,
    thoroughnessLevels: null,
    whenToUse: [
      'When clear evaluation criteria exist',
      'Iterative refinement improves output quality',
      'Literary translation with style requirements',
      'Code generation with quality standards',
      'Content that benefits from multiple drafts'
    ],
    whenNotToUse: [
      'No clear evaluation criteria',
      'Simple tasks with obvious correct answers',
      'When first attempt is typically sufficient',
      'Latency-critical applications'
    ],
    examplePrompts: [
      {
        title: 'Code quality loop',
        prompt: 'Generator: write code → Evaluator: check quality/bugs → Generator: refine until passing'
      },
      {
        title: 'Writing refinement',
        prompt: 'Writer: draft content → Editor: provide feedback → Writer: revise until approved'
      },
      {
        title: 'Translation polish',
        prompt: 'Translator: translate → Reviewer: evaluate fluency/accuracy → Translator: improve'
      }
    ],
    bestPractices: [
      'Define clear, measurable evaluation criteria',
      'Set maximum iteration limits',
      'Track improvement across iterations',
      'Consider early stopping when quality plateaus',
      'Log evaluator feedback for debugging'
    ],
    source: 'anthropic'
  }
];

async function seedAgents() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   Agents Seed Script                                      ║');
  console.log('║   Claude Code Agents + Anthropic Workflow Patterns        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // Clear existing agents
  console.log('🗑️  Clearing existing agents...');
  await prisma.agent.deleteMany({});

  // Seed Claude Code agents
  console.log('\n📥 Seeding Claude Code agents...\n');
  for (const agent of CLAUDE_CODE_AGENTS) {
    await prisma.agent.create({ data: agent });
    console.log(`✅ Created: ${agent.name} (${agent.type})`);
  }

  // Seed Workflow patterns
  console.log('\n📥 Seeding Anthropic workflow patterns...\n');
  for (const pattern of WORKFLOW_PATTERNS) {
    await prisma.agent.create({ data: pattern });
    console.log(`✅ Created: ${pattern.name} (${pattern.type})`);
  }

  // Summary
  const total = await prisma.agent.count();
  const byCategory = await prisma.agent.groupBy({
    by: ['category'],
    _count: true
  });

  console.log('\n' + '='.repeat(60));
  console.log('📊 Seed Summary');
  console.log('='.repeat(60));
  console.log(`✅ Total agents created: ${total}`);
  console.log('\n📂 By Category:');
  byCategory.forEach(cat => {
    console.log(`   ${cat.category}: ${cat._count}`);
  });

  console.log('\n✨ Seed complete!\n');
}

// Run seed
seedAgents()
  .catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
