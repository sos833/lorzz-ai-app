import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createChatSession = (): Chat => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'أنت "لورز"، مساعد ذكاء اصطناعي فائق القوة ومتعدد المعارف. مهمتك هي تقديم إجابات شاملة ودقيقة ومبتكرة في جميع المجالات، من العلوم والتكنولوجيا إلى الفنون والتاريخ والفلسفة. استخدم بحث Google بفعالية لضمان أن تكون معلوماتك محدّثة ومدعومة بمصادر موثوقة. كن مبدعًا، ومفيدًا، وقادرًا على الإبهار بمعرفتك الواسعة.',
      tools: [{googleSearch: {}}],
    },
  });
  return chat;
};

export type AspectRatio = '1:1' | '16:9' | '9:16';

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  // نحن نستخدم الآن متغير بيئة جديد لمفتاح Stability AI
  const apiKey = process.env.STABILITY_API_KEY;

  if (!apiKey) {
    throw new Error("Stability AI API key not set");
  }

  // تحويل نسبة العرض إلى الارتفاع إلى أبعاد بالبكسل
  let width = 1024;
  let height = 1024;
  if (aspectRatio === '16:9') {
    width = 1536;
    height = 864;
  } else if (aspectRatio === '9:16') {
    width = 864;
    height = 1536;
  }

  try {
    const response = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: height,
          width: width,
          samples: 1,
          steps: 30,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Non-200 response: ${await response.text()}`);
    }

    const responseJSON: any = await response.json();

    if (responseJSON.artifacts && responseJSON.artifacts.length > 0) {
      // الصورة تأتي بتنسيق base64 مباشرة
      return responseJSON.artifacts[0].base64;
    } else {
      throw new Error("لم يتم إنشاء أي صور.");
    }
  } catch (error) {
    console.error("Error generating image with Stability AI:", error);
    throw new Error("حدث خطأ أثناء إنشاء الصورة. يرجى المحاولة مرة أخرى لاحقًا.");
  }
};