export const maxDuration = 30;

export async function POST(req) {
  console.log("=== /api/analyze 호출됨 ===");

  try {
    const body = await req.json();
    console.log("요청 받음, mimeType:", body.mimeType);
    console.log("이미지 크기(chars):", body.imageBase64 ? body.imageBase64.length : "없음");
    console.log("날씨:", JSON.stringify(body.weather));

    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log("API 키 존재:", !!apiKey);
    console.log("API 키 앞 10자:", apiKey ? apiKey.slice(0, 10) : "없음");

    if (!apiKey) {
      console.log("ERROR: API 키 없음");
      return Response.json({ ok: false, error: "ANTHROPIC_API_KEY 없음" }, { status: 500 });
    }

    const imageBase64 = body.imageBase64;
    const mimeType = body.mimeType;
    const weather = body.weather;
    const dateStr = body.dateStr;

    const weatherInfo = "기온 " + weather.temp + "℃, 체감 " + weather.feels + "℃, " + weather.desc;
    const promptText = "당신은 한국 유아 패션 전문가입니다.\n"
      + "오늘 날짜: " + dateStr + "\n"
      + "현재 날씨: " + weatherInfo + "\n\n"
      + "아이 옷 사진을 분석해서 JSON만 반환하세요. 마크다운 없이 순수 JSON만.\n\n"
      + '{"items":[{"type":"면티","brand":"블루독","price":15000,"desc":"설명","review":"후기","emoji":"👕"}],"totalPrice":50000,"polaroidCaption":"귀여운 궁디♡","instagramTitle":"제목","instagramBody":"본문","hashtags":["등원룩","아기옷"]}';

    console.log("Anthropic API 호출 시작...");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mimeType, data: imageBase64 } },
            { type: "text", text: promptText },
          ],
        }],
      }),
    });

    console.log("API 응답 status:", response.status);
    const json = await response.json();
    console.log("API 응답 전체:", JSON.stringify(json).slice(0, 500));

    if (!response.ok) {
      const errMsg = (json.error && json.error.message) ? json.error.message : JSON.stringify(json);
      console.log("API 오류:", errMsg);
      return Response.json({ ok: false, error: "Anthropic API 오류 (" + response.status + "): " + errMsg }, { status: 500 });
    }

    const content = json.content || [];
    let txt = content.map(function(x) { return x.text || ""; }).join("");
    txt = txt.replace(/```json/g, "").replace(/```/g, "").trim();
    console.log("파싱할 텍스트:", txt.slice(0, 200));

    let data;
    try {
      data = JSON.parse(txt);
    } catch (parseErr) {
      console.log("JSON 파싱 실패:", parseErr.message, txt.slice(0, 200));
      return Response.json({ ok: false, error: "JSON 파싱 실패: " + txt.slice(0, 200) }, { status: 500 });
    }

    console.log("=== 성공! ===");
    return Response.json({ ok: true, data: data });

  } catch (e) {
    console.log("서버 에러:", e.message, e.stack);
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
