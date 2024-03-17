// llm.test.ts
jest.setTimeout(10000000); // Increase the timeout to 10 seconds (10000 ms)

import { feedAssignmentToLLM, extractPriorityLevel, extractEstimatedTime } from './llm-helpers';

describe('LLM Functions', () => {
  test('feedAssignmentToLLM should return a valid response', async () => {
    const prompt = `
      Assignment Title: English Research Paper
      Description: 5 paragraph, 5000 words.
      Due Date: 2023-06-15
      Points Possible: 100
      Course Name: English Literature AP
    `;

    const response = await feedAssignmentToLLM(prompt);
    console.log('LLM Response:', response);
    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });

  test('extractPriorityLevel should return the priority level from a valid JSON', () => {
    const llmOutput = '{"priority": 2, "estimatedTime": 60}';
    const priorityLevel = extractPriorityLevel(llmOutput);
    console.log('Priority Level:', priorityLevel);
    expect(priorityLevel).toBe(2);
  });

  test('extractPriorityLevel should throw an error for invalid JSON', () => {
    const llmOutput = 'invalid JSON';
    expect(() => extractPriorityLevel(llmOutput)).toThrow('Invalid JSON in the LLM output.');
  });

  test('extractPriorityLevel should throw an error for missing priority level', () => {
    const llmOutput = '{"estimatedTime": 60}';
    expect(() => extractPriorityLevel(llmOutput)).toThrow('Priority level not found or invalid in the LLM output.');
  });

  test('extractEstimatedTime should return the estimated time from a valid JSON', () => {
    const llmOutput = '{"priority": 2, "estimatedTime": 60}';
    const estimatedTime = extractEstimatedTime(llmOutput);
    console.log('Estimated Time:', estimatedTime);
    expect(estimatedTime).toBe(60);
  });

  test('extractEstimatedTime should throw an error for invalid JSON', () => {
    const llmOutput = 'invalid JSON';
    expect(() => extractEstimatedTime(llmOutput)).toThrow('Invalid JSON in the LLM output.');
  });

  test('extractEstimatedTime should throw an error for missing estimated time', () => {
    const llmOutput = '{"priority": 2}';
    expect(() => extractEstimatedTime(llmOutput)).toThrow('Estimated time not found or invalid in the LLM output.');
  });
});