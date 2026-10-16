import {GoogleGenerativeAI} from "@google/generative-ai";
import {NextResponse} from "next/server";

export async function POST(request) {
  try {
    const {prompt} = await request.json();

    if (typeof prompt !== "string" || !prompt.trim()) {
        return NextResponse.json({error: "Prompt is required"}, {status: 400});
    }
    
    const apiKey = process.env.GEMINI_API?.trim();
    if (!apiKey) {
      console.error("GEMINI_API is not configured.");
      return NextResponse.json(
        {error: "The chat service is not configured."},
        {status: 500}
      );
    }

    const GenIA = new GoogleGenerativeAI(apiKey);

    const model = GenIA.getGenerativeModel({
        model: "gemini-2.5-flash"
    })

    const result = await model.generateContent(prompt.trim());
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({text});

  } catch (error) {
    console.error("Error generating content:", error);

    const status = error?.status;
    let message = "there's erreur in the AI service, we are working on it.";


    return NextResponse.json({error: message}, {status: 502});
  }
}