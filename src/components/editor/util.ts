import * as monaco from 'monaco-editor';
import { HELLO_LANG_EXTENSION, HELLO_LANG_ID } from './constants';

export const registerLanguage = () => {
  monaco.languages.register({
    id: HELLO_LANG_ID,
    aliases: [HELLO_LANG_ID],
    extensions: [HELLO_LANG_EXTENSION]
  });
};

export const createModel = (): monaco.editor.ITextModel =>
  monaco.editor.createModel(
    '',
    HELLO_LANG_ID,
    monaco.Uri.parse(`file:///hello-${Math.random()}${HELLO_LANG_EXTENSION}`)
  );

export const fetchWorkflow = async (wfId: string) => {
  try {
    const bodyData = {
      data: [
        {
          models: ['ZProcess'],
          columns: {
            id: 'ZProcess.id',
            projectId: 'ZProcess.projectId',
            description: 'ZProcess.description',
            processTypeId: 'ZProcess.processTypeId',
            name: 'ZProcess.name',
            createdDate: 'ZProcess.createdDate',
            workflow: 'ZProcess.workflow',
            startEventId: 'ZProcess.startEventId',
            maxLatencyAllowed: 'ZProcess.maxLatencyAllowed',
            recver: 'ZProcess.recver',
            displayParams: 'ZProcess.displayParams',
            modifiedDate: 'ZProcess.modifiedDate',
            useBufferedSync: 'ZProcess.useBufferedSync',
            sendExternalResponse: 'ZProcess.sendExternalResponse',
            observable: 'ZProcess.observable',
            continueParentOnError: 'ZProcess.continueParentOnError'
          },
          filter: "{$processTypeId} = 'STATELESS' AND {$id} = {@filter}",
          orderBy: 'modifiedDate DESC',
          inputs: {
            filter: wfId
          },
          batchSize: 50,
          batchNumber: 1
        }
      ]
    };
    const response = await fetch(
      'https://playgroundlab.devzinier.net/query/read',
      {
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.9,ja;q=0.8,en-GB;q=0.7',
          'cache-control': 'no-cache',
          'content-type': 'application/json',
          loginid: 'nilesh.pandey@zinier.com',
          orgid: 'tbdev4',
          password: 'Zinier@123',
          Referer: 'https://local.application.playground.devzinier.net:3000/',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        },
        body: JSON.stringify(bodyData),
        method: 'POST'
      }
    );
    const data = await response.json();
    return data.data[0].workflow;
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return null;
  }
};
