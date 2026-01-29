import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Session } from 'next-auth';

interface ExtendedSession extends Session {
  accessToken?: string;
}

const ORCHESTRATE_API_URL = process.env.ORCHESTRATE_API_URL || 'http://localhost:8000';
const ORCHESTRATE_AGENT_ID = process.env.ORCHESTRATE_AGENT_ID || '7e78e8e6-27a7-4922-bb90-955c5367778e';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession;
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messages, threadId } = body;

    // Prepare the request to Orchestrate
    const orchestrateRequest = {
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      })),
      context: {
        sso_token: session.accessToken!,
        wxo_username: session.user?.name || '',
        wxo_email: session.user?.email || ''
      },
      stream: false
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessToken!}`
    };

    if (threadId) {
      headers['X-IBM-THREAD-ID'] = threadId;
    }

    // Call Orchestrate Chat Completions API
    const orchestrateResponse = await fetch(
      `${ORCHESTRATE_API_URL}/api/v1/orchestrate/${ORCHESTRATE_AGENT_ID}/chat/completions`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(orchestrateRequest)
      }
    );

    if (!orchestrateResponse.ok) {
      const errorText = await orchestrateResponse.text();
      console.error('Orchestrate API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to communicate with Orchestrate', details: errorText },
        { status: orchestrateResponse.status }
      );
    }

    const data = await orchestrateResponse.json();
    
    return NextResponse.json({
      message: data.choices?.[0]?.message?.content || 'No response from agent',
      threadId: data.thread_id,
      fullResponse: data
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Made with Bob
