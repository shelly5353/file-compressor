'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';

type CompressionSettings = {
  quality: number;
  useObjectStreams: boolean;
  addDefaultPage: boolean;
  objectsPerTick: number;
};

const compressionPresets: Record<string, { settings: CompressionSettings; description: string }> = {
  maximum: {
    settings: {
      quality: 0.2,
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 100
    },
    description: 'דחיסה מקסימלית - מתאים למסמכים טקסט, איכות תמונות נמוכה'
  },
  balanced: {
    settings: {
      quality: 0.5,
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50
    },
    description: 'דחיסה מאוזנת - מתאים לרוב המסמכים'
  },
  minimal: {
    settings: {
      quality: 0.8,
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 25
    },
    description: 'דחיסה מינימלית - מתאים למסמכים עם תמונות איכותיות'
  },
  custom: {
    settings: {
      quality: 0.5,
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50
    },
    description: 'הגדרות מותאמות אישית'
  }
};

export default function Home() {
  const [compressedFile, setCompressedFile] = useState<string | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<string>('balanced');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customSettings, setCustomSettings] = useState(compressionPresets.custom.settings);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

      const settings = compressionLevel === 'custom' 
        ? customSettings 
        : compressionPresets[compressionLevel].settings;

      const compressedBytes = await compressedPdf.save(settings);

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
        
        <div className="mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">פרופיל דחיסה:</label>
            <div className="relative">
              <select
                value={compressionLevel}
                onChange={(e) => setCompressionLevel(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white appearance-none hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="maximum">דחיסה מקסימלית</option>
                <option value="balanced">דחיסה מאוזנת</option>
                <option value="minimal">דחיסה מינימלית</option>
                <option value="custom">הגדרות מותאמות אישית</option>
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              {compressionPresets[compressionLevel].description}
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2"
            >
              <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showAdvanced ? 'הסתר הגדרות מתקדמות' : 'הצג הגדרות מתקדמות'}
            </button>
          </div>

          {showAdvanced && compressionLevel === 'custom' && (
            <div className="space-y-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">איכות תמונה:</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={customSettings.quality}
                  onChange={(e) => setCustomSettings({
                    ...customSettings,
                    quality: parseFloat(e.target.value)
                  })}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>דחיסה מקסימלית</span>
                  <span>איכות מקסימלית</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">מהירות עיבוד:</label>
                <select
                  value={customSettings.objectsPerTick}
                  onChange={(e) => setCustomSettings({
                    ...customSettings,
                    objectsPerTick: parseInt(e.target.value)
                  })}
                  className="w-full p-2 rounded bg-gray-600 border border-gray-500 text-white"
                >
                  <option value="25">איטי (זיכרון נמוך)</option>
                  <option value="50">מאוזן</option>
                  <option value="100">מהיר (זיכרון גבוה)</option>
                </select>
              </div>
            </div>
          )}
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
