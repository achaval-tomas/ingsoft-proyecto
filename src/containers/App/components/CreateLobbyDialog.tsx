import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Field from "../../../components/Field";
import Button from "../../../components/Button";

export interface CreateLobbyFormState {
    name: string;
    maxPlayers: number;
    password: string;
}

interface CreateLobbyDialogProps {
    isOpen: boolean;
    onCancel: () => void;
    onSubmit: (state: CreateLobbyFormState) => void;
}

function CreateLobbyDialog({ isOpen, onCancel, onSubmit }: CreateLobbyDialogProps) {
    const [formState, setFormState] = useState<CreateLobbyFormState>({
        name: "",
        maxPlayers: 4,
        password: "",
    });

    return (
        <Dialog className="relative" open={isOpen} onClose={onCancel}>
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                <DialogPanel className="max-w-lg rounded-lg border border-surface-700 bg-surface-800 p-12 min-w-96">
                    <form className="flex flex-col rounded gap-y-3" onSubmit={e => { e.preventDefault(); onSubmit(formState); }}>
                        <DialogTitle className="font-bold text-lg">Crear sala</DialogTitle>
                        <Field
                            label="Nombre de la sala"
                            placeholder="Sala de Mauri"
                            value={formState.name}
                            onChange={name => setFormState({ ...formState, name })}
                        />
                        <Field
                            label="Límite de jugadores"
                            type="number"
                            min={2}
                            max={4}
                            value={formState.maxPlayers.toString()}
                            onChange={maxPlayers => setFormState({ ...formState, maxPlayers: parseInt(maxPlayers) })}
                        />
                        <Field
                            label="Contraseña"
                            type="password"
                            placeholder="Pública"
                            value={formState.password}
                            onChange={password => setFormState({ ...formState, password })}
                        />
                        <div className="flex mt-4 gap-4">
                            <Button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 border border-surface-700 hover:bg-surface-700"
                            >
                                <p>Cancelar</p>
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-primary-600 hover:bg-primary-500"
                            >
                                Crear
                            </Button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export default CreateLobbyDialog;
