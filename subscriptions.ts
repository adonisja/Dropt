/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateAssignment = /* GraphQL */ `subscription OnCreateAssignment(
  $filter: ModelSubscriptionAssignmentFilterInput
  $owner: String
) {
  onCreateAssignment(filter: $filter, owner: $owner) {
    assignmentId
    assignmentName
    category
    createdAt
    dateAssigned
    dateDue
    dateSubmitted
    description
    maxScore
    owner
    scoreEarned
    studentCourseId
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateAssignmentSubscriptionVariables,
  APITypes.OnCreateAssignmentSubscription
>;
export const onCreateCourseResource = /* GraphQL */ `subscription OnCreateCourseResource(
  $filter: ModelSubscriptionCourseResourceFilterInput
  $owner: String
) {
  onCreateCourseResource(filter: $filter, owner: $owner) {
    content
    createdAt
    owner
    resourceId
    studentCourseId
    tags
    title
    type
    updatedAt
    url
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateCourseResourceSubscriptionVariables,
  APITypes.OnCreateCourseResourceSubscription
>;
export const onCreateGradeCategory = /* GraphQL */ `subscription OnCreateGradeCategory(
  $filter: ModelSubscriptionGradeCategoryFilterInput
  $owner: String
) {
  onCreateGradeCategory(filter: $filter, owner: $owner) {
    category
    createdAt
    description
    dropLowest
    owner
    studentCourseId
    updatedAt
    weight
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateGradeCategorySubscriptionVariables,
  APITypes.OnCreateGradeCategorySubscription
>;
export const onCreateStudentCourse = /* GraphQL */ `subscription OnCreateStudentCourse(
  $filter: ModelSubscriptionStudentCourseFilterInput
  $owner: String
) {
  onCreateStudentCourse(filter: $filter, owner: $owner) {
    classDays
    classTime
    courseId
    courseName
    createdAt
    currentGPA
    department
    expectedGraduation
    impactOnOtherCourses
    instructor
    instructorEmail
    isRequired
    officeHours
    otherCoursesCount
    overallWellbeing
    owner
    passingGrade
    semesterCreditHours
    sleepScore
    stressLevel
    studentId
    symptomsScore
    updatedAt
    weeklyTimeInvestment
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateStudentCourseSubscriptionVariables,
  APITypes.OnCreateStudentCourseSubscription
>;
export const onDeleteAssignment = /* GraphQL */ `subscription OnDeleteAssignment(
  $filter: ModelSubscriptionAssignmentFilterInput
  $owner: String
) {
  onDeleteAssignment(filter: $filter, owner: $owner) {
    assignmentId
    assignmentName
    category
    createdAt
    dateAssigned
    dateDue
    dateSubmitted
    description
    maxScore
    owner
    scoreEarned
    studentCourseId
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteAssignmentSubscriptionVariables,
  APITypes.OnDeleteAssignmentSubscription
>;
export const onDeleteCourseResource = /* GraphQL */ `subscription OnDeleteCourseResource(
  $filter: ModelSubscriptionCourseResourceFilterInput
  $owner: String
) {
  onDeleteCourseResource(filter: $filter, owner: $owner) {
    content
    createdAt
    owner
    resourceId
    studentCourseId
    tags
    title
    type
    updatedAt
    url
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteCourseResourceSubscriptionVariables,
  APITypes.OnDeleteCourseResourceSubscription
>;
export const onDeleteGradeCategory = /* GraphQL */ `subscription OnDeleteGradeCategory(
  $filter: ModelSubscriptionGradeCategoryFilterInput
  $owner: String
) {
  onDeleteGradeCategory(filter: $filter, owner: $owner) {
    category
    createdAt
    description
    dropLowest
    owner
    studentCourseId
    updatedAt
    weight
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteGradeCategorySubscriptionVariables,
  APITypes.OnDeleteGradeCategorySubscription
>;
export const onDeleteStudentCourse = /* GraphQL */ `subscription OnDeleteStudentCourse(
  $filter: ModelSubscriptionStudentCourseFilterInput
  $owner: String
) {
  onDeleteStudentCourse(filter: $filter, owner: $owner) {
    classDays
    classTime
    courseId
    courseName
    createdAt
    currentGPA
    department
    expectedGraduation
    impactOnOtherCourses
    instructor
    instructorEmail
    isRequired
    officeHours
    otherCoursesCount
    overallWellbeing
    owner
    passingGrade
    semesterCreditHours
    sleepScore
    stressLevel
    studentId
    symptomsScore
    updatedAt
    weeklyTimeInvestment
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteStudentCourseSubscriptionVariables,
  APITypes.OnDeleteStudentCourseSubscription
>;
export const onUpdateAssignment = /* GraphQL */ `subscription OnUpdateAssignment(
  $filter: ModelSubscriptionAssignmentFilterInput
  $owner: String
) {
  onUpdateAssignment(filter: $filter, owner: $owner) {
    assignmentId
    assignmentName
    category
    createdAt
    dateAssigned
    dateDue
    dateSubmitted
    description
    maxScore
    owner
    scoreEarned
    studentCourseId
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateAssignmentSubscriptionVariables,
  APITypes.OnUpdateAssignmentSubscription
>;
export const onUpdateCourseResource = /* GraphQL */ `subscription OnUpdateCourseResource(
  $filter: ModelSubscriptionCourseResourceFilterInput
  $owner: String
) {
  onUpdateCourseResource(filter: $filter, owner: $owner) {
    content
    createdAt
    owner
    resourceId
    studentCourseId
    tags
    title
    type
    updatedAt
    url
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateCourseResourceSubscriptionVariables,
  APITypes.OnUpdateCourseResourceSubscription
>;
export const onUpdateGradeCategory = /* GraphQL */ `subscription OnUpdateGradeCategory(
  $filter: ModelSubscriptionGradeCategoryFilterInput
  $owner: String
) {
  onUpdateGradeCategory(filter: $filter, owner: $owner) {
    category
    createdAt
    description
    dropLowest
    owner
    studentCourseId
    updatedAt
    weight
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateGradeCategorySubscriptionVariables,
  APITypes.OnUpdateGradeCategorySubscription
>;
export const onUpdateStudentCourse = /* GraphQL */ `subscription OnUpdateStudentCourse(
  $filter: ModelSubscriptionStudentCourseFilterInput
  $owner: String
) {
  onUpdateStudentCourse(filter: $filter, owner: $owner) {
    classDays
    classTime
    courseId
    courseName
    createdAt
    currentGPA
    department
    expectedGraduation
    impactOnOtherCourses
    instructor
    instructorEmail
    isRequired
    officeHours
    otherCoursesCount
    overallWellbeing
    owner
    passingGrade
    semesterCreditHours
    sleepScore
    stressLevel
    studentId
    symptomsScore
    updatedAt
    weeklyTimeInvestment
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateStudentCourseSubscriptionVariables,
  APITypes.OnUpdateStudentCourseSubscription
>;
