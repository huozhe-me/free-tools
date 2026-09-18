# AI Endpoint Contract

A-Z 字母卡前端不会保存模型 API Key。浏览器只调用你自己的 `/api/generate`（或其他 Endpoint）。

## Request

```json
{
  "topic": "汽车",
  "age": "2–5 岁",
  "style": "简单单词",
  "cards": [
    {
      "letter": "A",
      "word": "auto",
      "cn": "汽车",
      "sentence": "A is for auto.",
      "imagePrompt": ""
    }
  ]
}
```

实际请求包含 26 张 cards。

## Response

Endpoint 必须返回：

```json
{
  "cards": [
    {
      "letter": "A",
      "word": "auto",
      "cn": "汽车",
      "sentence": "A is for auto.",
      "imagePrompt": "soft flat vector illustration..."
    }
  ]
}
```

必须返回恰好 26 张卡。前端会保留每个位置的 A-Z 字母，并允许用户继续编辑。

## 推荐 AI 输出规则

- 面向指定年龄段，优先高频、具体、容易画出来的词。
- 尽量控制单词长度和句子长度。
- Q / X / Z 等困难字母允许特殊词，但应标记或人工复核。
- 不要为了凑 A-Z 强行使用非常生僻的词。
- imagePrompt 不要包含文字、字母、水印。
- 图片应单主体、居中、完整可见、低刺激配色，适合 2–5 岁儿童。
- 返回严格 JSON，不要 Markdown。

## 安全

API Key 必须放在服务端环境变量/Secret 中，不要写入 `index.html`、GitHub 前端代码或浏览器 localStorage。

