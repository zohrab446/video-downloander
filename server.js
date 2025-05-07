const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Statik dosyaları (HTML) sun
app.use(express.static('public'));

// TikTok video indirme endpoint'i
app.get('/api/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: 'TikTok URL gerekli' });

  try {
    // 1. TikWM API üzerinden doğrudan video linkini al
    const apiRes = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`);
    const directVideoUrl = apiRes.data?.data?.play;

    if (!directVideoUrl) return res.status(400).json({ error: 'Video linki alınamadı' });

    // 2. Videoyu stream olarak kullanıcıya ilet
    const videoStream = await axios({
      method: 'GET',
      url: directVideoUrl,
      responseType: 'stream'
    });

    // 3. Yanıt başlıkları (dosya indirme için)
    res.setHeader('Content-Disposition', 'attachment; filename="tiktok-video.mp4"');
    res.setHeader('Content-Type', 'video/mp4');

    // 4. Video verisini kullanıcıya gönder
    videoStream.data.pipe(res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Video indirilirken hata oluştu' });
  }
});

app.listen(port, () => {
  console.log(`✅ Sunucu çalışıyor: http://localhost:${port}`);
});
