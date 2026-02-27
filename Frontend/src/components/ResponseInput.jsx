import React, { useState, useCallback } from "react";

function ResponseInput() {
    const [response, setResponse] = useState("");

    const handleSend = useCallback(() => {
        console.log("Doctor response:", response);
        setResponse("");
    }, [response]);

    return (
        <div className="response-input">
            <h3>Doctor Response</h3>
            <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response..."
            />
            <button onClick={handleSend}>Send</button>
        </div>
    );
}

export default ResponseInput;
