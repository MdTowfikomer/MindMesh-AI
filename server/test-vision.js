const run = async () => {
  const res = await fetch('https://mindmesh-api.vercel.app/api/v1/ai/vision', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-key': 'SHIPATHON',
    },
    body: JSON.stringify({
      prompt: 'You are an AI assistant for a note-taking app similar to mymind. Analyze this image and return a JSON response with: 1. "title": A short descriptive title. 2. "tldr": A 1-2 sentence summary. 3. "tags": An array of 3-6 relevant tags. 4. "classification": One of "image", "pricing", "code", "whiteboard", "text". 5. "ocrText": Any readable text. Return ONLY valid JSON.',
      imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      mimeType: 'image/png',
    }),
  });
  const data = await res.json();
  console.log('STATUS:', res.status);
  console.log('RESULT:', JSON.stringify(data, null, 2));
};
run();
