import React, { useState, useRef } from 'react';

interface ArmyListUploaderProps {
    onUpload: (html: string, name: string) => void;
    index: number;
    isUploaded?: boolean;
}

const ArmyListUploader: React.FC<ArmyListUploaderProps> = ({ onUpload, index, isUploaded = false }) => {
    const [armyName, setArmyName] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (file: File) => {
        // Extract file name without extension and use it as army name
        const fileName = file.name;
        const nameWithoutExtension = fileName.replace(/\.html$/, '');

        // Only update army name if user hasn't already entered one
        if (!armyName) {
            setArmyName(nameWithoutExtension);
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result && typeof e.target.result === 'string') {
                // Use the file name as the army name if no manual name was entered
                const finalName = armyName || nameWithoutExtension || `Army List ${index + 1}`;
                onUpload(e.target.result, finalName);
            }
        };
        reader.readAsText(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    return (
        <div className="bg-white rounded shadow p-4 relative">
            {/* Upload Status Indicator */}
            {isUploaded && (
                <div className="absolute top-0 right-0 bg-green-100 text-green-800 px-3 py-1 rounded-bl font-medium shadow">
                    ✓ Uploaded
                </div>
            )}

            <h2 className="text-lg font-semibold mb-4">Army List {index + 1}</h2>

            <div className="mb-4">
                <label htmlFor={`armyName${index}`} className="block text-sm font-medium text-gray-700">
                    Army Name
                </label>
                <input
                    type="text"
                    id={`armyName${index}`}
                    value={armyName}
                    onChange={(e) => setArmyName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder={`Army List ${index + 1}`}
                />
            </div>

            <div
                className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${
                    isDragging ? 'border-blue-500 bg-blue-50' : isUploaded ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".html"
                    className="hidden"
                />
                {isUploaded ? (
                    <div className="text-green-600">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mx-auto h-12 w-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <p className="font-medium">Army List Uploaded</p>
                        <p className="mt-1 text-sm">Click to replace</p>
                    </div>
                ) : (
                    <>
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                        >
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium text-blue-600 hover:text-blue-500">
                                Upload an HTML file
                            </span> or drag and drop
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            HTML files only
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ArmyListUploader;