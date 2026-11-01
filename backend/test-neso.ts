import "dotenv/config";
import { askNeso } from "./src/services/nesoService";

async function testNeso() {
    try {
        console.log("Testing Neso AI...");

        const answer = await askNeso(
            "Explain percentage in simple language for SSC CGL."
        );

        console.log("\nNeso AI response:\n");
        console.log(answer);

    } catch (error) {
        console.error("Neso AI test failed:", error);
    }
}

testNeso();