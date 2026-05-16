import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const runtime = 'nodejs'; // Use nodejs runtime for full fetch capabilities
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const encoder = new TextEncoder();
    
    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const allLogs: { timestamp: string, message: string }[] = [];
        
        const sendLog = (message: string) => {
          const logEntry = { timestamp: new Date().toISOString(), message };
          allLogs.push(logEntry);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'log', ...logEntry })}\n\n`));
        };

        const sendResult = (status: string, analysis: string) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'result', status, analysis })}\n\n`));
        };

        try {
          sendLog(`USER: ${prompt}`);
          sendLog("AGENT [QA Orchestrator]: Initializing testing swarm...");
          
          if (!process.env.GEMINI_API_KEY) {
            sendLog("AGENT [System]: ERROR - Gemini API key not found.");
            sendResult("failed", "API key missing.");
            controller.close();
            return;
          }

          const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: "You are an autonomous QA Agent. Your goal is to write tests, execute them against the target API, and find vulnerabilities or bugs. You have a tool to make HTTP requests. Always explain your thought process briefly before executing a test. The target API is usually http://localhost:3000/api/checkout. Check for edge cases like negative amounts, missing tokens, invalid payloads. After testing, provide a final analysis.",
            tools: [
              {
                functionDeclarations: [
                  {
                    name: "execute_http_request",
                    description: "Make an HTTP request to test an API endpoint",
                    parameters: {
                      type: "OBJECT",
                      properties: {
                        url: { type: "STRING", description: "The full URL to test (e.g., http://localhost:3000/api/checkout)" },
                        method: { type: "STRING", description: "HTTP method (GET, POST)" },
                        body: { type: "STRING", description: "JSON string representing the request body" }
                      },
                      required: ["url", "method"]
                    }
                  }
                ]
              }
            ]
          });

          const chat = model.startChat();

          sendLog("AGENT [QA Bot]: Planning test vectors for the target API...");

          // Start the interaction
          let response = await chat.sendMessage(prompt);
          
          // Agent loop (max 3 iterations for demo)
          let iterations = 0;
          let finalAnalysis = "";

          while (iterations < 4) {
            const call = response.response.functionCalls()?.[0];
            
            if (call && call.name === "execute_http_request") {
              const { url, method, body } = call.args as any;
              sendLog(`AGENT [Network]: Executing ${method} ${url} with payload: ${body || 'none'}`);
              
              // Actually execute the HTTP request
              let fetchResult;
              let status;
              try {
                const res = await fetch(url, {
                  method: method || "GET",
                  headers: { "Content-Type": "application/json" },
                  body: body ? body : undefined
                });
                status = res.status;
                const data = await res.text();
                fetchResult = `Status: ${status}, Body: ${data}`;
              } catch (e: any) {
                status = 500;
                fetchResult = `Fetch Error: ${e.message}`;
              }
              
              sendLog(`AGENT [Infra]: Received response [HTTP ${status}]`);
              
              // Send result back to model
              response = await chat.sendMessage([{
                functionResponse: {
                  name: "execute_http_request",
                  response: { result: fetchResult }
                }
              }]);
              iterations++;
            } else {
              // No more function calls, agent is done
              finalAnalysis = response.response.text();
              break;
            }
          }

          sendLog("AGENT [Architect]: Finalizing test report...");
          
          // Determine if bugs were found based on the agent's final text
          const hasBugs = finalAnalysis.toLowerCase().includes("bug") || finalAnalysis.toLowerCase().includes("vulnerability") || finalAnalysis.toLowerCase().includes("500") || finalAnalysis.toLowerCase().includes("fail");
          
          sendResult(hasBugs ? "critical" : "success", finalAnalysis);

          // Save the report to a file
          try {
            const reportDir = path.join(process.cwd(), 'reports');
            const reportId = `report_${Date.now()}`;
            const reportData = {
              id: reportId,
              timestamp: new Date().toISOString(),
              prompt,
              logs: allLogs,
              analysis: finalAnalysis,
              status: hasBugs ? "critical" : "success"
            };
            
            await fs.writeFile(
              path.join(reportDir, `${reportId}.json`),
              JSON.stringify(reportData, null, 2)
            );
            console.log(`Report saved: ${reportId}.json`);
          } catch (fsError) {
            console.error("Failed to save report:", fsError);
          }

        } catch (error: any) {
          console.error("Agent execution error:", error);
          sendLog(`AGENT [System Error]: ${error.message}`);
          sendResult("failed", "Agent crashed during execution.");
        } finally {
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
