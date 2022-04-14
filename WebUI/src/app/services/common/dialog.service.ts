import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalDialogComponent } from '../../shared/modal-dialog/modal-dialog.component';
import * as _ from 'lodash';
import { AuthService } from '../../services/auth/auth.service';
import { ModalService, ModalSize, MsiModalRef } from '@msi/cobalt';

@Injectable({
    providedIn: 'root'
})
export class DialogService {
    private static modalDialogRefs: { [key: string]: MsiModalRef }  = {};

    static frontDialog: { dialogId: string, dialog: any } = null;

    constructor(private modalService: ModalService,
        private authService: AuthService) {
    }

    public static closeAllDialogs(): void {
        if (DialogService.modalDialogRefs !== undefined && DialogService.modalDialogRefs !== null) {
            for (const dialogId of Object.keys(DialogService.modalDialogRefs)) {
                const dialogRef = DialogService.modalDialogRefs[dialogId];
                dialogRef.close();
            }

            DialogService.modalDialogRefs = {};
        }
    }

    showDialog(title: string, component: any, id: any, data: any,
                size: ModalSize = 'medium'): Observable<any> {

        if (!this.authService.isLoggedIn()) {            
            return null;
        }

        let modalDialog = DialogService.modalDialogRefs[`${component.name}_${id.toString()}`];
        if (modalDialog !== undefined) {
            DialogService.switchToDialog(`${component.name}_${id.toString()}`);
            return modalDialog.afterClosed();
        }

        const dialogData: any = {
            title: title,
            component: component,
            data: data,
            dialogId: id
        };

        if (DialogService.frontDialog !== null) {
            DialogService.frontDialog = null;
        }

        modalDialog = this.modalService.open(ModalDialogComponent,
                                { hasBackdrop: true, disableClose: true, size: size, data: dialogData });
        
        modalDialog.afterClosed().subscribe(() => {
            if (DialogService.modalDialogRefs[`${component.name}_${id.toString()}`] !== undefined) {
                delete DialogService.modalDialogRefs[`${component.name}_${id.toString()}`];
            }

            if (DialogService.frontDialog !== null && DialogService.frontDialog.dialogId === `${component.name}_${id.toString()}`) {
                DialogService.frontDialog = null;
            }                    
        });
        
        if (DialogService.modalDialogRefs[`${component.name}_${id.toString()}`] === undefined) {
            DialogService.modalDialogRefs[`${component.name}_${id.toString()}`] = modalDialog;
        }

        DialogService.frontDialog = { dialogId: `${component.name}_${id.toString()}`, dialog: modalDialog };

        return modalDialog.afterClosed();
    }

    private static switchToDialog (dialogId: string): void {
        if (dialogId === '') {
            return;
        }

        if (DialogService.frontDialog !== null) {
            if (DialogService.frontDialog.dialogId !== dialogId) {
                // $(DialogService.frontDialog.dialog).removeClass('modal-front');
            } else {
                return;
            }
        }

        const modalDialog = DialogService.modalDialogRefs[dialogId];
        // const modalDialog = $(DialogService.modalDialogRefs[dialogId].content.viewContainer.element
        //                              .nativeElement.parentElement).parents('.modal');
        // $(modalDialog).addClass('modal-front');
        DialogService.frontDialog = { dialogId: dialogId, dialog: modalDialog };
    }        
}
