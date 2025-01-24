import { LangChainAdapter } from "ai";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import Gemini API
import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import { getServerSession } from "next-auth";
import { authoptions } from "@/app/lib/authoptions";
import prisma from "@/lib/prismadb";
import { Readable } from "stream";
// import { ReadableStream } from "web-streams-polyfill/ponyfill/es2018";

export async function POST(req: Request, { params }: { params: { chatId: string } }) {
    try {
        const { prompt } = await req.json();
        console.log("Received prompt:", prompt);

        const session = await getServerSession(authoptions);
        if (!session) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }
        const user = session.user;
        const identifier = req.url + "-" + user.id;
        const { success } = await rateLimit(identifier);
        if (!success) {
            return NextResponse.json("Rate limit exceeded", { status: 429 });
        }

        const cleanedChatId = params.chatId.replace(/[{}]/g, '');
        console.log("Cleaned Chat ID:", cleanedChatId);

        const character = await prisma.character.findUnique({
            where: { id: cleanedChatId },
        });

        if (!character) {
            return NextResponse.json("Character not found", { status: 404 });
        }

        await prisma.character.update({
            where: { id: cleanedChatId },
            data: {
                messages: {
                    create: {
                        content: prompt,
                        role: "user",
                        userId: user.id,
                    },
                },
            },
        });

        const name = character.id;
        const character_file_name = name + ".txt";

        const characterKey = {
            characterName: name,
            userId: user.id,
            modeName: "gemini-1.5-flash",
        };
        const memoryManager = await MemoryManager.getInstance();

        const records = await memoryManager.readLatestHistory(characterKey);

        if (records.length === 0) {
            await memoryManager.seedChatHistory(character.seed, "\n\n", characterKey);
        }

        await memoryManager.writeToHistory("User: " + prompt + "\n", characterKey);

        const recentChatHistory = await memoryManager.readLatestHistory(characterKey);

        const similarDocs = await memoryManager.vectorSearch(recentChatHistory, character_file_name);

        let relevantHistory = "";

        if (!!similarDocs && similarDocs.length !== 0) {
            relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
        }

        // Generate response using Gemini API
        const genAI = new GoogleGenerativeAI("AIzaSyDBvvHlPdmHZk3a-ZgXhv_j-Kyh7hgwAC8");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(`
            ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${name}: prefix.

            ${character.instructions}

            Below are relevant details about ${name}'s past and the conversation you are in.
            ${relevantHistory}

            ${recentChatHistory}\n${name}
        `);
        const response = result.response.text(); // Extract the response text
        console.log("Generated Response:", response);

        await memoryManager.writeToHistory(response.trim(), characterKey);
        await prisma.character.update({
            where: { id: cleanedChatId },
            data: {
                messages: {
                    create: {
                        content: response.trim(),
                        role: "system",
                        userId: user.id,
                    },
                },
            },
        });

        const s = new ReadableStream({
            start(controller: ReadableStreamDefaultController) {
                controller.enqueue(response);
                controller.close();
            }
        });

        console.log("Returning response stream");
        return LangChainAdapter.toDataStreamResponse(s);
       
    } catch (error) {
        console.log("[CHAT_POST]", error);
        return NextResponse.json(error, { status: 500 });
    }
}