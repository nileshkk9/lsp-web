import {
  WebSocketMessageReader,
  WebSocketMessageWriter,
  toSocket
} from 'vscode-ws-jsonrpc';
import { CloseAction, ErrorAction } from 'vscode-languageclient';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { HELLO_LANG_ID } from '../editor/constants';
import * as monaco from 'monaco-editor';

const LS_WS_URL = 'ws://localhost:8080';

export interface LanguageClientConnection {
  client: MonacoLanguageClient;
  socket: WebSocket;
}

export function connectToLs(): Promise<LanguageClientConnection> {
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
            error: (error, message, count) => {
              console.error('Language Client Error:', error, message);
              return { action: ErrorAction.Continue };
            },
            closed: () => ({ action: CloseAction.DoNotRestart })
          }
        },
        connectionProvider: {
          get: () => Promise.resolve({ reader, writer })
        }
      });

      // Setup commands
      const addWorkflowNodeCommand =
        setupAddWorkflowNodeCommand(languageClient);
      const editAsJavascriptCommand =
        setupEditAsJavascriptCommand(languageClient);

      languageClient.start();

      resolve({
        client: languageClient,
        socket: webSocket
      });
    };

    webSocket.onerror = (error) => {
      console.error('LS WebSocket connection Error', error);
      reject(error);
    };

    webSocket.onclose = (event) => {
      console.log('LS WebSocket connection Closed', event);
    };
  });
}

// Helper function to setup Add Workflow Node command
function setupAddWorkflowNodeCommand(languageClient: MonacoLanguageClient) {
  return monaco.editor.addCommand({
    id: 'server.addWorkflowNode',
    // label: 'Add Workflow Node',
    run: async (...args) => {
      try {
        // const model = editor.getModel();
        // if (!model) return;

        const result = await languageClient.sendRequest(
          'workspace/executeCommand',
          {
            command: 'server.addWorkflowNode',
            arguments: [args[1]]
          }
        );

        console.log('Add Workflow Node Result:', result);
      } catch (error) {
        console.error('Failed to add workflow node:', error);
      }
    }
  });
}

// Helper function to setup Edit As Javascript command
function setupEditAsJavascriptCommand(languageClient: MonacoLanguageClient) {
  return monaco.editor.addCommand({
    id: 'server.editAsJavascript',
    run: async () => {
      try {
        // Get the current editor instance
        const currentEditor = monaco.editor.getEditors()[0];
        if (!currentEditor) {
          console.error('No active editor');
          return;
        }

        const model = currentEditor.getModel();
        const position = currentEditor.getPosition();

        if (!model || !position) {
          console.error('No active model or position');
          return;
        }

        const lineNumber = position.lineNumber;
        const lineContent = model.getLineContent(lineNumber);

        // Extract processRule (adjust parsing as needed)
        const processRuleMatch = lineContent.match(
          /"processRule":\s*"?(.+?)"?[,}]/
        );
        const processRule = processRuleMatch ? processRuleMatch[1] : '';

        // Create a unique URI for the new file
        const jsUri = monaco.Uri.parse(`file:///javascript-edit-${Date.now()}.js`);

        // Create a new model for the JavaScript code
        const jsModel = monaco.editor.createModel(
          processRule,
          'javascript',
          jsUri
        );

        // Create a new editor instance
        const newEditor = monaco.editor.create(
          document.createElement('div'),  // Temporary container
          {
            model: jsModel,
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true
          }
        );

        // If you have a custom container for editors, replace the below with your logic
        const editorContainer = document.getElementById('editor-container');
        if (editorContainer) {
          const editorWrapper = document.createElement('div');
          editorWrapper.style.height = '100%';
          editorWrapper.appendChild(newEditor.getDomNode());
          editorContainer.appendChild(editorWrapper);
          
          // Layout the new editor
          newEditor.layout();
        }

        // Track changes to the JS editor
        const disposable = jsModel.onDidChangeContent(async () => {
          try {
            const updatedCode = jsModel.getValue();
            if (!updatedCode) return;

            // Send command to language server to update the process rule
            const result = await languageClient.sendRequest(
              'workspace/executeCommand',
              {
                command: 'server.editAsJavascript',
                arguments: [
                  {
                    processRule: updatedCode,
                    uri: model.uri.toString(),
                    lineNumber: lineNumber - 1
                  }
                ]
              }
            );

            console.log('Edit As Javascript Result:', result);
          } catch (error) {
            console.error('Failed to update process rule:', error);
          }
        });

        // Optional: Return a dispose method
        return {
          dispose: () => {
            disposable.dispose();
            jsModel.dispose();
            newEditor.dispose();
          }
        };

      } catch (error) {
        console.error('Failed to edit as javascript:', error);
      }
    }
  });
}

// Example usage
export async function setupLanguageClient() {
  try {
    const { client, socket } = await connectToLs();

    // You can now use the client for further operations
    return { client, socket };
  } catch (error) {
    console.error('Failed to setup language client:', error);
    throw error;
  }
}
