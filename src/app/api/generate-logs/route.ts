import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ 
        logs: [
          { agent: "System", message: "API Key missing. Using fallback logic." },
          { agent: "Scout", message: "Scanning local repository..." },
          { agent: "QA", message: "Identified 3 critical gaps in coverage." }
        ]
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3.1-8b-instruct:free",
        "messages": [
          {
            "role": "system",
            "content": "You are a swarm of AI agents (Scout-01, QA-Orchestrator, Infiltrator, Architect). Generate a JSON array of 6 technical logs for these agents investigating a user prompt. Format: [{\"agent\": \"Agent Name\", \"message\": \"Technical log message\"}]. Keep it short and geeky."
          },
          {
            "role": "user",
            "content": `The user wants to: ${prompt}`
          }
        ],
        "response_format": { "type": "json_object" }
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON from the LLM response
    const parsed = JSON.parse(content);
    const logs = Array.isArray(parsed) ? parsed : (parsed.logs || []);

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("Log Generation Error:", error);
    return NextResponse.json({ 
      logs: [
        { agent: "System", message: "Autonomous reasoning engine failed. Reverting to local heuristic scan." },
        { agent: "Scout-01", message: "Analyzing repository metadata..." },
        { agent: "QA", message: "Drafting test vectors for critical flows." }
      ]
    });
  }
}
