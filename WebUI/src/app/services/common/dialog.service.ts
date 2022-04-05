import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ModalDialogComponent } from '../../shared/modal-dialog/modal-dialog.component';
import * as _ from 'lodash';
import { AuthService } from '../../services/auth/auth.service';
import { ModalService, MsiModalRef } from '@msi/cobalt';

@Injectable({
    providedIn: 'root'
})
export class DialogService {
    private static modalDialogRefs: { [key: string]: MsiModalRef }  = {};

    private static modalDialogWindows: Subject<{ dialogId: string, title?: string, action: 'open'|'close' }> = new Subject();
    // public static dialogWindows: Observable<{ dialogId: string, title?: string, action: 'open'|'close' }>
    //                             = DialogService.modalDialogWindows.asObservable();


    public static closeAllDialogs(): void {
        if (DialogService.modalDialogRefs !== undefined && DialogService.modalDialogRefs !== null) {
            for (const dialogId of Object.keys(DialogService.modalDialogRefs)) {
                const dialogRef = DialogService.modalDialogRefs[dialogId];
                // (<ModalDialogComponent>dialogRef.close();
                // (<ModalDialogComponent>dialogRef.content).modalWindowClosed.unsubscribe();
                // (<ModalDialogComponent>dialogRef.content).ngOnDestroy();
            }

            DialogService.modalDialogRefs = {};
        }
    }

    constructor(private modalService: ModalService,
                private authService: AuthService) {
    }

    showDialog(title: string, component: any, id: any, data: any,
                            className: string = 'modal-xl'): Observable<any> {
        if (!this.authService.isLoggedIn()) {
            return null;
        }

        let modalDialog = DialogService.modalDialogRefs[`${component.name}_${id.toString()}`];
        if (modalDialog !== undefined) {
            // DialogService.switchToDialog(`${component.name}_${id.toString()}`);
            //return (<ModalDialogComponent>modalDialog.content).dialogClosed;
            return modalDialog.afterClosed();
        }

        const dialogData: any = {
            title: title,
            component: component,
            data: data,
            dialogId: id
        };

        // if (DialogService.frontDialog !== null) {
        //     $(DialogService.frontDialog.dialog).removeClass('modal-front');
        //     DialogService.frontDialog = null;
        // }

        modalDialog = this.modalService.open(ModalDialogComponent,
                { hasBackdrop: true  });
                //keyboard: false, class: className, initialState: dialogData

            modalDialog.afterClosed().subscribe((dialogId: string) => {
            if (!DialogService.modalDialogWindows.isStopped && !DialogService.modalDialogWindows.closed) {
                DialogService.modalDialogWindows.next({ dialogId: dialogId, action: 'close' });
            }

            if (DialogService.modalDialogRefs !== undefined &&
                    DialogService.modalDialogRefs[`${component.name}_${id.toString()}`] !== undefined) {
                delete DialogService.modalDialogRefs[dialogId];
            }
        });

        if (DialogService.modalDialogRefs[`${component.name}_${id.toString()}`] === undefined) {
            DialogService.modalDialogRefs[`${component.name}_${id.toString()}`] = modalDialog;

            if (!DialogService.modalDialogWindows.isStopped && !DialogService.modalDialogWindows.closed) {
                DialogService.modalDialogWindows.next({ title: title,
                                                dialogId: `${component.name}_${id.toString()}`,
                                                action: 'open' });
            }
        }

        //return (<ModalDialogComponent>modalDialog.content).dialogClosed;
        return modalDialog.afterClosed();
    }
}
