/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const generateAIResponse = /* GraphQL */ `query GenerateAIResponse($action: String!, $payload: AWSJSON!) {
  generateAIResponse(action: $action, payload: $payload)
}
` as GeneratedQuery<
  APITypes.GenerateAIResponseQueryVariables,
  APITypes.GenerateAIResponseQuery
>;
export const getAssignment = /* GraphQL */ `query GetAssignment($assignmentId: String!, $studentCourseId: String!) {
  getAssignment(
    assignmentId: $assignmentId
    studentCourseId: $studentCourseId
  ) {
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
` as GeneratedQuery<
  APITypes.GetAssignmentQueryVariables,
  APITypes.GetAssignmentQuery
>;
export const getCourseResource = /* GraphQL */ `query GetCourseResource($resourceId: String!, $studentCourseId: String!) {
  getCourseResource(
    resourceId: $resourceId
    studentCourseId: $studentCourseId
  ) {
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
` as GeneratedQuery<
  APITypes.GetCourseResourceQueryVariables,
  APITypes.GetCourseResourceQuery
>;
export const getGradeCategory = /* GraphQL */ `query GetGradeCategory($category: String!, $studentCourseId: String!) {
  getGradeCategory(category: $category, studentCourseId: $studentCourseId) {
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
` as GeneratedQuery<
  APITypes.GetGradeCategoryQueryVariables,
  APITypes.GetGradeCategoryQuery
>;
export const getStudentCourse = /* GraphQL */ `query GetStudentCourse($courseId: String!, $studentId: String!) {
  getStudentCourse(courseId: $courseId, studentId: $studentId) {
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
` as GeneratedQuery<
  APITypes.GetStudentCourseQueryVariables,
  APITypes.GetStudentCourseQuery
>;
export const listAssignments = /* GraphQL */ `query ListAssignments(
  $assignmentId: ModelStringKeyConditionInput
  $filter: ModelAssignmentFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
  $studentCourseId: String
) {
  listAssignments(
    assignmentId: $assignmentId
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
    studentCourseId: $studentCourseId
  ) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAssignmentsQueryVariables,
  APITypes.ListAssignmentsQuery
>;
export const listCourseResources = /* GraphQL */ `query ListCourseResources(
  $filter: ModelCourseResourceFilterInput
  $limit: Int
  $nextToken: String
  $resourceId: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $studentCourseId: String
) {
  listCourseResources(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    resourceId: $resourceId
    sortDirection: $sortDirection
    studentCourseId: $studentCourseId
  ) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCourseResourcesQueryVariables,
  APITypes.ListCourseResourcesQuery
>;
export const listGradeCategories = /* GraphQL */ `query ListGradeCategories(
  $category: ModelStringKeyConditionInput
  $filter: ModelGradeCategoryFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
  $studentCourseId: String
) {
  listGradeCategories(
    category: $category
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
    studentCourseId: $studentCourseId
  ) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListGradeCategoriesQueryVariables,
  APITypes.ListGradeCategoriesQuery
>;
export const listStudentCourses = /* GraphQL */ `query ListStudentCourses(
  $courseId: ModelStringKeyConditionInput
  $filter: ModelStudentCourseFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
  $studentId: String
) {
  listStudentCourses(
    courseId: $courseId
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
    studentId: $studentId
  ) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListStudentCoursesQueryVariables,
  APITypes.ListStudentCoursesQuery
>;
