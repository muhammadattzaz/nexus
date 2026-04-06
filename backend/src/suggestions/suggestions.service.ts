import { Injectable } from '@nestjs/common';

export interface Suggestion {
  icon: string;
  text: string;
}

const DATA: Record<string, Suggestion[]> = {
  recruiting: [
    { icon: '🔍', text: 'Monitor job postings at target companies' },
    { icon: '🏅', text: 'Benchmark salary for a specific role' },
    { icon: '📋', text: 'Build a hiring pipeline tracker' },
    { icon: '💛', text: 'Research a candidate before an interview' },
    { icon: '📚', text: 'Build an interactive talent market map' },
  ],
  prototype: [
    { icon: '⚡', text: 'Generate a working UI from a hand-drawn sketch' },
    { icon: '🔗', text: 'Build a REST API prototype from a Swagger spec' },
    { icon: '📱', text: 'Create an interactive prototype from user stories' },
    { icon: '🎨', text: 'Turn a Figma design into a React component' },
    { icon: '🐍', text: 'Build a data pipeline prototype in Python' },
  ],
  business: [
    { icon: '📈', text: 'Create a full business plan with financial projections' },
    { icon: '🎯', text: 'Generate a pitch deck for a SaaS startup' },
    { icon: '🌍', text: 'Perform market research for a new product idea' },
    { icon: '💬', text: 'Build an automated customer support workflow' },
    { icon: '💰', text: 'Model pricing strategy and revenue projections' },
  ],
  learning: [
    { icon: '🎓', text: 'Create a personalised study plan for machine learning' },
    { icon: '🧠', text: 'Explain transformer architecture in simple terms' },
    { icon: '📝', text: 'Generate a quiz on Python fundamentals' },
    { icon: '🔬', text: 'Summarise a research paper for beginners' },
    { icon: '🗺️', text: 'Build a learning roadmap for data science' },
  ],
  research: [
    { icon: '🔭', text: 'Summarise the latest LLM research breakthroughs' },
    { icon: '⚖️', text: 'Compare GPT-5 vs Claude Opus 4.6 on benchmarks' },
    { icon: '📂', text: 'Find open-source models for research use cases' },
    { icon: '🗞️', text: 'Find AI alignment papers published in 2026' },
    { icon: '📊', text: 'Analyse benchmark results across frontier models' },
  ],
};

@Injectable()
export class SuggestionsService {
  getByType(type: string): Suggestion[] {
    return DATA[type.toLowerCase()] ?? DATA['recruiting'];
  }
}
