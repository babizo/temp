export default async function handler(req, res) {
    // POSTリクエスト以外は弾く
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 環境変数からAPIキーを取得
    const apiKey = process.env.GEMINIAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'サーバー側にAPIキーが設定されていません。' });
    }

    // 利用モデルの固定（フロント側の指定を強制上書きして安全性を担保）
    const MODEL_NAME = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    try {
        // フロントエンドから受け取ったJSONボディをそのままGeminiに横流しする
        const geminiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await geminiRes.json();

        // Gemini APIからのエラーをそのままフロントに返す
        if (!geminiRes.ok) {
            return res.status(geminiRes.status).json(data);
        }

        // 正常なレスポンスを返す
        return res.status(200).json(data);
    } catch (error) {
        console.error('Fetch Error:', error);
        return res.status(500).json({ error: '通信エラーが発生しました。', details: error.message });
    }
}
