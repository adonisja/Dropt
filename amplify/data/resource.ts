import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { aiHandler } from '../functions/ai-handler/resource';

const schema = a.schema({
  generateAIResponse: a
    .query()
    .arguments({
      action: a.string().required(),
      payload: a.json().required(),
    })
    .returns(a.string())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(aiHandler)),

  StudentCourse: a
    .model({
      studentId: a.string().required(),
      courseId: a.string().required(),
      courseName: a.string().required(),
      department: a.string(),
      credits: a.integer().default(3), // Credit hours for each course
      semester: a.string(),
      year: a.integer(),
      yearOfStudy: a.string(), // e.g., "Freshman", "Sophomore"
      isRequired: a.boolean().default(false),
      expectedGraduation: a.date(),
      passingGrade: a.float(),
      

      // Course Details
      instructor: a.string(),
      instructorEmail: a.string(),
      officeHours: a.string(),
      classDays: a.string(), // e.g. "Mon, Wed, Fri"
      classTime: a.string(), // e.g. "10:00 AM - 11:00 AM"

      // Psychological Context
      stressLevel: a.integer(), // Scale of 1-10 (calculated from sleep + symptoms + confidence)
      sleepScore: a.integer(), // Raw score from sleep question (1-10)
      symptomsScore: a.integer(), // Raw score from symptoms question (1-10)
      weeklyTimeInvestment: a.integer(), // Hours per week spent on this course
      impactOnOtherCourses: a.integer(), // How much does this affect other courses (1-10)
      overallWellbeing: a.integer(), // Overall wellbeing feeling (1-10)

      // Academic Context (for future extension)
      semesterCreditHours: a.integer(), // Total credits this semester
      otherCoursesCount: a.integer(), // Number of other courses taken this semester
      currentGPA: a.float(), // Current GPA of the student
    })
    .identifier(['studentId', 'courseId'])
    .authorization((allow) => [
      allow.owner(),
      allow.group('teachers').to(['create', 'read', 'update']),
      allow.group('admins').to(['create', 'read', 'update', 'delete']),
    ]),

  GradeCategory: a
    .model({
      studentCourseId: a.string().required(),
      category: a.string().required(),
      weight: a.float().required(),
      dropLowest: a.integer(),
      description: a.string(),
    })
    .identifier(['studentCourseId', 'category'])
    .authorization((allow) => [
      allow.owner(),
      allow.group('teachers').to(['create', 'read', 'update']),
      allow.group('admins').to(['create', 'read', 'update', 'delete']),
    ]),

  Assignment: a
    .model({
      studentCourseId: a.string().required(),
      assignmentId: a.string().required(),
      assignmentName: a.string().required(),
      category: a.string().required(),
      scoreEarned: a.float(),
      maxScore: a.float().required(),
      dateDue: a.date().required(),
      dateAssigned: a.date(),
      dateSubmitted: a.date(),
      description: a.string(),
    })
    .identifier(['studentCourseId', 'assignmentId'])
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
      allow.group('teachers').to(['create', 'read', 'update']),
      allow.group('admins').to(['create', 'read', 'update', 'delete']),
    ]),

  CourseResource: a
    .model({
      studentCourseId: a.string().required(),
      resourceId: a.string().required(),
      title: a.string().required(),
      type: a.string().required(), // 'link', 'note'
      url: a.string(),
      content: a.string(),
      tags: a.string().array(),
    })
    .identifier(['studentCourseId', 'resourceId'])
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),

  UserSettings: a
    .model({
      userId: a.string().required(),
      preferredStudyTimes: a.string().array(), // e.g., ["Morning", "Evening"]
      currentSemester: a.string(),
      currentYear: a.integer().required(),
      notificationPreferences: a.string().required(), // e.g., "email", "push"
      theme: a.string().default('light'), // 'light' or 'dark'
      hasRunLegacyMigration: a.boolean().default(false), // Track if semester migration has run
      
      // Lifetime semester statistics (accumulated across all semesters)
      totalTasksCompleted: a.integer().default(0), // All-time completed tasks
      totalTasksMissed: a.integer().default(0),    // All-time missed/overdue tasks
      totalTasksEver: a.integer().default(0),       // All-time total tasks created

    })
    .identifier(['userId'])
    .authorization((allow) => [
      allow.owner(),
    ])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});


