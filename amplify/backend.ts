import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  storage,
});

// Customize resource names with "dropt-" prefix for easy identification
const { cfnUserPool, cfnUserPoolClient, cfnIdentityPool } = backend.auth.resources.cfnResources;

// Rename Cognito User Pool
if (cfnUserPool) {
  cfnUserPool.userPoolName = 'dropt-userpool';
}

// Rename User Pool Client
if (cfnUserPoolClient) {
  cfnUserPoolClient.clientName = 'dropt-userpool-client';
}

// Rename Identity Pool if it exists
if (cfnIdentityPool) {
  cfnIdentityPool.identityPoolName = 'dropt-identity-pool';
}

// Rename GraphQL API
const { cfnResources } = backend.data.resources;
if (cfnResources.cfnGraphqlApi) {
  cfnResources.cfnGraphqlApi.name = 'dropt-api';
}

// Add project tags to all resources for easy filtering in AWS Console
const projectTag = { key: 'Project', value: 'Dropt' };
const environmentTag = { key: 'Environment', value: 'Development' };

backend.auth.resources.userPool.node.addMetadata('tags', [projectTag, environmentTag]);
backend.data.resources.graphqlApi.node.addMetadata('tags', [projectTag, environmentTag]);
