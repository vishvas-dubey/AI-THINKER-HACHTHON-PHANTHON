/** 🤖 AI-POWERED API ROUTE - PHANTOM-OPS TEST GENERATOR **/
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log("Test Generation API called...");
  try {
    const { flowName } = await req.json();
    console.log("Flow Name:", flowName);
    const name = flowName || "Default Flow";

    const genDir = path.join(process.cwd(), 'public', 'generated');
    try {
      await fs.access(genDir);
    } catch {
      await fs.mkdir(genDir, { recursive: true });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (OPENROUTER_API_KEY) {
      console.log("Using OpenRouter API (Llama 3)...");
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://github.com/phantom-ops", // Optional, for OpenRouter rankings
          "X-Title": "AI Release Commander", // Optional
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "meta-llama/llama-3.1-8b-instruct:free",
          "messages": [
            {
              "role": "user",
              "content": `Generate a CSV of 10 mission-critical test scenarios for a Fintech flow named "${name}". 
              Include columns: ID, Scenario, Priority, Expected Result.
              Focus on edge cases like security, concurrency, and validation.
              Return ONLY the CSV content without any conversational text or markdown code blocks.`
            }
          ]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "OpenRouter API failed");
      }

      const csvContent = data.choices[0].message.content.trim();

      const fileName = `scenarios_${name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.csv`;
      const filePath = path.join(process.cwd(), 'public', 'generated', fileName);
      await fs.writeFile(filePath, csvContent);

      return NextResponse.json({ url: `/generated/${fileName}` });
    } else {
      // Fallback
      const fallbackCsv = name.toLowerCase().includes("payment") 
        ? "ID,Scenario,Priority,Expected Result\nPMT-001,Payment with insufficient balance,High,Error 402 Payment Required\nPMT-002,Payment Gateway Timeout,High,System should retry and then fail gracefully\nPMT-003,Double tap on pay button (Concurrency),Critical,Idempotency key should prevent double charge"
        : "ID,Scenario,Priority,Expected Result\nTC-001,General flow validation,Medium,Success\nTC-002,Boundary value test,High,Validation error";
      
      const fileName = `scenarios_${name.replace(/\s+/g, '_').toLowerCase()}_fallback.csv`;
      const filePath = path.join(process.cwd(), 'public', 'generated', fileName);
      await fs.writeFile(filePath, fallbackCsv);
      return NextResponse.json({ url: `/generated/${fileName}` });
    }
  } catch (error: any) {
    console.error("API Error Detailed:", error);
    return NextResponse.json({ 
      error: "Failed to generate", 
      details: error.message || "Unknown error" 
    }, { status: 500 });
  }
}
