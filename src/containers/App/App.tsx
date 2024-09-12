import { useState } from "react";
import AppLayout from "./components/AppLayout";

function App() {
    const [count, setCount] = useState(0);

    return (
        <AppLayout
            count={count}
            onClickButton={() => setCount(count => count + 1)}
        />
    );
}

export default App;
