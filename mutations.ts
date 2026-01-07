/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createAssignment = /* GraphQL */ `mutation CreateAssignment(
  $condition: ModelAssignmentConditionInput
  $input: CreateAssignmentInput!
) {
  createAssignment(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateAssignmentMutationVariables,
  APITypes.CreateAssignmentMutation
>;
export const createCourseResource = /* GraphQL */ `mutation CreateCourseResource(
  $condition: ModelCourseResourceConditionInput
  $input: CreateCourseResourceInput!
) {
  createCourseResource(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateCourseResourceMutationVariables,
  APITypes.CreateCourseResourceMutation
>;
export const createGradeCategory = /* GraphQL */ `mutation CreateGradeCategory(
  $condition: ModelGradeCategoryConditionInput
  $input: CreateGradeCategoryInput!
) {
  createGradeCategory(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateGradeCategoryMutationVariables,
  APITypes.CreateGradeCategoryMutation
>;
export const createStudentCourse = /* GraphQL */ `mutation CreateStudentCourse(
  $condition: ModelStudentCourseConditionInput
  $input: CreateStudentCourseInput!
) {
  createStudentCourse(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateStudentCourseMutationVariables,
  APITypes.CreateStudentCourseMutation
>;
export const deleteAssignment = /* GraphQL */ `mutation DeleteAssignment(
  $condition: ModelAssignmentConditionInput
  $input: DeleteAssignmentInput!
) {
  deleteAssignment(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteAssignmentMutationVariables,
  APITypes.DeleteAssignmentMutation
>;
export const deleteCourseResource = /* GraphQL */ `mutation DeleteCourseResource(
  $condition: ModelCourseResourceConditionInput
  $input: DeleteCourseResourceInput!
) {
  deleteCourseResource(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteCourseResourceMutationVariables,
  APITypes.DeleteCourseResourceMutation
>;
export const deleteGradeCategory = /* GraphQL */ `mutation DeleteGradeCategory(
  $condition: ModelGradeCategoryConditionInput
  $input: DeleteGradeCategoryInput!
) {
  deleteGradeCategory(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteGradeCategoryMutationVariables,
  APITypes.DeleteGradeCategoryMutation
>;
export const deleteStudentCourse = /* GraphQL */ `mutation DeleteStudentCourse(
  $condition: ModelStudentCourseConditionInput
  $input: DeleteStudentCourseInput!
) {
  deleteStudentCourse(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteStudentCourseMutationVariables,
  APITypes.DeleteStudentCourseMutation
>;
export const updateAssignment = /* GraphQL */ `mutation UpdateAssignment(
  $condition: ModelAssignmentConditionInput
  $input: UpdateAssignmentInput!
) {
  updateAssignment(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateAssignmentMutationVariables,
  APITypes.UpdateAssignmentMutation
>;
export const updateCourseResource = /* GraphQL */ `mutation UpdateCourseResource(
  $condition: ModelCourseResourceConditionInput
  $input: UpdateCourseResourceInput!
) {
  updateCourseResource(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateCourseResourceMutationVariables,
  APITypes.UpdateCourseResourceMutation
>;
export const updateGradeCategory = /* GraphQL */ `mutation UpdateGradeCategory(
  $condition: ModelGradeCategoryConditionInput
  $input: UpdateGradeCategoryInput!
) {
  updateGradeCategory(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateGradeCategoryMutationVariables,
  APITypes.UpdateGradeCategoryMutation
>;
export const updateStudentCourse = /* GraphQL */ `mutation UpdateStudentCourse(
  $condition: ModelStudentCourseConditionInput
  $input: UpdateStudentCourseInput!
) {
  updateStudentCourse(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateStudentCourseMutationVariables,
  APITypes.UpdateStudentCourseMutation
>;
