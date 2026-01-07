import { StudentCourseData } from "../types";

export function calculateWorstCase(data: StudentCourseData): number {
    const {rubric, grades} = data;
    let totalWeightedScore = 0;
    let totalWeightUsed = 0; // To track total weight of categories with assignments

    for (const category of rubric.categories) {
        // 1. Get all assignments in each category
        const categoryAssignments = grades.assignments.filter(
            a => a.category === category.category
        );

        // 2. Skip category if there are no assignments
        if (categoryAssignments.length === 0) {
            continue;
        }

        // 3. Filter out assignments with unknown maxScore then 
        // Transform ungraded assignments to perfect scores:
        const adjustedAssignments = categoryAssignments.filter(
            a => a.maxScore !== null) // Only consider assignments with known maxScore
        .map(a => {
            if (a.scoreEarned === null) {
                return { ...a, scoreEarned: 0};
            }
            return a;
        });

        // 4. Handle dropLowest if specified
        let assignmentsToConsider = adjustedAssignments;

        if (category.dropLowest && category.dropLowest > 0) {
            const numToDrop = Math.min(
                category.dropLowest, 
                Math.max(0, adjustedAssignments.length - 2)
            );
        

            if (numToDrop > 0 && adjustedAssignments.length > numToDrop) {
                // Sort assignments by score percentage (ascending)
                const sorted = [...assignmentsToConsider].sort((a, b) => {
                    const aPercent = (a.scoreEarned! / a.maxScore!);
                    const bPercent = (b.scoreEarned! / b.maxScore!);
                    return aPercent - bPercent;
                });
                // Drop the lowest N
                assignmentsToConsider = sorted.slice(numToDrop);
            }
        }
        
        // 5. Calculate total points earned and possible in this category
        const totalEarned = assignmentsToConsider.reduce(
            (sum, a) => sum + a.scoreEarned!, 0);
        
        const totalPossible = assignmentsToConsider.reduce(
            (sum, a) => sum + a.maxScore!,0);

        // 6. Calculate Category Percentage
        const categoryPercentage = (totalEarned / totalPossible);

        // 7. Apply weight
        totalWeightedScore += categoryPercentage * category.weight;
        totalWeightUsed += category.weight;
    }

    // 8. Handle case where no categories have assignments
    if (totalWeightUsed === 0) {
        return 0;
    }

    // 9. Normalize to total weight used
    return (totalWeightedScore / totalWeightUsed) * 100;
}