import { NextResponse } from 'next/server';

const DEFAULT_SERVICES = [
  { id: 'general-maintenance', name: 'General Service', price: 1200 },
  { id: 'oil-change', name: 'Oil Change', price: 799 },
  { id: 'brake-service', name: 'Brake Service', price: 1499 },
  { id: 'ac-service', name: 'AC Service', price: 999 },
  { id: 'battery-replacement', name: 'Battery Replacement', price: 2999 },
  { id: 'wheel-alignment', name: 'Wheel Alignment', price: 799 },
  { id: 'tyre-replacement', name: 'Tyre Replacement', price: 3500 },
  { id: 'engine-diagnosis', name: 'Engine Diagnosis', price: 899 },
  { id: 'car-wash', name: 'Car Wash', price: 299 },
  { id: 'interior-cleaning', name: 'Interior Cleaning', price: 599 },
  { id: 'exterior-polishing', name: 'Exterior Polishing', price: 1499 },
  { id: 'suspension-check', name: 'Suspension Check', price: 699 },
  { id: 'coolant-replacement', name: 'Coolant Replacement', price: 599 },
  { id: 'air-filter-replacement', name: 'Air Filter Replacement', price: 399 },
  { id: 'spark-plug-replacement', name: 'Spark Plug Replacement', price: 499 },
];

export async function POST(request) {
  try {
    const { problemDescription } = await request.json();

    if (!problemDescription) {
      return NextResponse.json({ error: 'Problem description is required.' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('Missing OPENROUTER_API_KEY environment variable.');
      return NextResponse.json({ error: 'Server misconfiguration: missing API key.' }, { status: 500 });
    }

    const servicesJson = JSON.stringify(DEFAULT_SERVICES, null, 2);

    const systemPrompt =
      'You are an expert automotive mechanic AI assistant for Bug Slayers Garage, a premium car service center in India.\n' +
      'The user will describe a problem with their car in plain language.\n' +
      'Your job is to analyze the symptoms and recommend the best services from our shop.\n\n' +
      'Our available services:\n' +
      servicesJson + '\n\n' +
      'Respond ONLY with a raw JSON object (absolutely no markdown, no code fences, no extra text) in this exact format:\n' +
      '{"diagnosis":"one sentence describing the likely root cause","explanation":"2-3 friendly sentences explaining the issue and urgency","recommendedServiceIds":["service-id-1","service-id-2"]}\n' +
      'Only include IDs from the list above. Always include at least one service ID.';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Car Garage AI',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: problemDescription },
        ],
        temperature: 0.2,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData?.error?.message || errData?.message || '';
      console.error('OpenRouter API status:', response.status);
      console.error('OpenRouter Error:', JSON.stringify(errData, null, 2));

      if (response.status === 429 || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate')) {
        return NextResponse.json(
          { error: 'AI service is busy. Please wait a moment and try again.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to communicate with AI diagnostic service.', detail: errMsg || response.status },
        { status: 502 }
      );
    }

    const data = await response.json();
    const candidateText = data.choices?.[0]?.message?.content;

    if (!candidateText) {
      console.error('Empty OpenRouter response:', JSON.stringify(data, null, 2));
      return NextResponse.json({ error: 'No response from AI.' }, { status: 500 });
    }

    let parsedResult;
    try {
      // Strip markdown code fences if the model adds them anyway
      const cleaned = candidateText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/g, '')
        .trim();
      parsedResult = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse AI JSON. Raw output:', candidateText);
      return NextResponse.json({ error: 'Failed to parse AI response.' }, { status: 500 });
    }

    return NextResponse.json(parsedResult);

  } catch (error) {
    console.error('Diagnostic API Route Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
