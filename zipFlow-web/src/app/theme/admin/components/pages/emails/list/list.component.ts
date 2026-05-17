import {Component, Inject, Injector, PLATFORM_ID} from '@angular/core';
import {AbstractListingComponent} from "../../../core/abstract/abstract-listing.component";
import {Entities, PolicyActions} from "../../../../dictionary/permissions.dictionary";
import {EmailTemplateService} from "../../../../services/email-template.service";
import {getErrorMessage} from "../../../../helpers/main.utils";
import {ConfirmationDialogService} from "../../../../services/confirmation-dialog.service";

@Component({
  selector: 'app-emails-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends AbstractListingComponent {
  override columns = [
    {name: 'Subject', key: 'subject', sortable: true},
    {name: 'Template', key: 'template', sortable: false},
  ];

  constructor(
    protected override service: EmailTemplateService,
    protected override injector: Injector,
    @Inject(PLATFORM_ID) protected override platformId: Object
  ) {
    super(service, injector, platformId);
  }

  get entity() {
    return Entities.EmailSender;
  }

  get routeUrl() {
    return '/admin/email-sender';
  }

  get policyActions() {
    return PolicyActions;
  }

  protected get sendEmailsMessage() {
    return 'Do you wanna send emails?';
  }

  protected get emailsSent() {
    return 'Emails sent successfully!';
  }

  sendEmails(row: { id: string }) {
    this.confirmationDialog.confirm(`Send emails`, this.sendEmailsMessage)
      .then(async (confirmed) => {
        if (confirmed && row.id) {
          await this.service.sendEmails(row.id);
          this.toastrService.success(this.emailsSent);
        }
      })
      .catch((error) => {
        const errorMessage = getErrorMessage(error);
        if (errorMessage) {
          this.toastrService.error(errorMessage);
        }
      });
  }

  private get confirmationDialog(): ConfirmationDialogService {
    return this.injector.get(ConfirmationDialogService);
  }
}
