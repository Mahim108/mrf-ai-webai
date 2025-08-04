const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { message, api } = JSON.parse(event.body);
  let reply = "";
  let image_url = "";

  try {
    if (api === 'openai') {
      // OpenAI ChatGPT (GPT-4o)
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{role: "user", content: message}]
        })
      });
      const openaiData = await openaiRes.json();
      reply = openaiData.choices?.[0]?.message?.content || "No response";
    }

    // OpenAI DALL·E 3 Image Generation (returns image_url)
    else if (api === 'dalle') {
      const dalleRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: message,
          n: 1,
          size: "1024x1024"
        })
      });
      const dalleData = await dalleRes.json();
      image_url = dalleData.data?.[0]?.url || "";
      reply = image_url ? "Here is your image!" : (dalleData.error?.message || "No image generated.");
    }

    // Anthropic Claude 3 Opus
    else if (api === 'anthropic') {
      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 1024,
          messages: [{ role: "user", content: message }]
        })
      });
      const anthropicData = await anthropicRes.json();
      reply = anthropicData.content?.[0]?.text || "No response";
    }

    // Google Gemini 1.5 Pro
    else if (api === 'gemini') {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${process.env.GOOGLE_GENAI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      });
      const geminiData = await geminiRes.json();
      reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    }

    // Stability AI (Stable Diffusion, returns image_url)
    else if (api === 'stability') {
      const stabilityRes = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.STABILITY_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          prompt: message,
          output_format: "png"
        })
      });
      const stabilityData = await stabilityRes.json();
      image_url = stabilityData.image || "";
      reply = image_url ? "Here is your image!" : (stabilityData.error?.message || "No image generated.");
    }

    else {
      reply = "API not supported.";
    }
  } catch (e) {
    reply = `Error: ${e.message}`;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ reply, image_url })
  };
};
