import {GoogleGenerativeAI} from "@google/generative-ai";
import {NextResponse} from "next/server";

export async function POST(request) {
  try {
    const {prompt} = await request.json();

    if (!prompt) {
        return NextResponse.json({error: "Prompt is required"}, {status: 400});
    }
    
    const GenIA = new GoogleGenerativeAI( process.env.GOOGLE_API_KEY);

    const model = GenIA.getGenerativeModel({
        model : "gemini-2.0-flash"
    })

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();


    return NextResponse.json({text});

  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json({error: "Failed to generate content"}, {status: 500});
  }
}