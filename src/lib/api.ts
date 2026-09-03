import { NextResponse } from "next/server";
import { ValidationError } from "./validation";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Wraps a route handler so validation failures become 400s and anything
 * unexpected becomes a 500 without leaking a stack trace to the client.
 */
export async function handle<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message, 400);
    console.error("Unhandled API error:", error);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
