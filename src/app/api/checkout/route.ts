import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Simulate checking out
    const { amount, item, token, paymentToken, total } = body;

    // Use total as fallback for amount, paymentToken for token
    const finalAmount = amount ?? total;
    const finalToken = token ?? paymentToken;

    // Fix Bug 1: Return 401 if token is missing instead of throwing 500
    if (!finalToken) {
      return NextResponse.json({ error: "Unauthorized: Missing authentication token" }, { status: 401 });
    }

    // Fix Bug 2: Proper validation for amount
    if (finalAmount === undefined || typeof finalAmount !== 'number' || finalAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount: Must be a positive number" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Order processed successfully",
      transactionId: `txn_${Math.random().toString(36).substring(7)}`,
      amountProcessed: finalAmount
    }, { status: 200 });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}
