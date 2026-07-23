import type { ConditionKey } from '@/shared/conditions';

export interface Meal {
  time: string;
  menu: string;
  description: string;
}

export interface DayPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
  tips: string[];
}

export async function generateMealPlan(healthInfo: string, condition: ConditionKey): Promise<DayPlan | null> {
  try {
    const response = await fetch("/api/meal-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ healthStage: healthInfo, condition }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data as DayPlan;
  } catch (error) {
    console.error("Error generating meal plan:", error);
    return null;
  }
}

export async function checkFoodSafety(foodName: string, condition: ConditionKey): Promise<string> {
  try {
    const response = await fetch("/api/check-food", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ foodName, condition }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Server returned ${response.status}`);
    }

    return data.result || "정보를 가져오지 못했습니다.";
  } catch (error) {
    console.error("Error checking food safety:", error);
    return error instanceof Error ? error.message : "오류가 발생했습니다.";
  }
}

export async function getRecipe(menu: string, condition: ConditionKey): Promise<string> {
  try {
    const response = await fetch("/api/recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ menu, condition }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Server returned ${response.status}`);
    }

    return data.result || "레시피를 가져오지 못했습니다.";
  } catch (error) {
    console.error("Error generating recipe:", error);
    return error instanceof Error ? error.message : "오류가 발생했습니다.";
  }
}
