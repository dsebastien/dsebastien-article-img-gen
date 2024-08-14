'use client';

import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Button } from 'primereact/button';
import { useState } from 'react';
import { API_KEY_HEADER } from './constants';
import { PredictionRequestBody, predictionResponseBodySchema } from './utils/schemas';

export default function Index() {
  const [apiKey, setApiKey] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [error, setError] = useState<string>('');

  const generatePrediction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log('Generating prediction...');

    const predictionRequestBody: PredictionRequestBody = {
      prompt,
    };

    const predictionRequestHeaders: Record<string, string> = {};
    predictionRequestHeaders[API_KEY_HEADER] = apiKey;

    const response = await fetch('/api/predictions', {
      method: 'POST',
      body: JSON.stringify(predictionRequestBody),
      headers: predictionRequestHeaders,
    });

    if (response.status !== 201) {
      console.log('Failed to generate prediction. Response status code: ', response.status);
      setError(`Failed to generate prediction...`);
    }

    const responseData = await response.json();

    const responseValidationResult = predictionResponseBodySchema.safeParse(responseData);
    if (!responseValidationResult.success) {
      console.log('Error validating server response: ', responseValidationResult.error);
      setError('Error validating server response');
      return;
    }

    const predictionResult = responseValidationResult.data;
    if (predictionResult.error) {
      console.log('Error: ', predictionResult.error);
      setError(`Error while generating prediction: ${predictionResult.error}`);
      return;
    }

    // FIXME display result: https://github.com/replicate/getting-started-nextjs-typescript/tree/main/src/app
    console.log('Prediction generated successfully: ', predictionResult.result);
  };

  return (
    <div>
      <div className="">
        <h1 className="p-6 bg-pink-600 text-white text-3xl">&nbsp;dSebastien Article Image Generator</h1>
        {/* TODO Switch to Prime react Toast: https://primereact.org/toast/ */}
        {error ? <div className="mt-2 p-4 bg-red-500">Error: {error}</div> : ''}

        <form onSubmit={generatePrediction} className="flex flex-col items-center w-full">
          <div className="flex flex-col lg:flex-row">
            <div className="pl-4 pt-8 pr-4 pb-4 gap-8 flex flex-col lg:flex-row lg:gap-4 lg:p-4">
              <FloatLabel>
                <InputText id="api-key" value={apiKey} minLength={1} onChange={(e) => setApiKey(e.target.value)} />
                <label htmlFor="api-key">API Key</label>
              </FloatLabel>
              <FloatLabel>
                <InputText id="prompt" value={prompt} minLength={1} onChange={(e) => setPrompt(e.target.value)} />
                <label htmlFor="prompt">Prompt</label>
              </FloatLabel>
            </div>
            <div className="p-4">
              <Button type="submit" label="Generate" icon="pi pi-check" iconPos="right"></Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
