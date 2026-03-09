"use client";
import { useState, useEffect, useRef } from "react";

const WEATHER_CODES = {
  0:"맑음",1:"거의맑음",2:"부분흐림",3:"흐림",
  45:"안개",48:"안개",51:"이슬비",53:"이슬비",55:"이슬비",
  61:"비",63:"비",65:"폭우",71:"눈",73:"눈",75:"폭설",
  80:"소나기",81:"소나기",82:"폭풍우",95:"뇌우",99:"뇌우"
};
const WEATHER_EMOJIS = {
  0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",
  51:"🌦️",53:"🌦️",55:"🌧️",61:"🌧️",63:"🌧️",65:"⛈️",
  71:"🌨️",73:"❄️",75:"❄️",80:"🌦️",81:"🌧️",82:"⛈️",95:"⛈️",99:"⛈️"
};
const REVIEW_COLORS = ["#8B5CF6","#10B981","#F59E0B","#EF4444","#3B82F6"];

const Spirals = () => (
  <div style={{position:"absolute",top:10,left:0,right:0,display:"flex",justifyContent:"space-evenly",pointerEvents:"none",zIndex:2}}>
    {Array(10).fill(0).map((_,i)=>(
      <div key={i} style={{width:15,height:15,background:"#4BBDE8",borderRadius:"50%",boxShadow:"inset 0 2px 4px rgba(0,0,0,0.2)"}}/>
    ))}
  </div>
);

