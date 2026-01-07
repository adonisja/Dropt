import { defineAuth } from '@aws-amplify/backend';
import { postConfirmation } from './post-confirmation/resource';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    // Standard attribute for user's full name
    givenName: {
      required: true,
      mutable: true,
    },
    familyName: {
      required: false,
      mutable: true,
    },
    // Custom attributes for role-based multi-tenant support
    'custom:role': {
      dataType: 'String',
      mutable: true,
    },
    'custom:tenantId': {
      dataType: 'String',
      mutable: true,
    },
  },
  groups: ['students', 'teachers', 'admins'],
  triggers: {
    postConfirmation,
  },
});
