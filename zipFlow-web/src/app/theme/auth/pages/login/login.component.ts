import {Component} from '@angular/core';
import {NonNullableFormBuilder, Validators} from "@angular/forms";
import {AuthService} from "../../../admin/services/auth.service";
import {FormControls, FormType} from "../../../admin/helpers/form-controls.helper";
import {LoginCredentials} from "./login.dictionary";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form: FormType<LoginCredentials>;
  configs: { title: string, subtitle: string, control: { [key: string]: string }, button: string } = {
    title: 'Sign in',
    subtitle: 'Please enter your Login and your Password',
    control: {
      password: 'Password',
      email: 'Email'
    },
    button: 'Login'
  }

  validators: { [key: string]: string } = {
    required: 'This field is required',
    email: 'Provide a valid email'
  }

  constructor(private fb: NonNullableFormBuilder,
              private authService: AuthService) {

    this.form = this.fb.group<FormControls<LoginCredentials>>({
      email: this.fb.control('', [Validators.required.bind(Validators), Validators.email.bind(Validators)]),
      password: this.fb.control('', Validators.required.bind(Validators))
    });
  }

  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService.login(this.form.getRawValue());
  }
}
