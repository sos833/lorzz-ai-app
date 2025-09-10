// services/geminiService.ts

import { GoogleGenerativeAI, ChatSession, GenerationConfig, SafetySetting, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
console.log("The API Key my app is using is:", process.env.GEMINI_API_KEY);
// 1. التحقق من وجود مفتاح API
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set");
}

// 2. تهيئة النموذج
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // استخدام موديل أحدث ومضمون
  // يمكنك إضافة System Instruction هنا مباشرة
  systemInstruction: 'أنت "لورز"، مساعد ذكاء اصطناعي فائق القوة ومتعدد المعارف. مهمتك هي تقديم إجابات شاملة ودقيقة ومبتكرة في جميع المجالات، من العلوم والتكنولوجيا إلى الفنون والتاريخ والفلسفة. استخدم بحث Google بفعالية لضمان أن تكون معلوماتك محدّثة ومدعومة بمصادر موثوقة. كن مبدعًا، ومفيدًا، وقادرًا على الإبهار بمعرفتك الواسعة.',
});


// 3. إنشاء جلسة محادثة جديدة (الطريقة المحدثة)
export const createChatSession = (): ChatSession => {
  const generationConfig: GenerationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
  };

  // إعدادات الأمان (مهمة لمنع حجب الإجابات)
  const safetySettings: SafetySetting[] = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ];

  const chatSession = model.startChat({
    generationConfig,
    safetySettings,
    history: [], // يمكنك إضافة سجل محادثات قديم هنا إذا أردت
  });
  
  return chatSession;
};


// 4. وظيفة إنشاء الصور (سنتركها للمستقبل الآن للتركيز على الدردشة)
// الكود الأصلي لإنشاء الصور غير متوافق مع هذه المكتبة
// سنقوم بتعطيله مؤقتًا لنجعل التطبيق يعمل

/*
export type AspectRatio = '1:1' | '16:9' | '9:16';

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  // ... الكود المستقبلي لإنشاء الصور سيكون هنا
  console.log("Image generation is not implemented yet.");
  throw new Error("Image generation is not implemented yet.");
};
*/