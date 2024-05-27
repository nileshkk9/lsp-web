import * as monaco from 'monaco-editor';
import { HELLO_LANG_EXTENSION, HELLO_LANG_ID } from "./constants"

export const registerLanguage = () => {
    monaco.languages.register({
        id: HELLO_LANG_ID,
        aliases: [HELLO_LANG_ID],
        extensions: [HELLO_LANG_EXTENSION]
    });
}

export const createModel = (): monaco.editor.ITextModel => monaco.editor.createModel(
    '',
    HELLO_LANG_ID,
    monaco.Uri.parse(
        `file:///hello-${Math.random()}${HELLO_LANG_EXTENSION}`
    )
);
