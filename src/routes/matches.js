import { Router } from "express";
import { createMatchSchema } from "../validation/matches.js";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { getMatchStatus } from "../utils/match-status.js";

export const matchRouter = Router()

matchRouter.get("/", (req, res) => {
    res.status(200).json({ message: "Match list" })
})

matchRouter.post("/", async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body)
    const { data: { startTime, endTime, homeScore, awayScore } } = parsed

    if (!parsed.success) {
        return res.status(400).json({ message: "Invalid payload", errors: parsed.error })
    }

    try {
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(new Date(startTime), new Date(endTime)),
        }).returning()

        res.status(201).json({ event })
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" })
    }
})