

import { LangChainAdapter } from "ai";
import { NextResponse } from "next/server";
import { Replicate } from "@langchain/community/llms/replicate";
import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import { getServerSession } from "next-auth";
import { authoptions } from "@/app/lib/authoptions";
import prisma from "@/lib/prismadb";
import { CallbackManager } from "@langchain/core/callbacks/manager";
import { Readable } from "stream";

export async function POST(
    req: Request,
    { params }: { params: { chatId: string } }
) {
    try {
        const { prompt } = await req.json();
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

        // Clean up the chatId by removing any trailing braces
        const cleanedChatId = params.chatId.replace(/[{}]/g, '');

        const character = await prisma.character.findUnique({
            where: {
                id: cleanedChatId,
            },
        });

        if (!character) {
            return NextResponse.json("Character not found", { status: 404 });
        }

        await prisma.character.update({
            where: {
                id: cleanedChatId,
            },
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
            modeName: "llama2-13b",
        };
        const memoryManager = await MemoryManager.getInstance();

        const records = await memoryManager.readLatestHistory(characterKey);

        if (records.length === 0) {
            await memoryManager.seedChatHistory(character.seed, "\n\n", characterKey);
        }

        await memoryManager.writeToHistory("User: " + prompt + "\n", characterKey);

        const recentChatHistory = await memoryManager.readLatestHistory(characterKey);

        const similarDocs = await memoryManager.vectorSearch(
            recentChatHistory,
            character_file_name
        );

        let relevantHistory = "";

        if (!!similarDocs && similarDocs.length !== 0) {
            relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
        }
 

        const model = new Replicate({
            model: "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
            input: {
                max_length: 2048,
            },
            apiKey: process.env.REPLICATE_API_TOKEN,

        });

        model.verbose = true;
        const resp = String(
            await model
                .invoke(
                    `
                   ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${name}: prefix.

                   ${character.instructions}

                   Below are relevant details about ${name}'s past and the conversation you are in.
                   ${relevantHistory}

                   ${recentChatHistory}\n${name}
                `
                )
                .catch(console.error)
        );

        const cleaned = resp.replaceAll(",", "");
        const chunks = cleaned.split("\n");
        const response = chunks[0];

        await memoryManager.writeToHistory(response.trim(), characterKey);

        var s = new Readable();
        s.push(response);
        s.push(null);

        if (response && response.length > 1) {
            await memoryManager.writeToHistory(response.trim(), characterKey);
            await prisma.character.update({
                where: {
                    id: cleanedChatId,
                },
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
        }

      
        
        return LangChainAdapter.toDataStreamResponse(s);
    } catch (error) {
        console.log("[CHAT_POST]", error);
        return NextResponse.json(error, { status: 500 });
    }
}