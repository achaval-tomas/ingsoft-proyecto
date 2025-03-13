import { useState } from "react";
import { DialogTitle } from "@headlessui/react";
import Field from "../../../components/Field";
import FilledButton from "../../../components/FilledButton";
import OutlinedButton from "../../../components/OutlinedButton";
import Dialog from "../../../components/Dialog";

type EnterPasswordFormProps = {
    lobbyName: string;
    onCancel: () => void;
    onSubmit: (password: string) => void;
    isOpen: boolean;
}

function EnterPasswordForm({ lobbyName, onCancel, onSubmit }: EnterPasswordFormProps) {
    const [password, setPassword] = useState("");

    return (
        <form className="flex flex-col rounded gap-y-3" onSubmit={e => { e.preventDefault(); onSubmit(password); }}>
            <DialogTitle className="font-bold text-lg">Ingrese la contraseña para unirse a {lobbyName}</DialogTitle>
            <Field
                label="Contraseña"
                type="password"
                placeholder="Ingrese la contraseña"
                value={password}
                onChange={setPassword}
            />
            <div className="flex mt-4 gap-4">
                <OutlinedButton
                    className="flex-1"
                    onClick={onCancel}
                >
                    <p>Cancelar</p>
                </OutlinedButton>
                <FilledButton
                    type="submit"
                    className="flex-1"
                >
                    Unirse
                </FilledButton>
            </div>
        </form>
    );
}

function EnterPasswordDialog(props: EnterPasswordFormProps) {
    return (
        <Dialog isOpen={props.isOpen} onClose={props.onCancel}>
            <EnterPasswordForm {...props} />
        </Dialog>
    );
}

export default EnterPasswordDialog;
