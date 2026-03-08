import Anthropic from "@anthropic-ai/sdk";

export async function POST(req) {
  try {
    const { imageBase64, mimeType, weather, dateStr } = await req.json();

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `당신은 한국 유아 패션 전문가이자 재미있는 육아 인플루언서입니다.
오늘 날짜: ${dateStr}
현재 날씨: 기온 ${weather.temp}℃, 체감 ${weather.feels}℃, ${weather.desc}

아이 옷 사진을 분석해서 JSON만 반환하세요. 마크다운 없이 순수 JSON만.

{
  "items": [
    {
      "type": "면티|점퍼|바지|양말|신발|외투 중 하나",
      "brand": "추정 브랜드 (베베드피노/블루독/베이비갭/에잇세컨즈키즈/무신사스탠다드키즈/네파키즈/빈폴키즈 등 최대한 추정)",
      "price": 숫자만(원),
      "desc": "색상, 소재, 스타일 포함 설명 1-2문장",
      "review": "이 아이템에 대한 유머러스한 엄마 생생후기 1-2문장",
      "emoji": "대표 이모지 1개"
    }
  ],
  "totalPrice": 숫자만(원),
  "polaroidCaption": "폴라로이드 하단 짧은 문구 (예: 귀여운 궁디♡)",
  "instagramTitle": "인스타 게시물 제목 이모지포함 20자내외",
  "instagramBody": "한국 엄마들이 공감할 유머러스한 본문 3-4문장 이모지포함 오늘날씨언급",
  "hashtags": ["등원룩","아기옷","육아일상","엄마그램","유아패션","오늘뭐입지","등원준비","아이옷","육아템","키즈패션","맘스타그램","아기일상","육아스타그램","겨울육아","겨울등원룩","아기패션","키즈코디","오늘의코디","등원스타그램","패션육아"]
}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType, data: imageBase64 },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    let txt = response.content.map((x) => x.text || "").join("");
    txt = txt.replace(/```json|```/g, "").trim();
    const data = JSON.parse(txt);

    return Response.json({ ok: true, data });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
