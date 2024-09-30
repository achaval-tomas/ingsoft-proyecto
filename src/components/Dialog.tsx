import { DialogPanel, Dialog as HUIDialog } from "@headlessui/react";
import React from "react";

export type DialogProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

function Dialog({ isOpen, onClose, children }: DialogProps) {
    return (
        <HUIDialog className="relative" open={isOpen} onClose={onClose}>
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/50">
                <DialogPanel className="max-w-lg rounded-lg border border-border bg-surface p-12 min-w-96">
                    {children}
                </DialogPanel>
            </div>
        </HUIDialog>
    );
}

export default Dialog;
