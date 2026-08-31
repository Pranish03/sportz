import { Router } from "express";
import { createMatchSchema } from "../validation/matches";
import { db } from "../db/db";
import { matches } from "../db/schema";
import { getMatchStatus } from "../utils/match-status";

export const matchRouter = Router()

matchRouter.get("/", (req, res) => {
    res.status(200).json({ message: "Match list" })
})

matchRouter.post("/", async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body)

    if (!parsed.success) {
        return res.status(400).json({ message: "Invalid payload", errors: parsed.error })
    }

    try {
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(parsed.data.startTime),
            endTime: new Date(parsed.data.endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(new Date(parsed.data.startTime), new Date(parsed.data.endTime)),
        }).returning()

        res.status(201).json({ event })
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" })
    }
})