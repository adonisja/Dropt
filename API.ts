/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Assignment = {
  __typename: "Assignment",
  assignmentId: string,
  assignmentName: string,
  category: string,
  createdAt: string,
  dateAssigned?: string | null,
  dateDue: string,
  dateSubmitted?: string | null,
  description?: string | null,
  maxScore: number,
  owner?: string | null,
  scoreEarned?: number | null,
  studentCourseId: string,
  updatedAt: string,
};

export type CourseResource = {
  __typename: "CourseResource",
  content?: string | null,
  createdAt: string,
  owner?: string | null,
  resourceId: string,
  studentCourseId: string,
  tags?: Array< string | null > | null,
  title: string,
  type: string,
  updatedAt: string,
  url?: string | null,
};

export type GradeCategory = {
  __typename: "GradeCategory",
  category: string,
  createdAt: string,
  description?: string | null,
  dropLowest?: number | null,
  owner?: string | null,
  studentCourseId: string,
  updatedAt: string,
  weight: number,
};

export type StudentCourse = {
  __typename: "StudentCourse",
  classDays?: string | null,
  classTime?: string | null,
  courseId: string,
  courseName: string,
  createdAt: string,
  currentGPA?: number | null,
  department?: string | null,
  expectedGraduation?: string | null,
  impactOnOtherCourses?: number | null,
  instructor?: string | null,
  instructorEmail?: string | null,
  isRequired?: boolean | null,
  officeHours?: string | null,
  otherCoursesCount?: number | null,
  overallWellbeing?: number | null,
  owner?: string | null,
  passingGrade?: number | null,
  semesterCreditHours?: number | null,
  sleepScore?: number | null,
  stressLevel?: number | null,
  studentId: string,
  symptomsScore?: number | null,
  updatedAt: string,
  weeklyTimeInvestment?: number | null,
};

export type ModelStringKeyConditionInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
};

export type ModelAssignmentFilterInput = {
  and?: Array< ModelAssignmentFilterInput | null > | null,
  assignmentId?: ModelStringInput | null,
  assignmentName?: ModelStringInput | null,
  category?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  dateAssigned?: ModelStringInput | null,
  dateDue?: ModelStringInput | null,
  dateSubmitted?: ModelStringInput | null,
  description?: ModelStringInput | null,
  id?: ModelIDInput | null,
  maxScore?: ModelFloatInput | null,
  not?: ModelAssignmentFilterInput | null,
  or?: Array< ModelAssignmentFilterInput | null > | null,
  owner?: ModelStringInput | null,
  scoreEarned?: ModelFloatInput | null,
  studentCourseId?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  _null = "_null",
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
}


export type ModelSizeInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelIDInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export type ModelFloatInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelAssignmentConnection = {
  __typename: "ModelAssignmentConnection",
  items:  Array<Assignment | null >,
  nextToken?: string | null,
};

export type ModelCourseResourceFilterInput = {
  and?: Array< ModelCourseResourceFilterInput | null > | null,
  content?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelCourseResourceFilterInput | null,
  or?: Array< ModelCourseResourceFilterInput | null > | null,
  owner?: ModelStringInput | null,
  resourceId?: ModelStringInput | null,
  studentCourseId?: ModelStringInput | null,
  tags?: ModelStringInput | null,
  title?: ModelStringInput | null,
  type?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  url?: ModelStringInput | null,
};

export type ModelCourseResourceConnection = {
  __typename: "ModelCourseResourceConnection",
  items:  Array<CourseResource | null >,
  nextToken?: string | null,
};

export type ModelGradeCategoryFilterInput = {
  and?: Array< ModelGradeCategoryFilterInput | null > | null,
  category?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  description?: ModelStringInput | null,
  dropLowest?: ModelIntInput | null,
  id?: ModelIDInput | null,
  not?: ModelGradeCategoryFilterInput | null,
  or?: Array< ModelGradeCategoryFilterInput | null > | null,
  owner?: ModelStringInput | null,
  studentCourseId?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  weight?: ModelFloatInput | null,
};

export type ModelIntInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelGradeCategoryConnection = {
  __typename: "ModelGradeCategoryConnection",
  items:  Array<GradeCategory | null >,
  nextToken?: string | null,
};

