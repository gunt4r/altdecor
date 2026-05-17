import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthorizationComponent} from './authorization/authorization.component';
import {TableComponent} from './table/table.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterModule} from '@angular/router';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {ConfirmationDialogComponent} from './confirmation-dialog/confirmation-dialog.component';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {NgxEditorModule} from 'ngx-editor';
import {FormComponent} from "./form/form.component";
import {LoaderComponent} from "./loader/loader.component";
import {FormControlsComponent} from "./form-controls/form-controls.component";
import {RouterNavListComponent} from "./router-nav-list/router-nav-list.component";
import {StateSectionComponent} from "./state-section/state-section.component";
import {AccordionComponent} from "./accordion/accordion.component";
import {PipesModule} from "../../pipes/pipes.module";
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";
import {FormValuesComponent} from "./form-values/form-values.component";

@NgModule({
  declarations: [
    AuthorizationComponent,
    TableComponent,
    ConfirmationDialogComponent,
    LoaderComponent,
    FormComponent,
    FormControlsComponent,
    RouterNavListComponent,
    AccordionComponent,
    StateSectionComponent,
    FormValuesComponent
  ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgbModule,
        RouterModule,
        FontAwesomeModule,
        AngularSvgIconModule,
        ClipboardModule,
        PipesModule,
        NgMultiSelectDropDownModule.forRoot(),
        NgxEditorModule.forRoot({
            locals: {
                bold: 'Bold',
                italic: 'Italic',
                code: 'Code',
                underline: 'Underline'
            },
        }),
        PipesModule
    ],
  exports: [
    ReactiveFormsModule,
    AuthorizationComponent,
    TableComponent,
    LoaderComponent,
    FormComponent,
    FormControlsComponent,
    RouterNavListComponent,
    AccordionComponent,
    StateSectionComponent,
    FormValuesComponent
  ]
})
export class SharedModule {
}
