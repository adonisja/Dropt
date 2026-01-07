import { AIService } from '@/lib/api/ai-service';

const BASE_WEIGHTS = {
    ACADEMIC: 0.60,
    IMPORTANCE: 0.20,
    PSYCHOLOGICAL: 0.10,
    CONTEXT: 0.10
}

export interface RecommendationInput {
    courseName: string;      // Added for AI context
    currentGrade: number;     // Student's current grade: 0-100
    isRequired: boolean;     // Is this course a requirement or elective
    stressLevel: number;    // Stress factor: 0-10
    weeklyHours: number;   // How many hours per week is spent studying this course
    passingGrade: number; // Passing Grade for this course
}

export interface RecommendationResult {
    score: number,
    riskLevel: 'Excellent' | 'Safe' | 'At Risk' | 'Critical',
    advice: string[]
}

export function normalizeStress(stressLevel: number): number {
    return (10 - stressLevel) * 0.1;
} 

export function normalizeWorkload(weeklyHours: number): number {
    const ceiling = 40;                                      // Set a limit to the max value we'll consider
    const score = (ceiling - weeklyHours) / ceiling         // perform a normalization of the value
    return Math.max(0, score)                       // Return a value of 0 if the if the actual weeklyHours exceeds 40
}

export function normalizeGrade(currentGrade: number, passingGrade: number): number {
    if (currentGrade < passingGrade) {
        // Failing: Quadratic decay from 0.6 down to 0
        // This punishes low grades more severely than linear
        // At passingGrade (limit), score is 0.6
        // At 0, score is 0
        const ratio = currentGrade / passingGrade;
        return 0.6 * Math.pow(ratio, 2);
    } else {
        // Passing: Linear scale from 0.6 to 1.0
        // 0.6 is the baseline for "Passing"
        const ratio = (currentGrade - passingGrade) / (100 - passingGrade);
        return 0.6 + (0.4 * ratio);
    }
}

export function calculateRecommendation(input: RecommendationInput): RecommendationResult { 
    const { currentGrade, isRequired, stressLevel, weeklyHours, passingGrade } = input;

    // 1. Calculate Base Scores
    const academicScore = normalizeGrade(currentGrade, passingGrade);
    const stressScore = normalizeStress(stressLevel);
    const workloadScore = normalizeWorkload(weeklyHours);
    const requirementScore = (isRequired ? 1 : 0.5);

    // 2. Calculate Dynamic Weights
    // "Stress factors really begin to play a factor as you approach the threshold"
    // We define a "Battle Zone" around the passing grade where stress matters more.
    const dist = Math.abs(currentGrade - passingGrade);
    const zone = 15; // +/- 15 points is the critical decision zone

    let stressWeight = BASE_WEIGHTS.PSYCHOLOGICAL;
    let workloadWeight = BASE_WEIGHTS.CONTEXT;
    let academicWeight = BASE_WEIGHTS.ACADEMIC;

    if (dist < zone) {
        // Calculate influence (0 to 1, where 1 is AT the threshold)
        const influence = 1 - (dist / zone);
        const shiftAmount = 0.15 * influence; // Max shift 15% weight

        // Shift weight FROM Academic TO Stress/Workload
        // When you are on the line, your mental state is the tie-breaker
        academicWeight -= shiftAmount;
        stressWeight += (shiftAmount / 2);
        workloadWeight += (shiftAmount / 2);
    }

    // 3. Calculate Final Score
    let finalScore = 
        (academicScore * academicWeight) + 
        (stressScore * stressWeight) + 
        (workloadScore * workloadWeight) + 
        (requirementScore * BASE_WEIGHTS.IMPORTANCE);

    // 4. Safety Nets (Preserve High Grade Immunity)
    if (currentGrade >= 90) {
        finalScore = Math.max(finalScore, 0.90); // Always Excellent
    } else if (currentGrade >= passingGrade + 15) {
        finalScore = Math.max(finalScore, 0.75); // Always Safe if comfortably passing
    }

    // Determine risk level based on final score
    let riskLevel: 'Excellent' | 'Safe' | 'At Risk' | 'Critical';
    if (finalScore >= 0.90) {
        riskLevel = 'Excellent';
    } else if (finalScore >= 0.75) {
        riskLevel = 'Safe';
    } else if (finalScore >= 0.5) {
        riskLevel = 'At Risk';
    } else {
        riskLevel = 'Critical';
    }
    return {
        score: finalScore * 100,  // Convert to percentage
        riskLevel,
        advice: generateAdvice(academicScore, stressScore, workloadScore)
    }
}

export function generateAdvice(
    academicScore: number,
    stressScore: number,
    workloadScore: number
): string[] {
    const advice: string[] = [];

    if (academicScore < 0.7) {
        advice.push("Focus on improving your academic performance by dedicating more time to studying and seeking help when needed.");
    }
    if (stressScore < 0.5) {
        advice.push("Consider stress management techniques such as mindfulness, exercise, or talking to a counselor to help reduce your stress levels.");
    }
    if (workloadScore < 0.5) {
        advice.push("Evaluate your study schedule and try to allocate more time to this course to better manage your workload.");
    }
    if (advice.length === 0) {
        advice.push("Keep up the good work! Maintain your current strategies to continue succeeding in this course.");
    }
    return advice;
}

/**
 * Generates AI-powered advice based on the calculated recommendation
 */
export async function generateAIAdviceForCourse(input: RecommendationInput, result: RecommendationResult): Promise<string> {
    return AIService.generateAdvice({
        courseName: input.courseName,
        currentGrade: input.currentGrade,
        stressLevel: input.stressLevel,
        hoursSpent: input.weeklyHours,
        riskLevel: result.riskLevel,
        passingGrade: input.passingGrade,
        isRequired: input.isRequired,
        recommendationScore: result.score
    });
}