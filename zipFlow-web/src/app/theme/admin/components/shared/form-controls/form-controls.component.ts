import {ChangeDetectorRef, Component, DestroyRef, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {faCopy} from '@fortawesome/free-regular-svg-icons';
import {ToastrService} from 'ngx-toastr';
import {Editor, Toolbar} from 'ngx-editor';
import {FormControl} from "@angular/forms";
import {Subscription} from "rxjs";
import {FileService} from "../../../services/file.service";
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {FileSnippet} from "../../../interfaces/file-snippet.interface";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-form-control',
  templateUrl: './form-controls.component.html',
  styleUrls: ['./form-controls.component.scss']
})

export class FormControlsComponent implements OnInit, OnDestroy {
  copyIcon = faCopy;
  // @ts-ignore
  editor: Editor;
  // @ts-ignore
  formControl: FormControl;
  faTrash = faTrash;

  selectedFiles: FileSnippet[] = [];

  subscriptions: Subscription[] = [];
  toolbar!: Toolbar;
  formGroup: any;

  directory: string = '';

  multiselectConfig = {
    singleSelection: false,
    idField: 'value',
    textField: 'key',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  @Input() control: any;
  @Input() disabled: boolean = false;

  @Input() set setFormGroup(value: any) {
    this.formGroup = value;
    setTimeout(() => {
      this.formControl = this.getFormControl();

      if (this.control.type === 'image' || this.control.type === 'file' && this.formControl.getRawValue().length > 0) {
        const rawValue = this.formControl.getRawValue();

        if(rawValue) {
          this.selectedFiles = this.formControl.getRawValue();
        }
      }

      this.unsubscribeSubscriptions();
      this.subscriptions.push(this.formControl.valueChanges.subscribe(() => {
        this.controlChange.emit({control: this.formControl, key: this.key, groupKey: this.groupKey});
      }))

      if (this.disabled) {
        this.formControl.disable({emitEvent: false});
      } else {
        this.formControl.enable({emitEvent: false});
      }
    }, 500)
  }

  @Input() formSubmitted: boolean = false;
  @Input() groupKey: string = '';
  @Input() key: string = '';
  @Input() modelId: string | null = null;
  @Input() entityName: string = '';

  @Output() controlChange = new EventEmitter();

  constructor(private toastr: ToastrService,
              private fileService: FileService,
              private destroy: DestroyRef,
              private route: ActivatedRoute,
              private cdr: ChangeDetectorRef) {
    this.directory = this.route.snapshot.paramMap.get('entitySlug') || '';
  }

  getFormControl() {
    if (this.groupKey) {
      let formControl = this.formGroup;

      this.groupKey.split('.').forEach(el => {
        formControl = formControl.controls[el];
      });

      return formControl;
    }
  }

  updateFormControl(newValue: any) {
    const formControl = this.getFormControl() as FormControl;
    formControl.patchValue(newValue);
  }

  copyToClipboard(event: string) {
    this.toastr.success(`Value "${event}" copied to clipboard`);
  }

  processFile(event: any) {
    if (!event.target) return;

    const files = event?.target?.files as File[];

    if (!files) return;

    for (let file of files) {
      const reader: FileReader = new FileReader();
      reader.onloadend = () => this.imageLoad(file);
      reader.readAsDataURL(file);
    }
  }

  removeFile(fileId: number) {
    if (!fileId) return;

    this.selectedFiles = this.selectedFiles.filter(({id}) => fileId !== id);

    this.updateFormControl(this.selectedFiles);
    this.fileService.destroy(String(fileId)).then();
  }

  private imageLoad(file: File) {
    this.fileService.uploadFile(file, this.directory).pipe(takeUntilDestroyed(this.destroy)).subscribe((res) => {
      this.selectedFiles.push(res);

      this.updateFormControl(this.selectedFiles);
    });
  }

  ngOnInit(): void {
    this.editor = new Editor();

    this.toolbar = [
      ["bold", "italic"],
      ["underline", "strike"],
      ["code", "blockquote"],
      ["ordered_list", "bullet_list"],
      [{ heading: ["h1", "h2", "h3", "h4", "h5", "h6"] }],
      ["link", "image"],
      ["text_color", "background_color"],
      ["align_left", "align_center", "align_right", "align_justify"],
    ];
  }

  unsubscribeSubscriptions() {
    this.subscriptions.forEach(subs => subs.unsubscribe());
  }

  ngOnDestroy(): void {
    this.editor.destroy();
    this.unsubscribeSubscriptions();
  }
}
