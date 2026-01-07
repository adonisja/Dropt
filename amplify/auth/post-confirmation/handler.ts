import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient();

// Map custom:role attribute values to Cognito group names
const roleToGroupMap: Record<string, string> = {
  student: 'students',
  teacher: 'teachers',
  admin: 'admins',
};

export const handler: PostConfirmationTriggerHandler = async (event) => {
  // Get the user's role from custom attributes
  const role = event.request.userAttributes['custom:role'] || 'student';
  const groupName = roleToGroupMap[role] || 'students';

  const command = new AdminAddUserToGroupCommand({
    GroupName: groupName,
    UserPoolId: event.userPoolId,
    Username: event.userName,
  });

  try {
    await client.send(command);
    console.log(`User ${event.userName} added to group ${groupName}`);
  } catch (error) {
    console.error(`Error adding user to group: ${error}`);
    // Don't throw - we don't want to block user confirmation
    // The user can still sign in, they just won't be in a group
  }

  return event;
};
