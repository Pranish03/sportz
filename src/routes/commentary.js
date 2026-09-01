import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { matchIdParamSchema } from "../validation/matches.js";
import { createCommentarySchema, listCommentaryQuerySchema } from "../validation/commentary.js";
import { db } from "../db/db.js";
import { commentary, matches } from "../db/schema.js";

export const commentaryRouter = Router({ mergeParams: true });

const MAX_LIMIT = 100;

commentaryRouter.get("/", async (req, res) => {
    const paramParsed = matchIdParamSchema.safeParse(req.params);

    if (!paramParsed.success) {
        return res.status(400).json({ message: "Invalid match ID", errors: paramParsed.error });
    }

    const queryParsed = listCommentaryQuerySchema.safeParse(req.query);

    if (!queryParsed.success) {
        return res.status(400).json({ message: "Invalid query parameters", errors: queryParsed.error });
    }

    const limit = Math.min(queryParsed.data?.limit ?? 100, MAX_LIMIT);

    try {
        const data = await db
            .select()
            .from(commentary)
            .where(eq(commentary.matchId, paramParsed.data.id))
            .orderBy(desc(commentary.createdAt))
            .limit(limit);

        res.status(200).json({ data });
    } catch (err) {
        res.status(500).json({ message: "Failed to get commentary" });
    }
});

commentaryRouter.post("/", async (req, res) => {
    const paramParsed = matchIdParamSchema.safeParse(req.params);

    if (!paramParsed.success) {
        return res.status(400).json({ message: "Invalid match ID", errors: paramParsed.error });
    }

    const bodyParsed = createCommentarySchema.safeParse(req.body);

    if (!bodyParsed.success) {
        return res.status(400).json({ message: "Invalid payload", errors: bodyParsed.error });
    }

    try {
        const [existingMatch] = await db
            .select({ id: matches.id })
            .from(matches)
            .where(eq(matches.id, paramParsed.data.id));

        if (!existingMatch) {
            return res.status(404).json({ message: "Match not found" });
        }

        const [entry] = await db
            .insert(commentary)
            .values({
                matchId: paramParsed.data.id,
                ...bodyParsed.data,
            })
            .returning();

        res.status(201).json({ data: entry });
    } catch (err) {
        if (err?.code === '23503') {
            return res.status(404).json({ message: "Match not found" });
        }
        res.status(500).json({ message: "Failed to create commentary" });
    }
});
