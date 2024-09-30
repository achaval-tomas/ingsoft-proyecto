import { useState } from "react";
import { DialogTitle } from "@headlessui/react";
import Field from "../../../components/Field";
import FilledButton from "../../../components/FilledButton";
import OutlinedButton from "../../../components/OutlinedButton";
import Dialog from "../../../components/Dialog";

export interface CreateLobbyFormState {
    name: string;
    maxPlayers: number;
    password: string;
}

type CreateLobbyFormProps = {
    lobbyNamePlaceholder: string;
    onCancel: () => void;
    onSubmit: (state: CreateLobbyFormState) => void;
}

type CreateLobbyDialogProps = CreateLobbyFormProps & {
    isOpen: boolean;
}

function CreateLobbyForm({ lobbyNamePlaceholder, onCancel, onSubmit }: CreateLobbyFormProps) {
    const [formState, setFormState] = useState<CreateLobbyFormState>({
        name: "",
        maxPlayers: 4,
        password: "",
    });

    return (
        <form className="flex flex-col rounded gap-y-3" onSubmit={e => { e.preventDefault(); onSubmit(formState); }}>
            <DialogTitle className="font-bold text-lg">Crear sala</DialogTitle>
            <Field
                label="Nombre de la sala"
                placeholder={lobbyNamePlaceholder}
                value={formState.name}
                onChange={name => setFormState({ ...formState, name })}
                inputTestId="lobby-name"
            />
            <Field
                label="Límite de jugadores"
                type="number"
                min={2}
                max={4}
                value={formState.maxPlayers.toString()}
                onChange={maxPlayers => setFormState({ ...formState, maxPlayers: parseInt(maxPlayers) })}
                inputTestId="lobby-max-players"
            />
            <Field
                label="Contraseña"
                type="password"
                placeholder="Pública"
                value={formState.password}
                onChange={password => setFormState({ ...formState, password })}
                inputTestId="lobby-password"
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
                    testId="lobby-btn-create"
                >
                    Crear
                </FilledButton>
            </div>
        </form>
    );
}

function CreateLobbyDialog(props: CreateLobbyDialogProps) {
    return (
        <Dialog isOpen={props.isOpen} onClose={props.onCancel}>
            <CreateLobbyForm
                {...props}
            />
        </Dialog>
    );
}

export default CreateLobbyDialog;
