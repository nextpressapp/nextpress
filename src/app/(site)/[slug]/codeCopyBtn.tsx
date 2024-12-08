'use client'
import {useState} from "react";

export const CopyCodeButton = ({ code }: { code: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    };

    return (
        <button
            onClick={handleCopy}
            className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded text-sm"
        >
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
};
