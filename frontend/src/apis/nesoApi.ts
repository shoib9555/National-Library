
import apiClient from "./client";

export interface NesoMessage {
    role: "user" | "model";
    text: string;
}

export interface NesoChatRequest {
    message: string;
    history: NesoMessage[];
}

export interface NesoChatResponse {
    message: string;
    answer: string;
}

export async function sendNesoMessage(
    data: NesoChatRequest
): Promise<NesoChatResponse> {
    const response = await apiClient.post<NesoChatResponse>(
        "/neso/chat",
        data
    );

    return response.data;
}
