'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';

export default function Home() {
  const [compressedFile, setCompressedFile] = useState<string | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<string>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const file = acceptedFiles[0];
      
      if (!file.type.includes('pdf')) {
        throw new Error('Please upload a PDF file');
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Create a new document to store the compressed version
      const compressedPdf = await PDFDocument.create();
      
      // Copy all pages from the original document
      const pages = await compressedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach((page) => compressedPdf.addPage(page));

      // Set compression level
      let quality = 0.5; // medium by default
      if (compressionLevel === 'high') quality = 0.8;
      if (compressionLevel === 'low') quality = 0.2;

      // Save with compression
      const compressedBytes = await compressedPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });

      // Create download URL
      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setCompressedFile(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while compressing the file');
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">PDF Compressor</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Compression Level:</label>
          <select
            value={compressionLevel}
            onChange={(e) => setCompressionLevel(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          >
            <option value="low">Low Quality (Smaller Size)</option>
            <option value="medium">Medium Quality (Balanced)</option>
            <option value="high">High Quality (Larger Size)</option>
          </select>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} />
          {isLoading ? (
            <p>Processing...</p>
          ) : (
            <p>Drag & drop a PDF file here, or click to select one</p>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {compressedFile && !isLoading && (
          <div className="mt-6 text-center">
            <a
              href={compressedFile}
              download="compressed.pdf"
              className="inline-block px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download Compressed PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
