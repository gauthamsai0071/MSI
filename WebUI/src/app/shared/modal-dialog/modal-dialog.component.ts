import { Component, ViewChild, ViewContainerRef, ComponentRef,
         OnInit, OnDestroy, ComponentFactoryResolver, EventEmitter, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
    templateUrl: './modal-dialog.component.html',
    styleUrls: [
        './modal-dialog.component.scss'
    ]
})
export class ModalDialogComponent implements OnInit, OnDestroy {
    @ViewChild('component', { read: ViewContainerRef })
    viewContainer: ViewContainerRef;

    @ViewChild('ref') modalRef: any;

    title: string;
    component: any;
    data: any;

    modalWindowClosed: Subject<any>;
    dialogClosed: Subject<any>;

    dialogId: any;

    componentRef: ComponentRef<any>;

    constructor(private resolver: ComponentFactoryResolver,
                private elementRef: ElementRef) {
        this.dialogClosed = new Subject<any>();
        this.modalWindowClosed = new Subject<any>();
    }

    ngOnInit() {
        const factory =  this.resolver.resolveComponentFactory(this.component);
        this.componentRef = this.viewContainer.createComponent(factory);
        this.componentRef.instance.popupParam = this.data;
        this.componentRef.instance.popupResult = new EventEmitter<any>();

        (<EventEmitter<any>>this.componentRef.instance.popupResult).subscribe((result) => {
            (<EventEmitter<any>>this.componentRef.instance.popupResult).unsubscribe();
            this.modalRef.close();

            if (!this.dialogClosed.isStopped && !this.dialogClosed.closed) {
                this.dialogClosed.next(result);
            }
        });
    }

    public ngOnDestroy(): void {
        if (!this.modalWindowClosed.isStopped && !this.modalWindowClosed.closed) {
            this.modalWindowClosed.next(`${this.componentRef.componentType.name}_${this.dialogId}`);
        }

        if (!(<EventEmitter<any>>this.componentRef.instance.popupResult).isStopped) {
            (<EventEmitter<any>>this.componentRef.instance.popupResult).unsubscribe();
        }

        if (this.componentRef) {
            this.componentRef.destroy();
        }

        const modal = $(this.elementRef.nativeElement).parents('.modal');
        $($(modal).parent().children('.modal-backdrop')).remove();
        $(modal).remove();
    }
}
