import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import analyser from './llm.js'
import dbModel from './db/dbSchema.js'
dotenv.config()
const port = process.env.PORT
const app = express();
app.use(cors({
    origin: "https://ai-journal-frontend-rust.vercel.app"
}))
app.use(express.json())

app.post("/api/journal/analyze", async (req, res) => {
    try {
        if (req.body.text && req.body.text.trim() !== "") {
            const data = await analyser(req.body.text)
            if (!data) {
                return res.status(500).json({ success: false, message: "LLM  error" });
            }
            else {
                const result = JSON.parse(data)
                res.status(200).json({ success: true, result })
            }
        }

        else {
            return res.status(400).json({ success: false })
        }
    } catch (error) {
        res.status(500).json({ success: false });
    }
})

app.post("/api/journal", async (req, res) => {
    try {
        await dbModel.insertOne({
            userId: req.body.userId,
            ambience: req.body.ambience,
            text: req.body.text,
            emotion: req.body.result.emotion.toLowerCase(),
            keywords: req.body.result.keywords,
            summary: req.body.result.summary
        })
        res.status(200).json({ success: true })
    } catch (error) {
        res.status(500).json({ success: false })
    }
})

app.get("/api/journal/:userId", async (req, res) => {
    const userId = req.params.userId
    const data = await dbModel.find({ userId: userId })
    let preventries = []
    for (const i of data) {
        const date = new Date(i.createdAt)
        preventries.push({ ambience: i.ambience, text: i.text, emotion: i.emotion, date: date.toDateString() })
    }
    res.status(200).json({ success: true, preventries })
})

app.get("/api/journal/insights/:userId", async (req, res) => {
    try {
        const userId = req.params.userId
        const data = await dbModel.find({ userId: userId }).select("ambience emotion keywords createdAt")
        const total = data.length
        const ambiences = {}
        const emotions = {}
        for (const i of data) {
            if (ambiences[i.ambience] !== undefined) {
                ambiences[i.ambience]++;
            }
            else {
                ambiences[i.ambience] = 1;
            }
            if (emotions[i.emotion] !== undefined) {
                emotions[i.emotion]++;
            }
            else {
                emotions[i.emotion] = 1;
            }
        }
        let topemotion = ""
        let maxx = 0
        let topambience = ""
        for (const key in ambiences) {
            if (ambiences[key] > maxx) {
                maxx = ambiences[key]
                topambience = key
            }
        }
        maxx = 0
        for (const key in emotions) {
            if (emotions[key] > maxx) {
                maxx = emotions[key]
                topemotion = key
            }
        }
        let recentkeywords = []
        if (total > 0) {
            recentkeywords = data[total - 1].keywords
        }
        res.status(200).json({ success: true, totalEntries: total, topEmotion: topemotion, mostUsedAmbience: topambience, recentKeywords: recentkeywords })
    } catch (error) {
        res.status(500).json({ success: false, error: error })
    }
})

app.listen(port || 8080, () => {
    console.log(`server live: http://localhost:8080`)
})