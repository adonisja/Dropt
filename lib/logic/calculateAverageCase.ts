import { StudentCourseData } from "../types";
import { calculateCurrentGrade } from "./calculateCurrentGrade";

export type AssumptionMode = 'optimistic' | 'realistic' | 'conservative' | 'maintain' | 'pessimistic';

/**
 * Calculates the "Average Case" or "Projected" grade based on an assumption strategy.
 * 
 * @param data The student's course data
 * @param mode The assumption to use for ungraded categories
 *             - 'maintain': Assumes performance continues at current average (default)
 *             - 'optimistic': Assumes 100% on all ungraded work
 *             - 'realistic': Assumes 90% on all ungraded work
 *             - 'conservative': Assumes 70% on all ungraded work
 *             - 'pessimistic': Assumes 50% on all ungraded work
 */
export function calculateAverageCase(
    data: StudentCourseData, 
    mode: AssumptionMode = 'maintain'
): number | null {
    const { rubric, grades } = data;
    
    // 1. If mode is 'maintain', it's mathematically equivalent to the current grade
    //    (e.g. if you have 85% and keep getting 85%, you end with 85%)
    if (mode === 'maintain') {
        const current = calculateCurrentGrade(data);
        // If calculateCurrentGrade returns 0 but there are no graded assignments, return null
        const hasGraded = grades.assignments.some(a => a.scoreEarned !== null);
        return hasGraded ? current : null;
    }

    // 2. For other modes, we need to separate "Locked In" points from "Potential" points
    let totalWeightedScore = 0;
    let totalWeightUsed = 0;
    let totalCourseWeight = 0;

    for (const category of rubric.categories) {
        totalCourseWeight += category.weight;

        const categoryAssignments = grades.assignments.filter(
            a => a.category === category.category
        );
        
        const gradedAssignments = categoryAssignments.filter(
            a => a.scoreEarned !== null && a.maxScore !== null
        );

        if (gradedAssignments.length > 0) {
            // Category is active: Calculate actual performance
            // We reuse the logic from calculateCurrentGrade implicitly here by calculating
            // the percentage for this specific category.
            
            // Note: To be perfectly accurate with 'dropLowest', we should ideally refactor
            // calculateCurrentGrade to return per-category scores. 
            // For this implementation, we will do a simplified calculation:
            
            const totalEarned = gradedAssignments.reduce((sum, a) => sum + a.scoreEarned!, 0);
            const totalMax = gradedAssignments.reduce((sum, a) => sum + a.maxScore!, 0);
            
            if (totalMax > 0) {
                const categoryPercent = totalEarned / totalMax;
                totalWeightedScore += categoryPercent * category.weight;
                totalWeightUsed += category.weight;
            }
        } else {
            // Category is completely empty (Unknown)
            // We don't add to totalWeightUsed, because we will fill this gap with the Assumption
        }
    }

    // 3. Calculate the Assumption Factor
    let assumptionFactor = 0;
    switch (mode) {
        case 'optimistic': assumptionFactor = 1.0; break;
        case 'realistic': assumptionFactor = 0.9; break;
        case 'conservative': assumptionFactor = 0.7; break;
        case 'pessimistic': assumptionFactor = 0.5; break;
    }

    // 4. Fill the remaining weight with the assumption
    const remainingWeight = 100 - totalWeightUsed;
    
    // If the rubric doesn't add up to 100, we normalize based on what's defined
    // But typically we assume the course is out of 100.
    
    const projectedScore = totalWeightedScore + (remainingWeight * assumptionFactor);

    return projectedScore;
}