export type ModelStudentCourseFilterInput = {
  and?: Array< ModelStudentCourseFilterInput | null > | null,
  classDays?: ModelStringInput | null,
  classTime?: ModelStringInput | null,
  courseId?: ModelStringInput | null,
  courseName?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  currentGPA?: ModelFloatInput | null,
  department?: ModelStringInput | null,
  expectedGraduation?: ModelStringInput | null,
  id?: ModelIDInput | null,
  impactOnOtherCourses?: ModelIntInput | null,
  instructor?: ModelStringInput | null,
  instructorEmail?: ModelStringInput | null,
  isRequired?: ModelBooleanInput | null,
  not?: ModelStudentCourseFilterInput | null,
  officeHours?: ModelStringInput | null,
  or?: Array< ModelStudentCourseFilterInput | null > | null,
  otherCoursesCount?: ModelIntInput | null,
  overallWellbeing?: ModelIntInput | null,
  owner?: ModelStringInput | null,
  passingGrade?: ModelFloatInput | null,
  semesterCreditHours?: ModelIntInput | null,
  sleepScore?: ModelIntInput | null,
  stressLevel?: ModelIntInput | null,
  studentId?: ModelStringInput | null,
  symptomsScore?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
  weeklyTimeInvestment?: ModelIntInput | null,
};

export type ModelBooleanInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  eq?: boolean | null,
  ne?: boolean | null,
};

export type ModelStudentCourseConnection = {
  __typename: "ModelStudentCourseConnection",
  items:  Array<StudentCourse | null >,
  nextToken?: string | null,
};

