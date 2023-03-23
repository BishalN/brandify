import { OpenAIStreamPayload, OpenAIStream } from "utils/OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  const { style, title } = (await req.json()) as {
    title?: string;
    style?: string;
  };

  const prompt = `Generate 5 brand names and slogans for a brand that ${title}, with ${style} Personality, `;

  if (!style || !title) {
    return new Response("All fields are required", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model: "text-davinci-003",
    prompt,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 3400,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
};

export default handler;
