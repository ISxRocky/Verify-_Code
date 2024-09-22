import React, { useState, useRef } from "react";
import axios from "axios";

const VerifyCode = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef([]);
  const [inputErrors, setInputErrors] = useState(Array(6).fill(false));

  // Handle change event and update the single code string
  const handleChange = (e, index) => {
    const value = e.target.value;

    let newCode = code.split(""); // Split the current code string into an array
    newCode[index] = value; // Update the specific digit
    setCode(newCode.join("")); // Join the array back into a string

    // Remove error styling if input is corrected
    let newErrors = [...inputErrors];
    if (value === "" || isNaN(value)) {
      newErrors[index] = true; // Set error if non-numeric or empty
    } else {
      newErrors[index] = false; // Clear error if valid
    }
    setInputErrors(newErrors);

    // Focus the next input if a value is entered
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace event to move to the previous input and clear current input
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newCode = code.split("");

      // Clear the current input
      newCode[index] = "";
      setCode(newCode.join(""));

      // Clear the corresponding input field
      inputRefs.current[index].value = "";

      // Move to the previous field, even if the current input is not empty
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }

      // Remove error styling for the cleared input
      const newErrors = [...inputErrors];
      newErrors[index] = false;
      setInputErrors(newErrors);
    }
  };

  // Handle the paste event to distribute code across inputs
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");

    // Only consider pastes that are numeric and 6 characters or less
    if (!/^\d{1,6}$/.test(paste)) {
      setError("Please paste up to 6 digits.");
      return;
    }

    setError(""); // Clear any previous errors
    const newCode = paste.split("");

    // Update the code state based on the paste value
    setCode((prevCode) => {
      const codeArray = prevCode.split("");
      newCode.forEach((char, index) => {
        codeArray[index] = char;
      });
      return codeArray.join("");
    });

    // Distribute the pasted code across the input fields
    newCode.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });

    // Focus the last relevant input field after pasting
    const lastIndex = Math.min(newCode.length - 1, 5);
    inputRefs.current[lastIndex].focus();
  };

  // Submit code for verification
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear previous error and success messages
    setError("");
    setSuccess("");

    // Client-side validation
    const newErrors = [...inputErrors];
    let hasError = false;

    code.split("").forEach((digit, index) => {
      if (digit === "" || isNaN(digit)) {
        newErrors[index] = true;
        hasError = true;
      } else {
        newErrors[index] = false;
      }
    });

    // If there are errors, set the state and don't submit
    if (hasError || code.length !== 6) {
      setError("Please enter valid 6 digits.");
      setInputErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/verify", {
        code,
      });
      if (response.data.success) {
        setSuccess("Verification successful!");
        setError("");
        setCode(""); // Clear the code on success
        inputRefs.current.forEach((input) => (input.value = "")); // Clear the input fields
        setInputErrors(Array(6).fill(false)); // Clear all error states
      } else {
        setError("Verification failed.");
        setSuccess("");
      }
    } catch (err) {
      setError("Verification error.");
      setSuccess("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-xl font-bold mb-4 text-gray-800">Verify Your Code</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div className="flex space-x-2 mb-4" onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={code[index] || ""} // Get the value of the current digit or an empty string
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
                className={`w-12 h-12 p-2 text-center border rounded-md focus:outline-none focus:ring-2 ${
                  inputErrors[index]
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`} // Apply red border if invalid input
              />
            ))}
        </div>
        <button
          type="submit"
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Submit
        </button>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {success && <p className="mt-4 text-green-500">{success}</p>}
    </div>
  );
};

export default VerifyCode;
