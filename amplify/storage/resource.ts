import { defineStorage } from '@aws-amplify/backend';

/**  */
export const storage = defineStorage({
    name: 'droptStorage',
    access: (allow) => ({
        'syllabus/*': [
            allow.authenticated.to(['read', 'write', 'delete']), // Logged-in users can manage their syllabi
        ],
        'assignments/*': [
            allow.authenticated.to(['read', 'write', 'delete']), // Logged-in users can manage their assignments
        ],
        'profile-pictures/*': [
            allow.authenticated.to(['read', 'write', 'delete']), // Logged-in users can manage their profile pictures
        ],
    })
})