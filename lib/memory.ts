import { Redis } from "@upstash/redis"
import { OpenAIEmbeddings } from "@langchain/openai"
import { Pinecone } from "@pinecone-database/pinecone"
import { PineconeStore } from "@langchain/pinecone"

export type CharacterKey = {
    characterName: string;
    modeName: string;
    userId: string;
  };
  
  export class MemoryManager {
    private static instance: MemoryManager;
    private history: Redis;
    private vectorDBClient: Pinecone;
  
    public constructor() {
      this.history = Redis.fromEnv();
      this.vectorDBClient = new Pinecone();
    }
  
  
    public async init() {
        if (this.vectorDBClient instanceof Pinecone) {
            this.vectorDBClient = new Pinecone({
                apiKey: process.env.PINECONE_API_KEY!,
            });
        }
    }
  

  public async vectorSearch(
    recentChatHistory: string,
    characterFileName: string
  ) {
    const Pinecone = <Pinecone>this.vectorDBClient;
  
    const pineconeIndex = Pinecone.Index(
      process.env.PINECONE_INDEX || ""
    );
  
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      { pineconeIndex }
    );
  
    const similarDocs = await vectorStore
      .similaritySearch(recentChatHistory, 3, { fileName: characterFileName })
      .catch((err) => {
        console.log("Failed to get vector search results", err);
      });

      return similarDocs
  }
    
  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
        MemoryManager.instance = new MemoryManager();
        await MemoryManager.instance.init();
    }
    return MemoryManager.instance;
}

private generateRedisCharacterKey(characterKey: CharacterKey): string {
    return `${characterKey.characterName}-${characterKey.modeName}-${characterKey.userId}`;
}

public async writeToHistory(text: string, characterKey: CharacterKey) {
    if (!characterKey || typeof characterKey.userId === "undefined") {
        console.log("Character key set incorrectly");
        return "";
    }

    const key = this.generateRedisCharacterKey(characterKey)
    const result = await this.history.zadd(key, {
        score: Date.now(),
        member: text,
    });

    return result;

}
  
public async readLatestHistory(characterKey: CharacterKey): Promise<string> {
    if (!characterKey || typeof characterKey.userId === "undefined") {
        console.log("Character key set incorrectly");
        return "";
    }

    const key = this.generateRedisCharacterKey(characterKey);
    let result = await this.history.zrange(key, 0, Date.now(), {
        byScore: true,
    });

    result = result.slice(-30).reverse();
    const recentChats = result.reverse().join("\n");
    return recentChats;
}

public async seedChatHistory(
    seedContent: string,
    delimiter: string = "\n",
    characterKey: CharacterKey
) {
    const key = this.generateRedisCharacterKey(characterKey);
    
    if (await this.history.exists(key)) {
        console.log("User already has chat history");
        return;
    }
    
    const content = seedContent.split(delimiter);
    let counter = 0;

    for (const line of content) {
        await this.history.zadd(key, { score: counter, member: line });
        counter += 1;
    }
}


}