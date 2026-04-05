import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import { Agent, AgentDocument } from './schemas/agent.schema';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
  ) {}

  async findAll(userId: string) {
    return this.agentModel.find({ userId } as QueryFilter<AgentDocument>).sort({ createdAt: -1 }).lean();
  }

  async findOne(userId: string, id: string) {
    const agent = await this.agentModel.findOne({ _id: id, userId } as QueryFilter<AgentDocument>).lean();
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  async create(userId: string, dto: CreateAgentDto) {
    const agent = await this.agentModel.create({
      ...dto,
      userId: userId as any,
    });
    return agent.toObject();
  }

  async update(userId: string, id: string, dto: UpdateAgentDto) {
    const agent = await this.agentModel
      .findOneAndUpdate({ _id: id, userId } as QueryFilter<AgentDocument>, { $set: dto }, { new: true })
      .lean();
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  async remove(userId: string, id: string) {
    const agent = await this.agentModel.findOneAndDelete({ _id: id, userId } as QueryFilter<AgentDocument>);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return { success: true, message: 'Agent deleted' };
  }

  async seedForUser(userId: string) {
    const existing = await this.agentModel.countDocuments({ userId } as QueryFilter<AgentDocument>);
    if (existing > 0) {
      return { seeded: 0, message: 'Agents already seeded for this user' };
    }

    const SEED_AGENTS = [
      {
        name: 'Support Bot',
        description: 'Handles customer inquiries 24/7 with empathy and precision.',
        type: 'customer-support',
        systemPrompt: 'You are a friendly customer support agent. Always be polite, helpful, and concise.',
        tools: ['web-search', 'knowledge-base'],
        memory: { shortTerm: true, longTerm: true },
        model: 'gpt-4o',
        tone: 'friendly',
        audience: 'customers',
        status: 'deployed',
        metrics: { messages: 1240, avgLatency: 320, tokensUsed: 84000 },
      },
      {
        name: 'Research Assistant',
        description: 'Deep dives into topics and summarises findings with citations.',
        type: 'research',
        systemPrompt: 'You are a research assistant. Provide detailed, well-cited answers with sources.',
        tools: ['web-search', 'pdf-reader', 'summariser'],
        memory: { shortTerm: true, longTerm: false },
        model: 'claude-opus-4-6',
        tone: 'professional',
        audience: 'analysts',
        status: 'deployed',
        metrics: { messages: 430, avgLatency: 580, tokensUsed: 210000 },
      },
      {
        name: 'Code Reviewer',
        description: 'Reviews pull requests, flags bugs, and suggests best practices.',
        type: 'code-review',
        systemPrompt: 'You are an expert code reviewer. Identify bugs, performance issues, and style violations.',
        tools: ['code-executor', 'linter'],
        memory: { shortTerm: true, longTerm: false },
        model: 'gpt-4o',
        tone: 'technical',
        audience: 'developers',
        status: 'deployed',
        metrics: { messages: 890, avgLatency: 410, tokensUsed: 320000 },
      },
      {
        name: 'Content Writer',
        description: 'Generates blogs, ads, and social posts tailored to your brand voice.',
        type: 'content-writing',
        systemPrompt: 'You are a creative content writer. Write engaging, SEO-friendly content in the specified brand voice.',
        tools: ['web-search', 'image-gen'],
        memory: { shortTerm: true, longTerm: true },
        model: 'claude-sonnet-4-6',
        tone: 'creative',
        audience: 'marketers',
        status: 'draft',
        metrics: { messages: 210, avgLatency: 490, tokensUsed: 95000 },
      },
      {
        name: 'Email Outreach Agent',
        description: 'Personalises cold-email sequences at scale for sales teams.',
        type: 'email-outreach',
        systemPrompt: 'You are a sales email specialist. Write concise, personalized cold emails that convert.',
        tools: ['web-search', 'crm-integration'],
        memory: { shortTerm: true, longTerm: false },
        model: 'gpt-4o-mini',
        tone: 'persuasive',
        audience: 'prospects',
        status: 'deployed',
        metrics: { messages: 3200, avgLatency: 210, tokensUsed: 480000 },
      },
      {
        name: 'Analytics Bot',
        description: 'Queries dashboards, spots trends, and delivers plain-English reports.',
        type: 'analytics',
        systemPrompt: 'You are a data analytics expert. Interpret data and present insights clearly.',
        tools: ['sql-query', 'chart-gen'],
        memory: { shortTerm: true, longTerm: true },
        model: 'gemini-2.0-flash',
        tone: 'analytical',
        audience: 'executives',
        status: 'deployed',
        metrics: { messages: 670, avgLatency: 620, tokensUsed: 175000 },
      },
    ];

    const docs = SEED_AGENTS.map((a) => ({ ...a, userId }));
    await this.agentModel.insertMany(docs);
    return { seeded: docs.length, message: `Seeded ${docs.length} agents` };
  }
}
