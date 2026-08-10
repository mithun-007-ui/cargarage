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

function getFallbackDiagnosis(desc) {
  const lower = (desc || '').toLowerCase();
  
  if (lower.includes('brake') || lower.includes('stop') || lower.includes('squeak') || lower.includes('grind')) {
    return {
      diagnosis: 'Potential brake pad wear or rotor friction imbalance.',
      explanation: 'Worn brake components reduce stopping safety and can score brake rotors if left unserviced. We recommend an immediate brake system inspection.',
      recommendedServiceIds: ['brake-service'],
    };
  }
  if (lower.includes('ac') || lower.includes('cool') || lower.includes('heat') || lower.includes('smell') || lower.includes('air')) {
    return {
      diagnosis: 'AC refrigerant gas low or clogged cabin air filter.',
      explanation: 'Inefficient cooling or unusual cabin odors are typical signs of low refrigerant or dust accumulation in the AC evaporator and filter.',
      recommendedServiceIds: ['ac-service', 'air-filter-replacement'],
    };
  }
  if (lower.includes('battery') || lower.includes('start') || lower.includes('click') || lower.includes('power') || lower.includes('dead')) {
    return {
      diagnosis: 'Low battery charge or alternator charging system fault.',
      explanation: 'Difficulty starting the engine or clicking sounds when turning the key indicate battery degradation or alternator output drop.',
      recommendedServiceIds: ['battery-replacement', 'general-maintenance'],
    };
  }
  if (lower.includes('oil') || lower.includes('smoke') || lower.includes('leak') || lower.includes('engine') || lower.includes('knock')) {
    return {
      diagnosis: 'Degraded engine oil or ignition system misfire.',
      explanation: 'Engine hesitation or unusual smoke suggests contaminated engine oil or worn spark plugs affecting cylinder combustion.',
      recommendedServiceIds: ['engine-diagnosis', 'oil-change', 'spark-plug-replacement'],
    };
  }
  if (lower.includes('tyre') || lower.includes('tire') || lower.includes('wheel') || lower.includes('vibrat') || lower.includes('pull')) {
    return {
      diagnosis: 'Wheel misalignment or uneven tyre tread wear.',
      explanation: 'Steering vibrations or vehicle pulling to one side indicate out-of-balance wheels or suspension geometry offset.',
      recommendedServiceIds: ['wheel-alignment', 'tyre-replacement', 'suspension-check'],
    };
  }

  return {
    diagnosis: 'General vehicle performance issue or routine service due.',
    explanation: 'Based on your description, a comprehensive multi-point health inspection will identify any underlying component wear or fluid level issues.',
    recommendedServiceIds: ['general-maintenance', 'engine-diagnosis'],
  };
}

export async function POST(request) {
  try {
    const { problemDescription } = await request.json();

    if (!problemDescription) {
      return NextResponse.json({ error: 'Problem description is required.' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY missing, using fallback diagnostic engine.');
      return NextResponse.json(getFallbackDiagnosis(problemDescription));
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

    try {
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
        console.warn('OpenRouter API returned error status:', response.status, errMsg);
        // Fallback gracefully so user gets diagnostic result
        return NextResponse.json(getFallbackDiagnosis(problemDescription));
      }

      const data = await response.json();
      const candidateText = data.choices?.[0]?.message?.content;

      if (!candidateText) {
        return NextResponse.json(getFallbackDiagnosis(problemDescription));
      }

      const cleaned = candidateText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/g, '')
        .trim();
      const parsedResult = JSON.parse(cleaned);

      return NextResponse.json(parsedResult);
    } catch (apiError) {
      console.warn('OpenRouter API call failed, using fallback engine:', apiError);
      return NextResponse.json(getFallbackDiagnosis(problemDescription));
    }

  } catch (error) {
    console.error('Diagnostic API Route Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
