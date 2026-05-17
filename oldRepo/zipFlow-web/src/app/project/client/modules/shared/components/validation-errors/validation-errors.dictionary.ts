export enum ValidatorsErrors {
  Required = 'required',
  RequiredTrue = 'requiredTrue',
  Email = 'email',
  Pattern = 'pattern'
}

export const ValidationErrorsLabels: Record<string, string> = {
  [ValidatorsErrors.Required]: 'Validators.Required',
  [ValidatorsErrors.RequiredTrue]: 'Validators.RequiredTrue',
  [ValidatorsErrors.Email]: 'Validators.Email',
  [ValidatorsErrors.Pattern]: 'Validators.Pattern',
}
