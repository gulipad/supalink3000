import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req) {
  const requestData = await req.json();

  try {
    if (!requestData.id) {
      return NextResponse.json({ error: "No ID provided" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("system_responses")
      .select("data")
      .eq("id", requestData.id)
      .single();

    if (error) {
      console.error("Error fetching from Supabase:", error);
      return NextResponse.json(
        { error: "Error fetching data" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "No data found for provided ID" },
        { status: 404 }
      );
    }

    return NextResponse.json(data.data, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
