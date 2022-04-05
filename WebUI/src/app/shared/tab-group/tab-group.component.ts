import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import type { QueryList } from '@angular/core';
import { TabComponent } from '@msi/cobalt';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-tab-group',
  template: `
    <div class="msi-tab-labels {{customClass}}"
      #container
      cdkDropList
      (cdkDropListDropped)="drop($event)"
      cdkDropListOrientation="horizontal"
      [cdkDropListDisabled]="!draggable">
      <div *ngFor="let tab of tabs; let index = index;" cdkDrag [cdkDragDisabled]="tab.disabled" cdkDragBoundary=".msi-tab-labels">
        <button
          #buttonTab
          class="msi-tab-label msi-tab-label-{{ index }}"
          [disabled]="tab.disabled"
          (click)="clickTab(index)"
          [ngClass]="{'active': index === selectedIndex, 'disabled': tab.disabled}"
          [attr.tabIndex]="index === selectedIndex ? -1 : 0"
        >
          <ng-container
            *ngIf="tab.templateLabel"
            [ngTemplateOutlet]="tab.templateLabel.tpl"
          >
          </ng-container>
          <ng-container *ngIf="!tab.templateLabel">{{
            tab.label
          }}</ng-container>
        </button>
      </div>
    </div>
    <div class="msi-tab-content" *ngIf="selectedTab">
      <ng-container [ngTemplateOutlet]="selectedTab.content"></ng-container>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
})
export class AppTabGroupComponent implements AfterViewInit {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;
  @ViewChildren('buttonTab', { read: ElementRef }) buttonTabs: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('container', { static: true, read: ElementRef }) container: ElementRef;
  @HostBinding('class.msi-tab-group') cssClass = true;

  /** Emits newly selected index when changed */
  @Output() selectedIndexChange = new EventEmitter<number>();

  /** Emits cdkDragDrop and tabs array; Emitted when tabs order change */
  @Output() orderTabsChange = new EventEmitter<any>();

  /** Store current selected tab index */
  private static _selectedIndex: number = 0;

  /** Custom class applied to tab group container */
  @Input() customClass = '';

  /** Tab index to be selected */
  @Input()
  get selectedIndex(): number {
    return AppTabGroupComponent._selectedIndex;
  }
  set selectedIndex(value: number) {
    const index = coerceNumberProperty(value, 0);

    if (index !== AppTabGroupComponent._selectedIndex) {
      // Check if tab is disabled
      if (this.tabs) {
        const tab = this.tabs.toArray()[index];
        if (tab && tab.disabled) {
          return;
        }
      }
      AppTabGroupComponent._selectedIndex = value;
      this.centerCurrentlySelected(index);
    }
  }

  get selectedTab(): TabComponent {
    return this.tabs.toArray()[this.selectedIndex];
  }

  private _draggable: boolean = false;

  /** Allows tab to be draggable */
  @Input() set draggable(value: boolean) {
    this._draggable = coerceBooleanProperty(value);
  }
  get draggable() { return this._draggable; }

  /** Toggle  */
  private _toggle: boolean = false;
  @Input() set toggle(value: boolean) {
    this._toggle = coerceBooleanProperty(value);
  }
  get toggle() { return this._toggle; }

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    if (this.toggle) {
      this.selectedIndex = -1;
    }

    this.centerCurrentlySelected(this.selectedIndex);
  }

  /** Centers selected tab in a row when scroll is needed/visible
   *  @param {number}  index - index of the tab to be centered
   */
  centerCurrentlySelected(index: number) {
    if (index === -1 || !this.buttonTabs || !this.tabs.toArray()[index]) {
      return;
    }

    const tabs = this.buttonTabs.toArray();
    const elementCenter = tabs[index].nativeElement.offsetWidth / 2;
    const containerCenter = this.container.nativeElement.offsetWidth / 2;
    this.container.nativeElement.scrollTo({
      left: tabs[index].nativeElement.offsetLeft + (elementCenter - containerCenter),
      behavior: 'smooth'
    });
  }

  /** Sets clicked tab as selected
   * @param {number} index - index of clicked tab
   */
  public clickTab(index: number) {
    if (this.toggle && index === this.selectedIndex) {
      this.selectedIndex = -1;
    } else {
      this.selectedIndex = index;
      this.selectedIndexChange.emit(index);
    }
  }

  /** Handles drop event on tab
   * @param {CdkDragDrop<string[]>} event
   */
  drop(event: CdkDragDrop<string[]>) {
    const tabs = this.tabs.toArray();
    moveItemInArray(tabs, event.previousIndex, event.currentIndex);
    this.tabs.reset(tabs);
    this.cdr.detectChanges();
    this.selectedIndex = event.currentIndex;
    this.orderTabsChange.emit({
      event,
      tabs
    });
  }
}
