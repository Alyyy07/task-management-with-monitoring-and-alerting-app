export enum ValidationErrorCode {
  INVALID_INPUT = "INVALID_INPUT",
  PAST_DATE = "PAST_DATE",
}

export const ValidationErrorStatus: Record<ValidationErrorCode, number> = {
  [ValidationErrorCode.INVALID_INPUT]: 400,
  [ValidationErrorCode.PAST_DATE]: 400,
};

export class ValidationError extends Error {
  constructor(
    public readonly code: ValidationErrorCode,
    public readonly field?: string,
    public readonly message: string = code,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}
