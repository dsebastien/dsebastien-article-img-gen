'use client';

import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Button } from 'primereact/button';
import { useState } from 'react';
import Image from 'next/image';
import { Password } from 'primereact/password';
import { Prediction } from 'replicate';
import { API_KEY_HEADER } from './constants';
import { PredictionRequestBody, PredictionResponseBody } from './utils/schemas';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function Index() {
  const [apiKey, setApiKey] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('A black and white, pencil drawing of ');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [prediction, setPrediction] = useState<Prediction | null | undefined>(null);

  const generatePrediction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log('Generating prediction...');
    setPrediction(null);
    setError('');
    setLoading(true);

    const predictionRequestBody: PredictionRequestBody = {
      prompt,
    };

    const predictionRequestHeaders: Record<string, string> = {};
    predictionRequestHeaders[API_KEY_HEADER] = apiKey;

    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        body: JSON.stringify(predictionRequestBody),
        headers: predictionRequestHeaders,
      });

      if (response.status !== 201) {
        console.warn('Failed to generate prediction. Response status code: ', response.status);
        setLoading(false);
        setError(`Failed to generate prediction...`);
        return;
      }

      const responseValidationResult = (await response.json()) as PredictionResponseBody; // FIXME improve parsing

      if (responseValidationResult.error) {
        console.warn('Failed to generate prediction. Response status code: ', response.status);
        setLoading(false);
        setError(`Failed to generate prediction...`);
        return;
      }

      const predictionResult = responseValidationResult.result;
      if (predictionResult.error) {
        console.warn('Error: ', predictionResult.error);
        setLoading(false);
        setError(`Error while generating prediction: ${predictionResult.error}`);
        return;
      }

      console.log('Prediction generated successfully: ', predictionResult);
      setLoading(false);
      setError('');
      setPrediction(predictionResult);
    } catch (error) {
      console.warn('Failed to generate', error);
      setLoading(false);
      setError('Failed to generate. Please try again later.');
    }
  };

  return (
    <div className="w-full">
      <h1 className="p-6 bg-pink-600 text-white text-3xl">&nbsp;dSebastien Article Image Generator</h1>

      <form onSubmit={generatePrediction} className="flex flex-col items-center w-full">
        <div className="mt-4 flex flex-col lg:flex-row w-full">
          <div className="pl-4 pt-8 pr-4 pb-4 gap-8 flex flex-col lg:flex-row lg:gap-4 lg:p-4">
            <FloatLabel>
              <Password id="api-key" value={apiKey} feedback={false} minLength={1} onChange={(e) => setApiKey(e.target.value)} />
              <label htmlFor="api-key">API Key</label>
            </FloatLabel>
            <FloatLabel>
              <InputText
                id="prompt"
                value={prompt}
                className="w-full lg:w-[32rem] xl:w-[64rem]"
                minLength={1}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <label htmlFor="prompt">Prompt</label>
            </FloatLabel>
          </div>
          <div className="p-4">
            <Button type="submit" label="Generate" icon="pi pi-check" iconPos="right" loading={loading}></Button>
          </div>
        </div>
      </form>
      <div>
        {/* TODO Switch to Prime react Toast: https://primereact.org/toast/ */}
        {error ? <div className="mt-4 p-4 bg-red-500">{error}</div> : ''}

        <div className="mt-4 p-4">
          <div className="flex flex-col items-center justify-center w-full">
            {!loading && prediction && prediction.output && (
              <Image
                src={Array.isArray(prediction.output) ? prediction.output[prediction.output.length - 1] : prediction.output}
                width={500}
                height={500}
                alt="Image generated using AI"
                className="object-cover rounded-md border-gray-300 border-2"
              />
            )}

            {loading && (
              <div className="w-[500px] h-[500px] flex flex-col items-center justify-center object-center">
                <ProgressSpinner className="w-32 h-32" strokeWidth={4} aria-label="Loading" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
