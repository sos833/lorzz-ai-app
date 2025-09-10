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

// في ملف services/geminiService.ts


export type AspectRatio = '1:1' | '16:9' | '9:16';

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  // نستخدم الآن متغير بيئة جديد لمفتاح ClipDrop
  const apiKey = process.env.CLIPDROP_API_KEY;

  if (!apiKey) {
    throw new Error("ClipDrop API key not set");
  }

  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('aspect_ratio', aspectRatio);

  try {
    const response = await fetch(
      "https://clipdrop-api.co/text-to-image/v1",
      {
        method: "POST",
        headers: {
          'x-api-key': apiKey, // ClipDrop يستخدم هذا الهيدر
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Non-200 response: ${await response.text()}`);
    }

    // ClipDrop تعيد الصورة مباشرة وليس JSON
    const imageBlob = await response.blob();
    
    // تحويل الصورة إلى base64 لعرضها
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
    });

  } catch (error) {
    console.error("Error generating image with ClipDrop:", error);
    throw new Error("حدث خطأ أثناء إنشاء الصورة. يرجى المحاولة مرة أخرى لاحقًا.");
  }
};