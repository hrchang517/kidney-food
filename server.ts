import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    return new GoogleGenAI({ apiKey });
  }

  app.post("/api/check-food", async (req, res) => {
    try {
      const { foodName } = req.body;
      if (!foodName || typeof foodName !== "string") {
        return res.status(400).json({ error: "음식 이름을 입력해주세요." });
      }

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `'${foodName}'이(가) 신장 질환 환자에게 적합한지 알려줘.
        나트륨, 칼륨, 인 함량을 고려해서 설명해주고, 섭취 시 주의사항이나 대체 식품이 있다면 함께 알려줘. 
        한국어로 친절하게 설명해줘.`,
      });

      return res.json({ result: response.text || "정보를 가져오지 못했습니다." });
    } catch (error: any) {
      console.error("Error checking food safety:", error);
      return res.status(500).json({ error: error?.message || "서버 오류가 발생했습니다." });
    }
  });

  app.post("/api/meal-plan", async (req, res) => {
    try {
      const { healthStage } = req.body;
      const healthInfo = healthStage || "일반적인 신장 건강 관리";

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `신장 건강 상태: ${healthInfo}. 이 상태에 맞는 하루 식단(아침, 점심, 저녁, 간식)을 추천해줘. 
        각 식사는 메뉴 이름과 간단한 설명(왜 신장에 좋은지 등)을 포함해야 해. 
        또한 신장 건강을 위한 일반적인 팁 3가지를 포함해줘.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              breakfast: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  menu: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["time", "menu", "description"]
              },
              lunch: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  menu: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["time", "menu", "description"]
              },
              dinner: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  menu: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["time", "menu", "description"]
              },
              snack: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  menu: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["time", "menu", "description"]
              },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["breakfast", "lunch", "dinner", "snack", "tips"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (error: any) {
      console.error("Error generating meal plan:", error);
      return res.status(500).json({ error: error?.message || "식단 생성 중 오류가 발생했습니다." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
