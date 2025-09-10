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
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return base64ImageBytes;
    } else {
      throw new Error("لم يتم إنشاء أي صور. حاول مرة أخرى بوصف مختلف.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("حدث خطأ أثناء إنشاء الصورة. يرجى المحاولة مرة أخرى لاحقًا.");
  }
};