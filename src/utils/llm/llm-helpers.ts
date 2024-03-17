import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION,
});

export async function feedAssignmentToLLM(prompt: string): Promise<string> {
  const messages = [
    {
      role: "system",
      content:
        "You are a high school assignment expert, and your job is to assign priority and estimated time to assignments you are given, based on things like due_date, points_possible, description, course name, and more. The harder and more important the assignment, the higher the priority. Use your juudgement for the estimated time. PDQs should be around 30 minutes, AP MCQs should be around 30 minutes, and Essays can be multiple hours. Use your best judgement. Priority can be 1, 2, 3 (highest). Estimated time can be integer in minutes. Return JSON {priority: priority, estimatedTime: estimatedTime}.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    //@ts-ignore
    messages: messages,
    response_format: { type: "json_object" }, // Assign the response_format property correctly
  });

  if (
    response.choices &&
    response.choices[0].message &&
    response.choices[0].message.content
  ) {
    return response.choices[0].message.content;
  } else {
    throw new Error("No response from LLM");
  }
}

export function extractPriorityLevel(llmOutput: string): number {
  try {
    const json = JSON.parse(llmOutput);
    if (json.priority && typeof json.priority === "number") {
      return json.priority;
    } else {
      throw new Error("Priority level not found or invalid in the LLM output.");
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON in the LLM output.");
    } else {
      throw error;
    }
  }
}

export function extractEstimatedTime(llmOutput: string): number {
  try {
    const json = JSON.parse(llmOutput);
    if (json.estimatedTime && typeof json.estimatedTime === "number") {
      return json.estimatedTime;
    } else {
      throw new Error("Estimated time not found or invalid in the LLM output.");
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON in the LLM output.");
    } else {
      throw error;
    }
  }
}