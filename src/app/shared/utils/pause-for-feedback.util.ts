export function pauseForFeedback(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}