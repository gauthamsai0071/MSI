import { Component, ViewChild, ViewContainerRef, ComponentRef,
         OnDestroy, ComponentFactoryResolver, EventEmitter, ElementRef, Inject, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ModalSize, MsiModalRef, MSI_MODAL_DATA } from '@msi/cobalt';

@Component({
    templateUrl: './modal-dialog.component.html',
    styleUrls: [
        './modal-dialog.component.scss'
    ]
})
export class ModalDialogComponent implements AfterViewInit, OnDestroy {
    @ViewChild('component', { read: ViewContainerRef})
    viewContainer: ViewContainerRef;

    title: string;
    public component: any;
    data: any;
    result?: any;

    dialogId: any;

    componentRef: ComponentRef<any>;

    constructor(private resolver: ComponentFactoryResolver,
                private modalRef: MsiModalRef,
                private elementRef: ElementRef,
                @Inject(MSI_MODAL_DATA) private dialogData: any,
                private changeDetectorRef: ChangeDetectorRef) {
        this.title = this.dialogData.title;
        this.component = this.dialogData.component;
        this.data = this.dialogData.data;
        this.result = null;
    }

    ngAfterViewInit(): void {
        const factory =  this.resolver.resolveComponentFactory(this.component);
        this.componentRef = this.viewContainer.createComponent(factory);
        this.componentRef.instance.popupParam = this.data;
        this.componentRef.instance.popupResult = new EventEmitter<any>();

        (<EventEmitter<any>>this.componentRef.instance.popupResult).subscribe((result?: any) => {
            (<EventEmitter<any>>this.componentRef.instance.popupResult).unsubscribe();
            this.result = result;  
            this.modalRef.close(result);            
        });

        this.changeDetectorRef.detectChanges();
    }

    public ngOnDestroy(): void {
        if (this.componentRef && this.componentRef.instance && !(<EventEmitter<any>>this.componentRef.instance.popupResult).isStopped) {
            (<EventEmitter<any>>this.componentRef.instance.popupResult).unsubscribe();
        }

        if (this.componentRef) {
            this.componentRef.destroy();
        }

        this.modalRef.close(this.result);
    }

    close(): void {
        this.modalRef.close(null);
    }
}
