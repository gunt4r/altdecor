import {Component, Input} from '@angular/core';
import {ValidationErrorsLabels, ValidatorsErrors} from "./validation-errors.dictionary";
import {ValidationErrors} from "@angular/forms";

@Component({
  selector: 'app-validation-errors',
  templateUrl: './validation-errors.component.html',
  styleUrl: './validation-errors.component.scss'
})
export class ValidationErrorsComponent {
  @Input() errors!: Record<string, string> | ValidationErrors | null;

  validatorsLabels = ValidationErrorsLabels;
  validatorsErrors = ValidatorsErrors;
}
