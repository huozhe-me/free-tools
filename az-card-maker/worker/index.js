export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return cors(new Response(null, { status: 204 }));
    if (url.pathname !== "/api/generate" || request.method !== "POST") {
      return cors(Response.json({ error: "Not found" }, { status: 404 }));
    }
    if (!env.OPENAI_API_KEY) return cors(Response.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 }));
    try {
      const body = await request.json();
      const topic = String(body.topic || "日常生活");
      const age = String(body.age || "2–5 岁");
      const style = String(body.style || "简单单词");
      const system = `你是儿童英语字母卡内容编辑。目标年龄：${age}。主题：${topic}。句式风格：${style}。
生成恰好26张 A-Z 卡片。优先高频、具体、容易画出的词。Q/X/Z 可以使用特殊但尽量常见的词，不要为了凑字母使用生僻词。
每张包含 letter, word, cn, sentence, imagePrompt。
sentence 简短自然，适合儿童朗读。imagePrompt 用英文，要求单主体、居中、完整可见、低刺激、儿童教育插画、浅色背景、无文字、无字母、无水印。
只返回 JSON：{"cards":[...]}`;
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method:"POST",
        headers:{"Authorization":"Bearer "+env.OPENAI_API_KEY,"Content-Type":"application/json"},
        body:JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.5,
          response_format:{type:"json_object"},
          messages:[{role:"system",content:system},{role:"user",content:JSON.stringify({topic,age,style})}]
        })
      });
      if (!r.ok) return cors(Response.json({error:"Model request failed",detail:await r.text()},{status:502}));
      const data=await r.json();
      const raw=data.choices?.[0]?.message?.content;
      const out=JSON.parse(raw);
      if (!Array.isArray(out.cards)||out.cards.length!==26) throw new Error("AI must return 26 cards");
      return cors(Response.json({cards:out.cards}));
    } catch(e) {
      return cors(Response.json({error:e.message||"Bad request"},{status:400}));
    }
  }
};
function cors(r){const h=new Headers(r.headers);h.set("Access-Control-Allow-Origin","*");h.set("Access-Control-Allow-Headers","Content-Type, Authorization");h.set("Access-Control-Allow-Methods","POST, OPTIONS");return new Response(r.body,{status:r.status,headers:h});}
