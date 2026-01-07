import { Amplify } from 'aws-amplify';
import 'react-native-get-random-values';

// This will be populated after running `npx ampx sandbox`
// The amplify_outputs.json file is generated automatically
let amplifyConfigured = false;

export async function configureAmplify() {
  if (amplifyConfigured) return;

  try {
    // Dynamic import to handle the case where the file doesn't exist yet
    const outputs = await import('../../amplify_outputs.json');
    
    // Handle both default export (if treated as module) and direct JSON import
    const config = outputs.default || outputs;
    
    Amplify.configure(config);
    amplifyConfigured = true;
    console.log('Amplify configured successfully');
  } catch (error) {
    console.warn('Amplify outputs not found. Run `npx ampx sandbox` to generate.');
  }
}

export { Amplify };
