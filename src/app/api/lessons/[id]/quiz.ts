import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db"; // Assuming this is your database connection

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: "Lesson ID is required" });
    }

    try {
        // Fetch the questionnaire associated with the lesson
        const questionnaire = await db.questionnaires.findFirst({
            where: { lessonId: id },
            include: {
                questions: true, // Fetch questions within the questionnaire
            },
        });

        if (!questionnaire) {
            return res.status(404).json({ message: "No quiz found for this lesson" });
        }

        res.status(200).json(questionnaire);
    } catch (error) {
        console.error("Error fetching quiz data:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
