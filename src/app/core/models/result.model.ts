export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export function ok<T>(data?: T): OperationResult<T> {
  return { success: true, data };
}

export function fail<T>(error: string): OperationResult<T> {
  return { success: false, error };
}
