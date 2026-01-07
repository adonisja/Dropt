import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";
import { initSchema } from "@aws-amplify/datastore";

import { schema } from "./schema";



type EagerStudentCourseModel = {
  readonly [__modelMeta__]: {
    identifier: CompositeIdentifier<StudentCourse, ['studentId', 'courseId']>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly studentId: string;
  readonly courseId: string;
  readonly courseName: string;
  readonly department?: string | null;
  readonly credits?: number | null;
  readonly semester?: string | null;
  readonly year?: number | null;
  readonly yearOfStudy?: string | null;
  readonly isRequired?: boolean | null;
  readonly expectedGraduation?: string | null;
  readonly passingGrade?: number | null;
  readonly instructor?: string | null;
  readonly instructorEmail?: string | null;
  readonly officeHours?: string | null;
  readonly classDays?: string | null;
  readonly classTime?: string | null;
  readonly stressLevel?: number | null;
  readonly sleepScore?: number | null;
  readonly symptomsScore?: number | null;
  readonly weeklyTimeInvestment?: number | null;
  readonly impactOnOtherCourses?: number | null;
  readonly overallWellbeing?: number | null;
  readonly semesterCreditHours?: number | null;
  readonly otherCoursesCount?: number | null;
  readonly currentGPA?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyStudentCourseModel = {
  readonly [__modelMeta__]: {
    identifier: CompositeIdentifier<StudentCourse, ['studentId', 'courseId']>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly studentId: string;
  readonly courseId: string;
  readonly courseName: string;
  readonly department?: string | null;
  readonly credits?: number | null;
  readonly semester?: string | null;
  readonly year?: number | null;
  readonly yearOfStudy?: string | null;
  readonly isRequired?: boolean | null;
  readonly expectedGraduation?: string | null;
  readonly passingGrade?: number | null;
  readonly instructor?: string | null;
  readonly instructorEmail?: string | null;
  readonly officeHours?: string | null;
  readonly classDays?: string | null;
  readonly classTime?: string | null;
  readonly stressLevel?: number | null;
  readonly sleepScore?: number | null;
  readonly symptomsScore?: number | null;
  readonly weeklyTimeInvestment?: number | null;
  readonly impactOnOtherCourses?: number | null;
  readonly overallWellbeing?: number | null;
  readonly semesterCreditHours?: number | null;
  readonly otherCoursesCount?: number | null;
  readonly currentGPA?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type StudentCourseModel = LazyLoading extends LazyLoadingDisabled ? EagerStudentCourseModel : LazyStudentCourseModel

export declare const StudentCourseModel: (new (init: ModelInit<StudentCourseModel>) => StudentCourseModel) & {
  copyOf(source: StudentCourseModel, mutator: (draft: MutableModel<StudentCourseModel>) => MutableModel<StudentCourseModel> | void): StudentCourseModel;
}

type EagerGradeCategoryModel = {
  readonly [__modelMeta__]: {
    identifier: CompositeIdentifier<GradeCategory, ['studentCourseId', 'category']>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly studentCourseId: string;
  readonly category: string;
  readonly weight: number;
  readonly dropLowest?: number | null;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyGradeCategoryModel = {
  readonly [__modelMeta__]: {
    identifier: CompositeIdentifier<GradeCategory, ['studentCourseId', 'category']>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly studentCourseId: string;
  readonly category: string;
  readonly weight: number;
  readonly dropLowest?: number | null;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type GradeCategoryModel = LazyLoading extends LazyLoadingDisabled ? EagerGradeCategoryModel : LazyGradeCategoryModel

export declare const GradeCategoryModel: (new (init: ModelInit<GradeCategoryModel>) => GradeCategoryModel) & {
  copyOf(source: GradeCategoryModel, mutator: (draft: MutableModel<GradeCategoryModel>) => MutableModel<GradeCategoryModel> | void): GradeCategoryModel;
}

type EagerAssignmentModel = {
  readonly [__modelMeta__]: {
    identifier: CompositeIdentifier<Assignment, ['studentCourseId', 'assignmentId']>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly studentCourseId: string;
  readonly assignmentId: string;
  readonly assignmentName: string;
  readonly category: string;
  readonly scoreEarned?: number | null;
  readonly maxScore: number;
  readonly dateDue: string;
  readonly dateAssigned?: string | null;
  readonly dateSubmitted?: string | null;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyAssignmentModel = {
  readonly [__modelMeta__]: {
    identifier: CompositeIdentifier<Assignment, ['studentCourseId', 'assignmentId']>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly studentCourseId: string;
  readonly assignmentId: string;
  readonly assignmentName: string;
  readonly category: string;
  readonly scoreEarned?: number | null;
  readonly maxScore: number;
  readonly dateDue: string;
  readonly dateAssigned?: string | null;
  readonly dateSubmitted?: string | null;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type AssignmentModel = LazyLoading extends LazyLoadingDisabled ? EagerAssignmentModel : LazyAssignmentModel

export declare const AssignmentModel: (new (init: ModelInit<AssignmentModel>) => AssignmentModel) & {
  copyOf(source: AssignmentModel, mutator: (draft: MutableModel<AssignmentModel>) => MutableModel<AssignmentModel> | void): AssignmentModel;
}

type EagerCourseResourceModel = {
  readonly [__modelMeta__]: {
    identifier: CompositeIdentifier<CourseResource, ['studentCourseId', 'resourceId']>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly studentCourseId: string;
  readonly resourceId: string;
  readonly title: string;
  readonly type: string;
  readonly url?: string | null;
  readonly content?: string | null;
  readonly tags?: (string | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyCourseResourceModel = {
  readonly [__modelMeta__]: {
    identifier: CompositeIdentifier<CourseResource, ['studentCourseId', 'resourceId']>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly studentCourseId: string;
  readonly resourceId: string;
  readonly title: string;
  readonly type: string;
  readonly url?: string | null;
  readonly content?: string | null;
  readonly tags?: (string | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type CourseResourceModel = LazyLoading extends LazyLoadingDisabled ? EagerCourseResourceModel : LazyCourseResourceModel

export declare const CourseResourceModel: (new (init: ModelInit<CourseResourceModel>) => CourseResourceModel) & {
  copyOf(source: CourseResourceModel, mutator: (draft: MutableModel<CourseResourceModel>) => MutableModel<CourseResourceModel> | void): CourseResourceModel;
}

type EagerUserSettingsModel = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<UserSettings, 'userId'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly userId: string;
  readonly preferredStudyTimes?: (string | null)[] | null;
  readonly currentSemester?: string | null;
  readonly currentYear: number;
  readonly notificationPreferences: string;
  readonly theme?: string | null;
  readonly hasRunLegacyMigration?: boolean | null;
  readonly totalTasksCompleted?: number | null;
  readonly totalTasksMissed?: number | null;
  readonly totalTasksEver?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUserSettingsModel = {
  readonly [__modelMeta__]: {
    identifier: CustomIdentifier<UserSettings, 'userId'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly userId: string;
  readonly preferredStudyTimes?: (string | null)[] | null;
  readonly currentSemester?: string | null;
  readonly currentYear: number;
  readonly notificationPreferences: string;
  readonly theme?: string | null;
  readonly hasRunLegacyMigration?: boolean | null;
  readonly totalTasksCompleted?: number | null;
  readonly totalTasksMissed?: number | null;
  readonly totalTasksEver?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type UserSettingsModel = LazyLoading extends LazyLoadingDisabled ? EagerUserSettingsModel : LazyUserSettingsModel

export declare const UserSettingsModel: (new (init: ModelInit<UserSettingsModel>) => UserSettingsModel) & {
  copyOf(source: UserSettingsModel, mutator: (draft: MutableModel<UserSettingsModel>) => MutableModel<UserSettingsModel> | void): UserSettingsModel;
}



const { StudentCourse, GradeCategory, Assignment, CourseResource, UserSettings } = initSchema(schema) as {
  StudentCourse: PersistentModelConstructor<StudentCourseModel>;
  GradeCategory: PersistentModelConstructor<GradeCategoryModel>;
  Assignment: PersistentModelConstructor<AssignmentModel>;
  CourseResource: PersistentModelConstructor<CourseResourceModel>;
  UserSettings: PersistentModelConstructor<UserSettingsModel>;
};

export {
  StudentCourse,
  GradeCategory,
  Assignment,
  CourseResource,
  UserSettings
};