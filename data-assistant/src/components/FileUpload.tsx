import { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FileUpload() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const processFile = async (selectedFile: File) => {
        setFile(selectedFile);
        setStatus('uploading');
        setMessage('');

        const fileType = selectedFile.type;
        const isCsv = fileType === 'text/csv' || selectedFile.name.endsWith('.csv');
        const isPdf = fileType === 'application/pdf' || selectedFile.name.endsWith('.pdf');

        if (!isCsv && !isPdf) {
            setStatus('error');
            setMessage('Only CSV and PDF files are supported.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            if (isCsv) {
                await axios.post('http://localhost:8080/api/files/upload-csv', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else if (isPdf) {
                await axios.post('http://localhost:8080/api/rag/upload-document', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            setStatus('success');
            setMessage('uploaded successfully');
        } catch (error) {
            console.error('Upload error', error);
            setStatus('error');
            setMessage('Failed to upload the document. Please try again.');
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const resetUpload = () => {
        setFile(null);
        setStatus('idle');
        setMessage('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto p-6 bg-card rounded-2xl border shadow-sm flex flex-col items-center">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Upload Data</h2>
                <p className="text-muted-foreground mt-2">Upload your PDF documents or CSV files to get started.</p>
            </div>

            <div
                className={cn(
                    "w-full rounded-xl border-2 border-dashed p-10 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer text-center",
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
                    status === 'success' && "border-green-500/50 bg-green-500/5",
                    status === 'error' && "border-destructive/50 bg-destructive/5"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => status !== 'uploading' && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv,.pdf,application/pdf,text/csv"
                    className="hidden"
                />

                {status === 'idle' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <UploadCloud className="w-8 h-8 text-primary" />
                        </div>
                        <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
                        <p className="text-sm text-muted-foreground mt-1">PDF or CSV (max 10MB)</p>
                    </>
                )}

                {status === 'uploading' && (
                    <>
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="font-medium text-foreground">Uploading {file?.name}...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="font-semibold text-green-700 dark:text-green-400">{message}</p>
                        <p className="text-sm text-muted-foreground mt-1">{file?.name}</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                            className="mt-4 text-sm font-medium text-primary hover:underline"
                        >
                            Upload another file
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-destructive" />
                        </div>
                        <p className="font-semibold text-destructive">{message}</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                            className="mt-4 text-sm font-medium text-primary hover:underline"
                        >
                            Try again
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
