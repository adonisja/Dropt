import { defineFunction, secret } from '@aws-amplify/backend';

export const aiHandler = defineFunction({
  name: 'ai-handler',
  entry: './handler.ts',
  environment: {
    GEMINI_API_KEY: secret('GEMINI_API_KEY'),
  },
  timeoutSeconds: 60, // AI generation can take time
});
