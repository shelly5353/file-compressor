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
        throw new Error('אנא העלה קובץ PDF');
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const compressedPdf = await PDFDocument.create();
      const pages = await compressedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach((page) => compressedPdf.addPage(page));

      let quality = 0.5;
      if (compressionLevel === 'high') quality = 0.8;
      if (compressionLevel === 'low') quality = 0.2;

      const compressedBytes = await compressedPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });

      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setCompressedFile(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'אירעה שגיאה בעת דחיסת הקובץ');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700/30">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          דוחס PDF חכם
        </h1>
        
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2 text-gray-300">רמת דחיסה:</label>
          <div className="relative">
            <select
              value={compressionLevel}
              onChange={(e) => setCompressionLevel(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white appearance-none hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">איכות נמוכה (קובץ קטן יותר)</option>
              <option value="medium">איכות בינונית (מאוזן)</option>
              <option value="high">איכות גבוהה (קובץ גדול יותר)</option>
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div
          {...getRootProps()}
          className={`relative group border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-600 hover:border-blue-400 hover:bg-gray-700/30'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-300">מעבד את הקובץ...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400 group-hover:text-blue-400 transition-colors">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3-3m3 3V6" />
                  </svg>
                </div>
                <p className="text-gray-300 group-hover:text-white transition-colors">
                  גרור ושחרר קובץ PDF כאן, או לחץ לבחירה
                </p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {compressedFile && !isLoading && (
          <div className="mt-8 text-center">
            <a
              href={compressedFile}
              download="compressed.pdf"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              הורד PDF דחוס
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