export type ModelAssignmentConditionInput = {
  and?: Array< ModelAssignmentConditionInput | null > | null,
  assignmentName?: ModelStringInput | null,
  category?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  dateAssigned?: ModelStringInput | null,
  dateDue?: ModelStringInput | null,
  dateSubmitted?: ModelStringInput | null,
  description?: ModelStringInput | null,
  maxScore?: ModelFloatInput | null,
  not?: ModelAssignmentConditionInput | null,
  or?: Array< ModelAssignmentConditionInput | null > | null,
  owner?: ModelStringInput | null,
  scoreEarned?: ModelFloatInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateAssignmentInput = {
  assignmentId: string,
  assignmentName: string,
  category: string,
  dateAssigned?: string | null,
  dateDue: string,
  dateSubmitted?: string | null,
  description?: string | null,
  maxScore: number,
  scoreEarned?: number | null,
  studentCourseId: string,
};

export type ModelCourseResourceConditionInput = {
  and?: Array< ModelCourseResourceConditionInput | null > | null,
  content?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  not?: ModelCourseResourceConditionInput | null,
  or?: Array< ModelCourseResourceConditionInput | null > | null,
  owner?: ModelStringInput | null,
  tags?: ModelStringInput | null,
  title?: ModelStringInput | null,
  type?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  url?: ModelStringInput | null,
};

export type CreateCourseResourceInput = {
  content?: string | null,
  resourceId: string,
  studentCourseId: string,
  tags?: Array< string | null > | null,
  title: string,
  type: string,
  url?: string | null,
};

export type ModelGradeCategoryConditionInput = {
  and?: Array< ModelGradeCategoryConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  description?: ModelStringInput | null,
  dropLowest?: ModelIntInput | null,
  not?: ModelGradeCategoryConditionInput | null,
  or?: Array< ModelGradeCategoryConditionInput | null > | null,
  owner?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  weight?: ModelFloatInput | null,
};

export type CreateGradeCategoryInput = {
  category: string,
  description?: string | null,
  dropLowest?: number | null,
  studentCourseId: string,
  weight: number,
};

export type ModelStudentCourseConditionInput = {
  and?: Array< ModelStudentCourseConditionInput | null > | null,
  classDays?: ModelStringInput | null,
  classTime?: ModelStringInput | null,
  courseName?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  currentGPA?: ModelFloatInput | null,
  department?: ModelStringInput | null,
  expectedGraduation?: ModelStringInput | null,
  impactOnOtherCourses?: ModelIntInput | null,
  instructor?: ModelStringInput | null,
  instructorEmail?: ModelStringInput | null,
  isRequired?: ModelBooleanInput | null,
  not?: ModelStudentCourseConditionInput | null,
  officeHours?: ModelStringInput | null,
  or?: Array< ModelStudentCourseConditionInput | null > | null,
  otherCoursesCount?: ModelIntInput | null,
  overallWellbeing?: ModelIntInput | null,
  owner?: ModelStringInput | null,
  passingGrade?: ModelFloatInput | null,
  semesterCreditHours?: ModelIntInput | null,
  sleepScore?: ModelIntInput | null,
  stressLevel?: ModelIntInput | null,
  symptomsScore?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
  weeklyTimeInvestment?: ModelIntInput | null,
};

export type CreateStudentCourseInput = {
  classDays?: string | null,
  classTime?: string | null,
  courseId: string,
  courseName: string,
  currentGPA?: number | null,
  department?: string | null,
  expectedGraduation?: string | null,
  impactOnOtherCourses?: number | null,
  instructor?: string | null,
  instructorEmail?: string | null,
  isRequired?: boolean | null,
  officeHours?: string | null,
  otherCoursesCount?: number | null,
  overallWellbeing?: number | null,
  passingGrade?: number | null,
  semesterCreditHours?: number | null,
  sleepScore?: number | null,
  stressLevel?: number | null,
  studentId: string,
  symptomsScore?: number | null,
  weeklyTimeInvestment?: number | null,
};

export type DeleteAssignmentInput = {
  assignmentId: string,
  studentCourseId: string,
};

export type DeleteCourseResourceInput = {
  resourceId: string,
  studentCourseId: string,
};

export type DeleteGradeCategoryInput = {
  category: string,
  studentCourseId: string,
};

export type DeleteStudentCourseInput = {
  courseId: string,
  studentId: string,
};

export type UpdateAssignmentInput = {
  assignmentId: string,
  assignmentName?: string | null,
  category?: string | null,
  dateAssigned?: string | null,
  dateDue?: string | null,
  dateSubmitted?: string | null,
  description?: string | null,
  maxScore?: number | null,
  scoreEarned?: number | null,
  studentCourseId: string,
};

export type UpdateCourseResourceInput = {
  content?: string | null,
  resourceId: string,
  studentCourseId: string,
  tags?: Array< string | null > | null,
  title?: string | null,
  type?: string | null,
  url?: string | null,
};

export type UpdateGradeCategoryInput = {
  category: string,
  description?: string | null,
  dropLowest?: number | null,
  studentCourseId: string,
  weight?: number | null,
};

export type UpdateStudentCourseInput = {
  classDays?: string | null,
  classTime?: string | null,
  courseId: string,
  courseName?: string | null,
  currentGPA?: number | null,
  department?: string | null,
  expectedGraduation?: string | null,
  impactOnOtherCourses?: number | null,
  instructor?: string | null,
  instructorEmail?: string | null,
  isRequired?: boolean | null,
  officeHours?: string | null,
  otherCoursesCount?: number | null,
  overallWellbeing?: number | null,
  passingGrade?: number | null,
  semesterCreditHours?: number | null,
  sleepScore?: number | null,
  stressLevel?: number | null,
  studentId: string,
  symptomsScore?: number | null,
  weeklyTimeInvestment?: number | null,
};

export type ModelSubscriptionAssignmentFilterInput = {
  and?: Array< ModelSubscriptionAssignmentFilterInput | null > | null,
  assignmentId?: ModelSubscriptionStringInput | null,
  assignmentName?: ModelSubscriptionStringInput | null,
  category?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  dateAssigned?: ModelSubscriptionStringInput | null,
  dateDue?: ModelSubscriptionStringInput | null,
  dateSubmitted?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  maxScore?: ModelSubscriptionFloatInput | null,
  or?: Array< ModelSubscriptionAssignmentFilterInput | null > | null,
  owner?: ModelStringInput | null,
  scoreEarned?: ModelSubscriptionFloatInput | null,
  studentCourseId?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionStringInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIDInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionFloatInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  in?: Array< number | null > | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionCourseResourceFilterInput = {
  and?: Array< ModelSubscriptionCourseResourceFilterInput | null > | null,
  content?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionCourseResourceFilterInput | null > | null,
  owner?: ModelStringInput | null,
  resourceId?: ModelSubscriptionStringInput | null,
  studentCourseId?: ModelSubscriptionStringInput | null,
  tags?: ModelSubscriptionStringInput | null,
  title?: ModelSubscriptionStringInput | null,
  type?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  url?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionGradeCategoryFilterInput = {
  and?: Array< ModelSubscriptionGradeCategoryFilterInput | null > | null,
  category?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  dropLowest?: ModelSubscriptionIntInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionGradeCategoryFilterInput | null > | null,
  owner?: ModelStringInput | null,
  studentCourseId?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  weight?: ModelSubscriptionFloatInput | null,
};

export type ModelSubscriptionIntInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  in?: Array< number | null > | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionStudentCourseFilterInput = {
  and?: Array< ModelSubscriptionStudentCourseFilterInput | null > | null,
  classDays?: ModelSubscriptionStringInput | null,
  classTime?: ModelSubscriptionStringInput | null,
  courseId?: ModelSubscriptionStringInput | null,
  courseName?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  currentGPA?: ModelSubscriptionFloatInput | null,
  department?: ModelSubscriptionStringInput | null,
  expectedGraduation?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  impactOnOtherCourses?: ModelSubscriptionIntInput | null,
  instructor?: ModelSubscriptionStringInput | null,
  instructorEmail?: ModelSubscriptionStringInput | null,
  isRequired?: ModelSubscriptionBooleanInput | null,
  officeHours?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionStudentCourseFilterInput | null > | null,
  otherCoursesCount?: ModelSubscriptionIntInput | null,
  overallWellbeing?: ModelSubscriptionIntInput | null,
  owner?: ModelStringInput | null,
  passingGrade?: ModelSubscriptionFloatInput | null,
  semesterCreditHours?: ModelSubscriptionIntInput | null,
  sleepScore?: ModelSubscriptionIntInput | null,
  stressLevel?: ModelSubscriptionIntInput | null,
  studentId?: ModelSubscriptionStringInput | null,
  symptomsScore?: ModelSubscriptionIntInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  weeklyTimeInvestment?: ModelSubscriptionIntInput | null,
};

export type ModelSubscriptionBooleanInput = {
  eq?: boolean | null,
  ne?: boolean | null,
};

export type GenerateAIResponseQueryVariables = {
  action: string,
  payload: string,
};

export type GenerateAIResponseQuery = {
  generateAIResponse?: string | null,
};

export type GetAssignmentQueryVariables = {
  assignmentId: string,
  studentCourseId: string,
};

export type GetAssignmentQuery = {
  getAssignment?:  {
    __typename: "Assignment",
    assignmentId: string,
    assignmentName: string,
    category: string,
    createdAt: string,
    dateAssigned?: string | null,
    dateDue: string,
    dateSubmitted?: string | null,
    description?: string | null,
    maxScore: number,
    owner?: string | null,
    scoreEarned?: number | null,
    studentCourseId: string,
    updatedAt: string,
  } | null,
};

export type GetCourseResourceQueryVariables = {
  resourceId: string,
  studentCourseId: string,
};

export type GetCourseResourceQuery = {
  getCourseResource?:  {
    __typename: "CourseResource",
    content?: string | null,
    createdAt: string,
    owner?: string | null,
    resourceId: string,
    studentCourseId: string,
    tags?: Array< string | null > | null,
    title: string,
    type: string,
    updatedAt: string,
    url?: string | null,
  } | null,
};

export type GetGradeCategoryQueryVariables = {
  category: string,
  studentCourseId: string,
};

export type GetGradeCategoryQuery = {
  getGradeCategory?:  {
    __typename: "GradeCategory",
    category: string,
    createdAt: string,
    description?: string | null,
    dropLowest?: number | null,
    owner?: string | null,
    studentCourseId: string,
    updatedAt: string,
    weight: number,
  } | null,
};

export type GetStudentCourseQueryVariables = {
  courseId: string,
  studentId: string,
};

export type GetStudentCourseQuery = {
  getStudentCourse?:  {
    __typename: "StudentCourse",
    classDays?: string | null,
    classTime?: string | null,
    courseId: string,
    courseName: string,
    createdAt: string,
    currentGPA?: number | null,
    department?: string | null,
    expectedGraduation?: string | null,
    impactOnOtherCourses?: number | null,
    instructor?: string | null,
    instructorEmail?: string | null,
    isRequired?: boolean | null,
    officeHours?: string | null,
    otherCoursesCount?: number | null,
    overallWellbeing?: number | null,
    owner?: string | null,
    passingGrade?: number | null,
    semesterCreditHours?: number | null,
    sleepScore?: number | null,
    stressLevel?: number | null,
    studentId: string,
    symptomsScore?: number | null,
    updatedAt: string,
    weeklyTimeInvestment?: number | null,
  } | null,
};

export type ListAssignmentsQueryVariables = {
  assignmentId?: ModelStringKeyConditionInput | null,
  filter?: ModelAssignmentFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
  studentCourseId?: string | null,
};

export type ListAssignmentsQuery = {
  listAssignments?:  {
    __typename: "ModelAssignmentConnection",
    items:  Array< {
      __typename: "Assignment",
      assignmentId: string,
      assignmentName: string,
      category: string,
      createdAt: string,
      dateAssigned?: string | null,
      dateDue: string,
      dateSubmitted?: string | null,
      description?: string | null,
      maxScore: number,
      owner?: string | null,
      scoreEarned?: number | null,
      studentCourseId: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListCourseResourcesQueryVariables = {
  filter?: ModelCourseResourceFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  resourceId?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  studentCourseId?: string | null,
};

export type ListCourseResourcesQuery = {
  listCourseResources?:  {
    __typename: "ModelCourseResourceConnection",
    items:  Array< {
      __typename: "CourseResource",
      content?: string | null,
      createdAt: string,
      owner?: string | null,
      resourceId: string,
      studentCourseId: string,
      tags?: Array< string | null > | null,
      title: string,
      type: string,
      updatedAt: string,
      url?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListGradeCategoriesQueryVariables = {
  category?: ModelStringKeyConditionInput | null,
  filter?: ModelGradeCategoryFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
  studentCourseId?: string | null,
};

export type ListGradeCategoriesQuery = {
  listGradeCategories?:  {
    __typename: "ModelGradeCategoryConnection",
    items:  Array< {
      __typename: "GradeCategory",
      category: string,
      createdAt: string,
      description?: string | null,
      dropLowest?: number | null,
      owner?: string | null,
      studentCourseId: string,
      updatedAt: string,
      weight: number,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListStudentCoursesQueryVariables = {
  courseId?: ModelStringKeyConditionInput | null,
  filter?: ModelStudentCourseFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
  studentId?: string | null,
};

export type ListStudentCoursesQuery = {
  listStudentCourses?:  {
    __typename: "ModelStudentCourseConnection",
    items:  Array< {
      __typename: "StudentCourse",
      classDays?: string | null,
      classTime?: string | null,
      courseId: string,
      courseName: string,
      createdAt: string,
      currentGPA?: number | null,
      department?: string | null,
      expectedGraduation?: string | null,
      impactOnOtherCourses?: number | null,
      instructor?: string | null,
      instructorEmail?: string | null,
      isRequired?: boolean | null,
      officeHours?: string | null,
      otherCoursesCount?: number | null,
      overallWellbeing?: number | null,
      owner?: string | null,
      passingGrade?: number | null,
      semesterCreditHours?: number | null,
      sleepScore?: number | null,
      stressLevel?: number | null,
      studentId: string,
      symptomsScore?: number | null,
      updatedAt: string,
      weeklyTimeInvestment?: number | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type CreateAssignmentMutationVariables = {
  condition?: ModelAssignmentConditionInput | null,
  input: CreateAssignmentInput,
};

export type CreateAssignmentMutation = {
  createAssignment?:  {
    __typename: "Assignment",
    assignmentId: string,
    assignmentName: string,
    category: string,
    createdAt: string,
    dateAssigned?: string | null,
    dateDue: string,
    dateSubmitted?: string | null,
    description?: string | null,
    maxScore: number,
    owner?: string | null,
    scoreEarned?: number | null,
    studentCourseId: string,
    updatedAt: string,
  } | null,
};

export type CreateCourseResourceMutationVariables = {
  condition?: ModelCourseResourceConditionInput | null,
  input: CreateCourseResourceInput,
};

export type CreateCourseResourceMutation = {
  createCourseResource?:  {
    __typename: "CourseResource",
    content?: string | null,
    createdAt: string,
    owner?: string | null,
    resourceId: string,
    studentCourseId: string,
    tags?: Array< string | null > | null,
    title: string,
    type: string,
    updatedAt: string,
    url?: string | null,
  } | null,
};

export type CreateGradeCategoryMutationVariables = {
  condition?: ModelGradeCategoryConditionInput | null,
  input: CreateGradeCategoryInput,
};

export type CreateGradeCategoryMutation = {
  createGradeCategory?:  {
    __typename: "GradeCategory",
    category: string,
    createdAt: string,
    description?: string | null,
    dropLowest?: number | null,
    owner?: string | null,
    studentCourseId: string,
    updatedAt: string,
    weight: number,
  } | null,
};

export type CreateStudentCourseMutationVariables = {
  condition?: ModelStudentCourseConditionInput | null,
  input: CreateStudentCourseInput,
};

export type CreateStudentCourseMutation = {
  createStudentCourse?:  {
    __typename: "StudentCourse",
    classDays?: string | null,
    classTime?: string | null,
    courseId: string,
    courseName: string,
    createdAt: string,
    currentGPA?: number | null,
    department?: string | null,
    expectedGraduation?: string | null,
    impactOnOtherCourses?: number | null,
    instructor?: string | null,
    instructorEmail?: string | null,
    isRequired?: boolean | null,
    officeHours?: string | null,
    otherCoursesCount?: number | null,
    overallWellbeing?: number | null,
    owner?: string | null,
    passingGrade?: number | null,
    semesterCreditHours?: number | null,
    sleepScore?: number | null,
    stressLevel?: number | null,
    studentId: string,
    symptomsScore?: number | null,
    updatedAt: string,
    weeklyTimeInvestment?: number | null,
  } | null,
};

export type DeleteAssignmentMutationVariables = {
  condition?: ModelAssignmentConditionInput | null,
  input: DeleteAssignmentInput,
};

export type DeleteAssignmentMutation = {
  deleteAssignment?:  {
    __typename: "Assignment",
    assignmentId: string,
    assignmentName: string,
    category: string,
    createdAt: string,
    dateAssigned?: string | null,
    dateDue: string,
    dateSubmitted?: string | null,
    description?: string | null,
    maxScore: number,
    owner?: string | null,
    scoreEarned?: number | null,
    studentCourseId: string,
    updatedAt: string,
  } | null,
};

export type DeleteCourseResourceMutationVariables = {
  condition?: ModelCourseResourceConditionInput | null,
  input: DeleteCourseResourceInput,
};

export type DeleteCourseResourceMutation = {
  deleteCourseResource?:  {
    __typename: "CourseResource",
    content?: string | null,
    createdAt: string,
    owner?: string | null,
    resourceId: string,
    studentCourseId: string,
    tags?: Array< string | null > | null,
    title: string,
    type: string,
    updatedAt: string,
    url?: string | null,
  } | null,
};

export type DeleteGradeCategoryMutationVariables = {
  condition?: ModelGradeCategoryConditionInput | null,
  input: DeleteGradeCategoryInput,
};

export type DeleteGradeCategoryMutation = {
  deleteGradeCategory?:  {
    __typename: "GradeCategory",
    category: string,
    createdAt: string,
    description?: string | null,
    dropLowest?: number | null,
    owner?: string | null,
    studentCourseId: string,
    updatedAt: string,
    weight: number,
  } | null,
};

export type DeleteStudentCourseMutationVariables = {
  condition?: ModelStudentCourseConditionInput | null,
  input: DeleteStudentCourseInput,
};

export type DeleteStudentCourseMutation = {
  deleteStudentCourse?:  {
    __typename: "StudentCourse",
    classDays?: string | null,
    classTime?: string | null,
    courseId: string,
    courseName: string,
    createdAt: string,
    currentGPA?: number | null,
    department?: string | null,
    expectedGraduation?: string | null,
    impactOnOtherCourses?: number | null,
    instructor?: string | null,
    instructorEmail?: string | null,
    isRequired?: boolean | null,
    officeHours?: string | null,
    otherCoursesCount?: number | null,
    overallWellbeing?: number | null,
    owner?: string | null,
    passingGrade?: number | null,
    semesterCreditHours?: number | null,
    sleepScore?: number | null,
    stressLevel?: number | null,
    studentId: string,
    symptomsScore?: number | null,
    updatedAt: string,
    weeklyTimeInvestment?: number | null,
  } | null,
};

export type UpdateAssignmentMutationVariables = {
  condition?: ModelAssignmentConditionInput | null,
  input: UpdateAssignmentInput,
};

export type UpdateAssignmentMutation = {
  updateAssignment?:  {
    __typename: "Assignment",
    assignmentId: string,
    assignmentName: string,
    category: string,
    createdAt: string,
    dateAssigned?: string | null,
    dateDue: string,
    dateSubmitted?: string | null,
    description?: string | null,
    maxScore: number,
    owner?: string | null,
    scoreEarned?: number | null,
    studentCourseId: string,
    updatedAt: string,
  } | null,
};

export type UpdateCourseResourceMutationVariables = {
  condition?: ModelCourseResourceConditionInput | null,
  input: UpdateCourseResourceInput,
};

export type UpdateCourseResourceMutation = {
  updateCourseResource?:  {
    __typename: "CourseResource",
    content?: string | null,
    createdAt: string,
    owner?: string | null,
    resourceId: string,
    studentCourseId: string,
    tags?: Array< string | null > | null,
    title: string,
    type: string,
    updatedAt: string,
    url?: string | null,
  } | null,
};

export type UpdateGradeCategoryMutationVariables = {
  condition?: ModelGradeCategoryConditionInput | null,
  input: UpdateGradeCategoryInput,
};

export type UpdateGradeCategoryMutation = {
  updateGradeCategory?:  {
    __typename: "GradeCategory",
    category: string,
    createdAt: string,
    description?: string | null,
    dropLowest?: number | null,
    owner?: string | null,
    studentCourseId: string,
    updatedAt: string,
    weight: number,
  } | null,
};

export type UpdateStudentCourseMutationVariables = {
  condition?: ModelStudentCourseConditionInput | null,
  input: UpdateStudentCourseInput,
};

export type UpdateStudentCourseMutation = {
  updateStudentCourse?:  {
    __typename: "StudentCourse",
    classDays?: string | null,
    classTime?: string | null,
    courseId: string,
    courseName: string,
    createdAt: string,
    currentGPA?: number | null,
    department?: string | null,
    expectedGraduation?: string | null,
    impactOnOtherCourses?: number | null,
    instructor?: string | null,
    instructorEmail?: string | null,
    isRequired?: boolean | null,
    officeHours?: string | null,
    otherCoursesCount?: number | null,
    overallWellbeing?: number | null,
    owner?: string | null,
    passingGrade?: number | null,
    semesterCreditHours?: number | null,
    sleepScore?: number | null,
    stressLevel?: number | null,
    studentId: string,
    symptomsScore?: number | null,
    updatedAt: string,
    weeklyTimeInvestment?: number | null,
  } | null,
};

export type OnCreateAssignmentSubscriptionVariables = {
  filter?: ModelSubscriptionAssignmentFilterInput | null,
  owner?: string | null,
};

export type OnCreateAssignmentSubscription = {
  onCreateAssignment?:  {
    __typename: "Assignment",
    assignmentId: string,
    assignmentName: string,
    category: string,
    createdAt: string,
    dateAssigned?: string | null,
    dateDue: string,
    dateSubmitted?: string | null,
    description?: string | null,
    maxScore: number,
    owner?: string | null,
    scoreEarned?: number | null,
    studentCourseId: string,
    updatedAt: string,
  } | null,
};

export type OnCreateCourseResourceSubscriptionVariables = {
  filter?: ModelSubscriptionCourseResourceFilterInput | null,
  owner?: string | null,
};

export type OnCreateCourseResourceSubscription = {
  onCreateCourseResource?:  {
    __typename: "CourseResource",
    content?: string | null,
    createdAt: string,
    owner?: string | null,
    resourceId: string,
    studentCourseId: string,
    tags?: Array< string | null > | null,
    title: string,
    type: string,
    updatedAt: string,
    url?: string | null,
  } | null,
};

export type OnCreateGradeCategorySubscriptionVariables = {
  filter?: ModelSubscriptionGradeCategoryFilterInput | null,
  owner?: string | null,
};

export type OnCreateGradeCategorySubscription = {
  onCreateGradeCategory?:  {
    __typename: "GradeCategory",
    category: string,
    createdAt: string,
    description?: string | null,
    dropLowest?: number | null,
    owner?: string | null,
    studentCourseId: string,
    updatedAt: string,
    weight: number,
  } | null,
};

export type OnCreateStudentCourseSubscriptionVariables = {
  filter?: ModelSubscriptionStudentCourseFilterInput | null,
  owner?: string | null,
};

export type OnCreateStudentCourseSubscription = {
  onCreateStudentCourse?:  {
    __typename: "StudentCourse",
    classDays?: string | null,
    classTime?: string | null,
    courseId: string,
    courseName: string,
    createdAt: string,
    currentGPA?: number | null,
    department?: string | null,
    expectedGraduation?: string | null,
    impactOnOtherCourses?: number | null,
    instructor?: string | null,
    instructorEmail?: string | null,
    isRequired?: boolean | null,
    officeHours?: string | null,
    otherCoursesCount?: number | null,
    overallWellbeing?: number | null,
    owner?: string | null,
    passingGrade?: number | null,
    semesterCreditHours?: number | null,
    sleepScore?: number | null,
    stressLevel?: number | null,
    studentId: string,
    symptomsScore?: number | null,
    updatedAt: string,
    weeklyTimeInvestment?: number | null,
  } | null,
};

export type OnDeleteAssignmentSubscriptionVariables = {
  filter?: ModelSubscriptionAssignmentFilterInput | null,
  owner?: string | null,
};

export type OnDeleteAssignmentSubscription = {
  onDeleteAssignment?:  {
    __typename: "Assignment",
    assignmentId: string,
    assignmentName: string,
    category: string,
    createdAt: string,
    dateAssigned?: string | null,
    dateDue: string,
    dateSubmitted?: string | null,
    description?: string | null,
    maxScore: number,
    owner?: string | null,
    scoreEarned?: number | null,
    studentCourseId: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteCourseResourceSubscriptionVariables = {
  filter?: ModelSubscriptionCourseResourceFilterInput | null,
  owner?: string | null,
};

export type OnDeleteCourseResourceSubscription = {
  onDeleteCourseResource?:  {
    __typename: "CourseResource",
    content?: string | null,
    createdAt: string,
    owner?: string | null,
    resourceId: string,
    studentCourseId: string,
    tags?: Array< string | null > | null,
    title: string,
    type: string,
    updatedAt: string,
    url?: string | null,
  } | null,
};

export type OnDeleteGradeCategorySubscriptionVariables = {
  filter?: ModelSubscriptionGradeCategoryFilterInput | null,
  owner?: string | null,
};

export type OnDeleteGradeCategorySubscription = {
  onDeleteGradeCategory?:  {
    __typename: "GradeCategory",
    category: string,
    createdAt: string,
    description?: string | null,
    dropLowest?: number | null,
    owner?: string | null,
    studentCourseId: string,
    updatedAt: string,
    weight: number,
  } | null,
};

export type OnDeleteStudentCourseSubscriptionVariables = {
  filter?: ModelSubscriptionStudentCourseFilterInput | null,
  owner?: string | null,
};

export type OnDeleteStudentCourseSubscription = {
  onDeleteStudentCourse?:  {
    __typename: "StudentCourse",
    classDays?: string | null,
    classTime?: string | null,
    courseId: string,
    courseName: string,
    createdAt: string,
    currentGPA?: number | null,
    department?: string | null,
    expectedGraduation?: string | null,
    impactOnOtherCourses?: number | null,
    instructor?: string | null,
    instructorEmail?: string | null,
    isRequired?: boolean | null,
    officeHours?: string | null,
    otherCoursesCount?: number | null,
    overallWellbeing?: number | null,
    owner?: string | null,
    passingGrade?: number | null,
    semesterCreditHours?: number | null,
    sleepScore?: number | null,
    stressLevel?: number | null,
    studentId: string,
    symptomsScore?: number | null,
    updatedAt: string,
    weeklyTimeInvestment?: number | null,
  } | null,
};

export type OnUpdateAssignmentSubscriptionVariables = {
  filter?: ModelSubscriptionAssignmentFilterInput | null,
  owner?: string | null,
};

export type OnUpdateAssignmentSubscription = {
  onUpdateAssignment?:  {
    __typename: "Assignment",
    assignmentId: string,
    assignmentName: string,
    category: string,
    createdAt: string,
    dateAssigned?: string | null,
    dateDue: string,
    dateSubmitted?: string | null,
    description?: string | null,
    maxScore: number,
    owner?: string | null,
    scoreEarned?: number | null,
    studentCourseId: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateCourseResourceSubscriptionVariables = {
  filter?: ModelSubscriptionCourseResourceFilterInput | null,
  owner?: string | null,
};

export type OnUpdateCourseResourceSubscription = {
  onUpdateCourseResource?:  {
    __typename: "CourseResource",
    content?: string | null,
    createdAt: string,
    owner?: string | null,
    resourceId: string,
    studentCourseId: string,
    tags?: Array< string | null > | null,
    title: string,
    type: string,
    updatedAt: string,
    url?: string | null,
  } | null,
};

export type OnUpdateGradeCategorySubscriptionVariables = {
  filter?: ModelSubscriptionGradeCategoryFilterInput | null,
  owner?: string | null,
};

export type OnUpdateGradeCategorySubscription = {
  onUpdateGradeCategory?:  {
    __typename: "GradeCategory",
    category: string,
    createdAt: string,
    description?: string | null,
    dropLowest?: number | null,
    owner?: string | null,
    studentCourseId: string,
    updatedAt: string,
    weight: number,
  } | null,
};

export type OnUpdateStudentCourseSubscriptionVariables = {
  filter?: ModelSubscriptionStudentCourseFilterInput | null,
  owner?: string | null,
};

export type OnUpdateStudentCourseSubscription = {
  onUpdateStudentCourse?:  {
    __typename: "StudentCourse",
    classDays?: string | null,
    classTime?: string | null,
    courseId: string,
    courseName: string,
    createdAt: string,
    currentGPA?: number | null,
    department?: string | null,
    expectedGraduation?: string | null,
    impactOnOtherCourses?: number | null,
    instructor?: string | null,
    instructorEmail?: string | null,
    isRequired?: boolean | null,
    officeHours?: string | null,
    otherCoursesCount?: number | null,
    overallWellbeing?: number | null,
    owner?: string | null,
    passingGrade?: number | null,
    semesterCreditHours?: number | null,
    sleepScore?: number | null,
    stressLevel?: number | null,
    studentId: string,
    symptomsScore?: number | null,
    updatedAt: string,
    weeklyTimeInvestment?: number | null,
  } | null,
};
