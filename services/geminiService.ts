import { GoogleGenAI, Chat } from "@google/genai";

// --- قسم الدردشة (يبقى كما هو من الكود الأصلي) ---
// ملاحظة: هذا الكود يستخدم المكتبة القديمة "@google/genai" للدردشة.
// إذا واجهت مشاكل في الدردشة، قد نحتاج إلى تحديث هذا الجزء لاحقًا.
// لكن بما أن تركيزنا على الصور، سنتركه الآن.

if (!process.env.GEMINI_API_KEY) { // تأكد من استخدام المفتاح الصحيح
  throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const createChatSession = (): Chat => {
  const chat = ai.chats.create({
    model: 'gemini-1.5-flash', // استخدام موديل أحدث مضمون
    config: {
      systemInstruction: 'أنت "لورز"، مساعد ذاء اصطناعي فائق القوة ومتعدد المعارف. مهمتك هي تقديم إجابات شاملة ودقيقة ومبتكرة في جميع المجالات، من العلوم والتكنولوجيا إلى الفنون والتاريخ والفلسفة. استخدم بحث Google بفعالية لضمان أن تكون معلوماتك محدّثة ومدعومة بمصادر موثوقة. كن مبدعًا، ومفيدًا، وقادرًا على الإبهار بمعرفتك الواسعة.',
      // tools: [{googleSearch: {}}], // أداة البحث تحتاج إعدادات متقدمة
    },
  });
  return chat;
};


// --- قسم إنشاء الصور (تم تعديله بالكامل ليعمل مع ClipDrop ويدعم الأبعاد) ---

export type AspectRatio = '1:1' | '16:9' | '9:16';

// في ملف services/geminiService.ts

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  // ===> هذا هو السطر الأهم <===
  // نحن نقرأ المفتاح من البيئة، وليس من نص ثابت
  const apiKey = process.env.CLIPDROP_API_KEY;

  if (!apiKey) {
    throw new Error("ClipDrop API key not set");
  }

  const formData = new FormData();
  formData.append('prompt', prompt);

  let width = "1024";
  let height = "1024";

  if (aspectRatio === '16:9') {
    width = "1344";
    height = "768";
  } else if (aspectRatio === '9:16') {
    width = "768";
    height = "1344";
  }
  
  formData.append('width', width);
  formData.append('height', height);

  try {
    const response = await fetch(
      "https://clipdrop-api.co/text-to-image/v1",
      {
        method: "POST",
        headers: {
          'x-api-key': apiKey, // <-- نحن نستخدم المتغير هنا
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Non-200 response: ${await response.text()}`);
    }

    const imageBlob = await response.blob();
    
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