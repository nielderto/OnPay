import { NextResponse } from "next/server";
import { relayMetaTransaction } from "@/lib/relayer";

// Handle POST request
export async function POST(request: Request) {
  try {
    const { sender, receiver, amount, signature } = await request.json();

    console.log("Relay request received:", {
      sender,
      receiver,
      amount,
      signatureLength: signature.length
    });

    try {
      const txHash = await relayMetaTransaction({ sender, receiver, amount, signature });
      return NextResponse.json({ success: true, txHash });
    } catch (relayError: any) {
      console.error("Relayer execution failed:", relayError);

      // Get more detailed error information
      const errorMessage = relayError.message || "Unknown error";
      const errorData = relayError.data || {};
      const errorCode = relayError.code || "UNKNOWN_ERROR";

      return NextResponse.json(
        {
          error: errorMessage,
          errorData,
          errorCode,
          success: false,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Relay API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Relay server crashed',
        success: false,
      },
      { status: 500 }
    );
  }
}

// (Optional) Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
