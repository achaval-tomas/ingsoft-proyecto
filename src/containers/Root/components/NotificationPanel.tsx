function NotificationPanel() {
    return (
        <div className="m-4 gap-4 flex flex-col">
            <div className="flex flex-row rounded-lg w-96 shadow shadow-black bg-red-600">
                <p className="grow ps-4 py-4">Ocurrió un error de red.</p>
                <div className="flex p-4 cursor-pointer hover:bg-white/5 items-center">
                    <div className="material-symbols-outlined">close</div>
                </div>
            </div>
            <div className="flex flex-row rounded-lg w-96 shadow shadow-black bg-yellow-600">
                <p className="grow ps-4 py-4">Ocurrió un error de red. qdwoijd oqw joqwd qiouw dhioqw ioq iq quw gduiq uiqg duqi guiqw gdyu</p>
                <div className="flex p-4 cursor-pointer hover:bg-white/5 items-center">
                    <div className="material-symbols-outlined">close</div>
                </div>
            </div>
            <div className="flex flex-row rounded-lg w-96 shadow shadow-black bg-green-600">
                <p className="grow ps-4 py-4">Ocurrió un error de red.</p>
                <div className="flex p-4 cursor-pointer hover:bg-white/5 items-center">
                    <div className="material-symbols-outlined">close</div>
                </div>
            </div>
        </div>
    );
}

export default NotificationPanel;