import { NextRequest, NextResponse } from 'next/server';
import { getLogger } from '../../utils/logging';
import Replicate from 'replicate';
import { API_KEY_HEADER, API_KEY, REPLICATE_API_TOKEN, REPLICATE_IMAGE_GENERATION_MODEL } from '../../constants';
import { predictionRequestBodySchema, PredictionResponseBody } from '../../utils/schemas';
import { sleep } from '../../utils/sleep.fn';

// Ensure this function has enough time to complete: https://vercel.com/docs/functions/configuring-functions/duration#maximum-duration-for-different-runtimes
export const maxDuration = 60;

// Force dynamic rendering: https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const logger = getLogger('api', request.url);
  logger.info({}, 'Handling POST Prediction request');

  const responseBody: PredictionResponseBody = {
    // No error by default
  };

  if (!process.env[REPLICATE_API_TOKEN]) {
    logger.error({}, 'The [REPLICATE_API_TOKEN] environment variable is not set. Cannot generate prediction');
    responseBody.error = 'Please try again later...';
    return NextResponse.json(responseBody, {
      status: 500,
    });
  }

  if (!process.env[REPLICATE_IMAGE_GENERATION_MODEL]) {
    logger.error({}, 'The [REPLICATE_API_TOKEN] environment variable is not set. Cannot generate prediction');
    responseBody.error = 'Please try again later...';
    return NextResponse.json(responseBody, {
      status: 500,
    });
  }

  if (!process.env[API_KEY]) {
    logger.error({}, 'The [API_KEY_SEBASTIEN] environment variable is not set. Cannot generate prediction');
    responseBody.error = 'The server is not configured correctly. Please try again later';
    return NextResponse.json(responseBody, {
      status: 500,
    });
  }

  logger.info({}, 'Checking client API key');
  const clientApiKey = request.headers.get(API_KEY_HEADER);
  if (!clientApiKey) {
    logger.warn({}, 'No API key provided');
    responseBody.error = 'You are not authenticated';
    return NextResponse.json(responseBody, {
      status: 401,
    });
  } else if (process.env[API_KEY] !== clientApiKey) {
    logger.warn({}, 'Invalid API key provided');
    responseBody.error = 'Access denied';
    return NextResponse.json(responseBody, {
      status: 403,
    });
  } else {
    logger.info({}, 'API key validated successfully!');
  }

  logger.info({}, 'Validating request body');
  const requestBody = await request.json();

  const requestValidationResult = predictionRequestBodySchema.safeParse(requestBody);
  if (!requestValidationResult.success) {
    logger.warn(requestValidationResult.error, 'Invalid request body');
    responseBody.error = 'Invalid request';
    return NextResponse.json(responseBody, {
      status: 400,
    });
  }

  logger.info({}, 'Creating Replicate API client');
  const replicate = new Replicate({
    auth: process.env[REPLICATE_API_TOKEN],
  });

  logger.info(requestValidationResult.error, 'Sending request to Replicate...');
  try {
    let predictionResult = await replicate.predictions.create({
      model: process.env[REPLICATE_IMAGE_GENERATION_MODEL],
      // TODO enforce specific version of the model for stability (?)
      // version: "...",

      // Model configuration
      input: { prompt: requestValidationResult.data.prompt },
    });

    logger.info(predictionResult, 'Response received from Replicate');

    if (predictionResult.error) {
      logger.warn(predictionResult.error.detail, 'Error received from Replicate');
      responseBody.error = 'Could not generate prediction';
      return NextResponse.json(responseBody, {
        status: 500,
      });
    }

    // Load the data
    while (predictionResult.status !== 'succeeded' && predictionResult.status !== 'failed') {
      await sleep(1000);

      logger.info({}, 'Loading the results from Replicate');
      predictionResult = await replicate.predictions.get(predictionResult.id);
      logger.info(predictionResult, 'Received response from Replicate');

      if (predictionResult?.error) {
        logger.warn(predictionResult.error.detail, 'Error received from Replicate');
        responseBody.error = 'Could not fetch results';
        return NextResponse.json(responseBody, {
          status: 500,
        });
      }
    }

    if (predictionResult.status === 'failed') {
      logger.warn({}, 'Failed to load the results from Replicate');
      responseBody.error = 'Could not fetch results';
      return NextResponse.json(responseBody, {
        status: 500,
      });
    }

    if (predictionResult.status === 'succeeded') {
      logger.info(predictionResult, 'Successfully loaded the results from Replicate');
    }

    responseBody.result = predictionResult;
  } catch (error) {
    logger.warn(error, 'Error received from Replicate');
    responseBody.error = 'Could not generate prediction';
    return NextResponse.json(responseBody, {
      status: 500,
    });
  }

  return NextResponse.json(responseBody, {
    status: 201,
  });
}
