import React, { memo } from "react";

const SignOutput = memo(({ recognizedSign = "Waiting for input..." }) => (
    <div className="sign-output">
        <h3>Recognized Sign</h3>
        <p>{recognizedSign}</p>
    </div>
));

export default SignOutput;
