import { WebSocketMessageReader, WebSocketMessageWriter, toSocket } from "vscode-ws-jsonrpc";
import { CloseAction, ErrorAction } from "vscode-languageclient";
import { MonacoLanguageClient } from "monaco-languageclient";
import { HELLO_LANG_ID } from "../editor/constants";

const LS_WS_URL = 'ws://localhost:8080/ls'
export function connectToLs() {
    return new Promise((resolve, reject) => {
        const webSocket = new WebSocket(LS_WS_URL);

        webSocket.onopen = () => {
            console.log('LS WebSocket connection Open');
            const socket = toSocket(webSocket);
            const reader = new WebSocketMessageReader(socket);
            const writer = new WebSocketMessageWriter(socket);
            const languageClient = new MonacoLanguageClient({
                name: `${HELLO_LANG_ID} Language Client`,
                clientOptions: {
                    documentSelector: [HELLO_LANG_ID],
                    errorHandler: {
                        error: () => ({ action: ErrorAction.Continue }),
                        closed: () => ({ action: CloseAction.DoNotRestart })
                    }
                },
                connectionProvider: {
                    get: () => Promise.resolve({reader, writer}),
                },
            });

            languageClient.start();
            resolve(languageClient);
        }

        webSocket.onerror = (error) => {
            console.log('LS WebSocket connection Open');
            reject(error);
        }
    });
}
