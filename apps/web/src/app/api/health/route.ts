import { NextResponse } from "next/server";

const GRAPH_SERVICE_URL =
  process.env.GRAPH_SERVICE_URL ?? "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetch(`${GRAPH_SERVICE_URL}/health`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { status: "error", detail: "graph-service unhealthy" },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        status: "error",
        detail: `Cannot reach graph-service at ${GRAPH_SERVICE_URL}`,
      },
      { status: 502 },
    );
  }
}
