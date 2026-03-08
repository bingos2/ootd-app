export const maxDuration = 30;

export async function POST(req) {
  try {
    const { imageBase64, mimeType, weather, dateStr } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ ok: false, error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." }, { status: 500 });
    }

    const prompt = `당신은 한국 유아 패션 전문가이자 재미있는 육아 인플루언서입니다.
오늘 날짜: ${dateStr}
현재 날씨: 기온 ${weather.temp}℃, 체감 ${weather.feels}℃, ${weather.desc}

아이 옷 사진을 분석해서 JSON만 반환하세요. 마크다운 없이 순수 JSON만.

{
  "items": [
    {
      "type": "면티|점퍼|바지|양말|신발|외투 중 하나",
      "brand": "추정 브랜드 (베베드피노/블루독/베이비갭/에잇세컨즈키즈/무신사스탠다드키즈/네파키즈/빈폴키즈 등)",
      "price": 15000,
      "desc": "색상, 소재, 스타일 포함 설명 1-2문장",
      "review": "유머러스한 엄마 생생후기 1-2문장",
      "emoji": "👕"
    }
  ],
  "totalPrice": 50000,
  "polaroidCaption": "귀여운 궁디♡",
  "instagramTitle": "인스타 제목 이모지포함 20자내외",
  "instagramBody": "공감 유머러스 본문 3-4문장 이모지포함 날씨언급",
  "hashtags": ["등원룩","아기옷","육아일상","엄마그램","유아패션","오늘뭐입지","등원준비","아이옷","육아템","키즈패션","맘스타그램","아기일상","육아스타그램","겨울육아","겨울등원룩","아기패션","키즈코디","오늘의코디","등원스타그램","패션육아"]
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mimeType, data: imageBase64 } },
            { type: "text", text: prompt },
          ],
        }],
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      return Response.json({
        ok: false,
        error: `Anthropic API 오류 (${response.status}): ${json.error?.message || JSON.stringify(json)}`
      }, { status: 500 });
    }

    let txt = (json.content || []).map((x) => x.text || "").join("");
    txt = txt.replace(/```json|```/g, "").trim();

    let data;
    try {
      data = JSON.parse(txt);
    } catch (parseErr) {
      return Response.json({ ok: false, error: "JSON 파싱 실패: " + txt.slice(0, 200) }, { status: 500 });
    }

    return Response.json({ ok: true, data });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