const Card = ({children, banner}) => (
  <div style={{width:"100%",maxWidth:380,aspectRatio:"1",borderRadius:16,overflow:"hidden",background:"#4BBDE8",position:"relative",margin:"0 auto",boxShadow:"0 8px 28px rgba(75,189,232,0.4)"}}>
    <Spirals/>
    <div style={{position:"absolute",top:38,left:18,right:18,bottom:60,background:"white",borderRadius:12,boxShadow:"0 3px 12px rgba(0,0,0,0.1)",padding:16,overflow:"hidden"}}>
      {children}
    </div>
    <div style={{position:"absolute",bottom:0,left:0,right:0,height:58,background:"#4BBDE8",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={{fontSize:"1.05rem",fontWeight:900,color:"white",fontStyle:"italic",letterSpacing:-0.5}}>{banner || "갈아입히기 쉬운 겨울 등원룩"}</span>
    </div>
  </div>
);

function Panel({label,title,children}) {
  return (
    <div style={{background:"white",borderRadius:20,padding:20,marginBottom:14,boxShadow:"0 2px 16px rgba(0,0,0,0.07)"}}>
      <div style={{fontSize:"0.62rem",fontWeight:700,color:"#4BBDE8",letterSpacing:"2px",textTransform:"uppercase",marginBottom:7}}>{label}</div>
      <div style={{fontSize:"0.95rem",fontWeight:800,marginBottom:12,color:"#1a1a2e"}}>{title}</div>
      {children}
    </div>
  );
}

function CaptionBlock({label,text}) {
  return (
    <div style={{background:"#f0faff",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
      <div style={{fontSize:"0.6rem",fontWeight:700,color:"#4BBDE8",letterSpacing:"1.5px",marginBottom:5}}>{label}</div>
      <div style={{fontSize:"0.82rem",lineHeight:1.75,whiteSpace:"pre-line",color:"#1a1a2e"}}>{text}</div>
    </div>
  );
}

export default function App() {
  const [photo, setPhoto] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherStatus, setWeatherStatus] = useState("loading");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [aiData, setAiData] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeItem, setActiveItem] = useState(0);
  const loadRef = useRef(null);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
    document.head.appendChild(styleEl);

    if (!navigator.geolocation) {
      setWeatherStatus("error");
      setWeather({temp:"--",feels:"--",desc:"위치 불가",emoji:"🌤️"});
      return;
    }
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const res = await fetch("/api/weather?lat=" + lat + "&lon=" + lon);
        const d = await res.json();
        const c = d.current;
        setWeather({
          temp: Math.round(c.temperature_2m),
          feels: Math.round(c.apparent_temperature),
          desc: WEATHER_CODES[c.weather_code] || "날씨정보",
          emoji: WEATHER_EMOJIS[c.weather_code] || "🌤️"
        });
        setWeatherStatus("ok");
      } catch(err) {
        setWeatherStatus("error");
        setWeather({temp:"--",feels:"--",desc:"날씨 미확인",emoji:"🌤️"});
      }
    }, () => {
      setWeatherStatus("error");
      setWeather({temp:"--",feels:"--",desc:"위치 거부됨",emoji:"🌤️"});
    });
  }, []);

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement("canvas");
        const MAX = 1024;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        } else {
          if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        setPhoto(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function generate() {
    setLoading(true);
    setAiData(null);
    const steps = ["🔍 옷 분석 중...","👗 아이템 파악 중...","💰 가격 추정 중...","✍️ 후기 작성 중...","📝 캡션 생성 중...","🎨 카드 조립 중..."];
    let si = 0;
    setLoadingText(steps[0]);
    loadRef.current = setInterval(function() {
      si++;
      setLoadingText(steps[si % steps.length]);
    }, 1100);

    const today = new Date();
    const days = ["일","월","화","수","목","금","토"];
    const dateStr = (today.getMonth()+1) + "월 " + today.getDate() + "일 (" + days[today.getDay()] + "요일)";
    const imageBase64 = photo.split(",")[1];
    const mimeType = photo.split(";")[0].split(":")[1];
    const w = weather || {temp:"--",feels:"--",desc:"날씨 미확인"};

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ imageBase64: imageBase64, mimeType: mimeType, weather: w, dateStr: dateStr })
      });
      const result = await res.json();
      clearInterval(loadRef.current);
      if (!result.ok) {
        alert("❌ 오류 발생!\n\n" + result.error);
        setLoading(false);
        return;
      }
      setAiData(result.data);
      setActiveSlide(0);
      setActiveItem(0);
    } catch(e) {
      clearInterval(loadRef.current);
      alert("오류 발생! 다시 시도해주세요 😅\n" + e.message);
    }
    setLoading(false);
  }

  function copyCaption() {
    if (!aiData) return;
    const w = weather || {temp:"--",feels:"--"};
    const tags = (aiData.hashtags || []).map(function(h){ return "#" + h; }).join(" ");
    const txt = aiData.instagramTitle + "\n\n" + aiData.instagramBody + "\n\n🌡️ 오늘 날씨 " + w.temp + "℃ (체감 " + w.feels + "℃)\n\n" + tags;
    navigator.clipboard.writeText(txt).then(function(){ alert("✅ 캡션 복사 완료!\n인스타에 바로 붙여넣기 하세요 😊"); });
  }

  const w = weather || {temp:"--",feels:"--",desc:"불러오는 중...",emoji:"📍"};
  const today = new Date();
  const days = ["일","월","화","수","목","금","토"];
  const dateStr = (today.getMonth()+1) + "월 " + today.getDate() + "일 " + days[today.getDay()] + "요일";

  const spinStyle = {
    width:46, height:46,
    border:"4px solid #b8dff0",
    borderTopColor:"#4BBDE8",
    borderRadius:"50%",
    animation:"spin 0.8s linear infinite",
    margin:"0 auto 14px"
  };

  return (
    <div style={{fontFamily:"'Noto Sans KR',sans-serif",background:"#e8f4fd",minHeight:"100vh",paddingBottom:60}}>

      <div style={{background:"#4BBDE8",padding:"20px 20px 16px",textAlign:"center",boxShadow:"0 4px 14px rgba(75,189,232,0.35)"}}>
        <div style={{fontSize:"1.6rem",fontWeight:900,color:"white",letterSpacing:-1}}>👶 오늘 뭐입지?</div>
        <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.88)",marginTop:4}}>패션알못 엄마의 등원룩 체험기 · @whatdoyouwear.today</div>
      </div>

      <div style={{maxWidth:520,margin:"0 auto",padding:"20px 16px"}}>

        <Panel label="STEP 01" title="📸 오늘 등원룩 사진 올리기">
          {!photo ? (
            <label style={{display:"block",border:"2.5px dashed #b8dff0",borderRadius:16,padding:"32px 16px",textAlign:"center",cursor:"pointer",background:"#f0faff"}}>
              <input type="file" accept="image/*" style={{display:"none"}} onChange={function(e){ handleFile(e.target.files[0]); }}/>
              <div style={{fontSize:"2.2rem",marginBottom:8}}>👗</div>
              <div style={{fontSize:"0.85rem",color:"#888"}}>
                <span style={{color:"#4BBDE8",fontWeight:700}}>클릭</span>해서 사진 업로드
              </div>
              <div style={{fontSize:"0.72rem",color:"#aaa",marginTop:5}}>JPG · PNG · HEIC 모두 OK</div>
            </label>
          ) : (
            <div style={{position:"relative"}}>
              <img src={photo} alt="preview" style={{width:"100%",borderRadius:14,maxHeight:280,objectFit:"cover",display:"block"}}/>
              <button onClick={function(){ setPhoto(null); }} style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.55)",color:"white",border:"none",fontSize:"0.72rem",padding:"5px 12px",borderRadius:20,cursor:"pointer"}}>✕ 다시선택</button>
            </div>
          )}
        </Panel>

        <Panel label="STEP 02" title="🌤️ 우리동네 날씨 자동 불러오기">
          <div style={{display:"flex",alignItems:"center",gap:12,background:"#f0faff",borderRadius:14,padding:"13px 16px"}}>
            <span style={{fontSize:"1.8rem"}}>{w.emoji}</span>
            <div>
              {weatherStatus === "loading"
                ? <div style={{fontSize:"0.8rem",color:"#aaa",fontStyle:"italic"}}>위치 권한을 허용해주세요...</div>
                : (
                  <div>
                    <div style={{fontWeight:700,fontSize:"0.95rem",color:"#1a1a2e"}}>기온 {w.temp}℃ · 체감 {w.feels}℃ · {w.desc}</div>
                    <div style={{fontSize:"0.7rem",color:"#888",marginTop:3}}>📍 현재 위치 기준 실시간 날씨</div>
                  </div>
                )
              }
            </div>
          </div>
        </Panel>

        <Panel label="STEP 03" title="✨ AI 카드 + 캡션 자동 생성">
          <button
            disabled={!photo || loading}
            onClick={generate}
            style={{width:"100%",background:(!photo||loading)?"#ccc":"#4BBDE8",color:"white",border:"none",padding:16,borderRadius:14,fontSize:"1rem",fontWeight:700,cursor:(!photo||loading)?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"inherit"}}>
            <span>🪄</span> 카드 4장 + 캡션 만들기
          </button>
        </Panel>

        {loading && (
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={spinStyle}/>
            <div style={{fontSize:"0.85rem",color:"#888"}}>{loadingText}</div>
          </div>
        )}

        {aiData && (
          <div>
            <Panel label="STEP 04" title="🖼️ 인스타 카드 4장 미리보기">
              <div style={{display:"flex",gap:8,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
                {["1장 날씨","2장 아이템","3장 후기","4장 사진"].map(function(t,i){
                  return (
                    <button key={i} onClick={function(){ setActiveSlide(i); }}
                      style={{flexShrink:0,background:activeSlide===i?"#4BBDE8":"#e8f4fd",color:activeSlide===i?"white":"#666",border:"none",padding:"6px 14px",borderRadius:20,fontSize:"0.72rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                      {t}
                    </button>
                  );
                })}
              </div>

              {activeSlide === 0 && (
                <Card>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <span style={{fontSize:"0.88rem",fontWeight:800,color:"#1a1a2e"}}>기온 {w.temp}℃, 체감 {w.feels}℃, 날씨 {w.desc}</span>
                    <span style={{fontSize:"1.4rem"}}>{w.emoji}</span>
                  </div>
                  <div style={{fontSize:"0.68rem",color:"#aaa",marginBottom:10}}>{dateStr}</div>
                  {(aiData.items||[]).map(function(it,i){
                    return <div key={i} style={{fontSize:"0.74rem",marginBottom:5,color:"#333"}}>{it.emoji} <b>{it.type}</b> — {it.brand} · {(it.price||0).toLocaleString()}원</div>;
                  })}
                  <div style={{position:"absolute",bottom:68,right:18,fontSize:"0.82rem",fontWeight:800,color:"#1a1a2e"}}>총 가격: {(aiData.totalPrice||0).toLocaleString()}원</div>
                </Card>
              )}

              {activeSlide === 1 && (
                <div>
                  <Card>
                    {(function(){
                      const it = (aiData.items||[])[activeItem] || {};
                      return (
                        <div>
                          <div style={{fontSize:"0.88rem",fontWeight:900,color:"#1a1a2e",marginBottom:3}}>({it.brand})</div>
                          <div style={{fontSize:"0.72rem",color:"#888",marginBottom:8,fontWeight:600}}>{it.type}</div>
                          <div style={{width:"100%",height:"38%",background:"#f0f8ff",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"3rem",marginBottom:8}}>{it.emoji}</div>
                          <div style={{fontSize:"0.72rem",color:"#555",lineHeight:1.5}}>{it.desc}</div>
                          <div style={{position:"absolute",bottom:68,right:18,fontSize:"0.82rem",fontWeight:800,color:"#1a1a2e"}}>가격: {(it.price||0).toLocaleString()}원</div>
                        </div>
                      );
                    })()}
                  </Card>
                  <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:10}}>
                    {(aiData.items||[]).map(function(_,i){
                      return <div key={i} onClick={function(){ setActiveItem(i); }} style={{width:10,height:10,borderRadius:"50%",background:activeItem===i?"#4BBDE8":"#c8e8f4",cursor:"pointer"}}/>;
                    })}
                  </div>
                </div>
              )}

              {activeSlide === 2 && (
                <Card>
                  <div style={{fontSize:"1rem",fontWeight:900,color:"#1a1a2e",marginBottom:10}}>생생 후기</div>
                  {(aiData.items||[]).map(function(it,i){
                    return (
                      <div key={i} style={{display:"flex",gap:8,marginBottom:9}}>
                        <span style={{fontSize:"0.75rem",fontWeight:900,color:REVIEW_COLORS[i%5],minWidth:30,flexShrink:0}}>{it.type}</span>
                        <span style={{fontSize:"0.7rem",color:"#444",lineHeight:1.45}}>{it.review}</span>
                      </div>
                    );
                  })}
                </Card>
              )}

              {activeSlide === 3 && (
                <Card>
                  <div style={{position:"absolute",top:32,left:"50%",transform:"translateX(-50%) rotate(-3deg)",width:"52%",background:"white",padding:"8px 8px 30px",boxShadow:"0 6px 20px rgba(0,0,0,0.2)",borderRadius:3,zIndex:3}}>
                    <div style={{position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",width:34,height:20,background:"rgba(210,190,140,0.7)",borderRadius:2}}/>
                    <div style={{width:"100%",aspectRatio:"1",background:"#c8e8f4",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.5rem"}}>
                      {photo ? <img src={photo} alt="outfit" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : "📷"}
                    </div>
                    <div style={{textAlign:"center",marginTop:6,fontSize:"0.78rem",color:"#4BBDE8",fontWeight:700}}>{aiData.polaroidCaption || "귀여운 궁디♡"}</div>
                  </div>
                </Card>
              )}
            </Panel>

            <Panel label="STEP 05" title="✍️ 인스타 캡션 자동 생성">
              <CaptionBlock label="📌 제목" text={aiData.instagramTitle}/>
              <CaptionBlock label="💬 본문" text={aiData.instagramBody + "\n\n🌡️ 오늘 날씨 " + w.temp + "℃ (체감 " + w.feels + "℃)"}/>
              <div style={{background:"#f0faff",borderRadius:12,padding:"12px 14px",marginBottom:10}}>
                <div style={{fontSize:"0.6rem",fontWeight:700,color:"#4BBDE8",letterSpacing:"1.5px",marginBottom:6}}>#️⃣ 해시태그</div>
                <div style={{lineHeight:2}}>
                  {(aiData.hashtags||[]).map(function(h,i){
                    return <span key={i} style={{display:"inline-block",background:"#4BBDE8",color:"white",fontSize:"0.66rem",fontWeight:700,padding:"3px 10px",borderRadius:20,margin:"2px 3px"}}>{"#" + h}</span>;
                  })}
                </div>
              </div>
              <button onClick={copyCaption} style={{background:"#1a1a2e",color:"white",border:"none",padding:"10px 20px",borderRadius:12,fontSize:"0.82rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>📋 전체 캡션 복사</button>
            </Panel>

            <button
              onClick={function(){ setPhoto(null); setAiData(null); setActiveSlide(0); setActiveItem(0); }}
              style={{width:"100%",background:"transparent",color:"#4BBDE8",border:"2px solid #4BBDE8",padding:14,borderRadius:16,fontSize:"0.92rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>
              🔄 처음부터 다시
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
