/**
 * Página de Creación de Entregas
 * Formulario para crear nuevas entregas de evidencia y subir adjuntos
 */
import { useState } from 'react';
import { useRequirements, useCreateSubmission, useUploadAttachment } from '../api/client';
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function NewSubmission() {
  const { data: requirements, isLoading: loadingReqs } = useRequirements();
  const createSubmission = useCreateSubmission();
  const uploadAttachment = useUploadAttachment();
  
  const [selectedRequirement, setSelectedRequirement] = useState<number | null>(null);
  const [evidenceDate, setEvidenceDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState<'form' | 'upload' | 'success'>('form');
  const [createdSubmissionId, setCreatedSubmissionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedRequirement) {
      setError('Selecciona un requisito');
      return;
    }

    try {
      const result = await createSubmission.mutateAsync({
        requirement_id: selectedRequirement,
        evidence_date: evidenceDate,
        notes: notes || undefined,
      });
      
      setCreatedSubmissionId(result.id);
      setStep('upload');
    } catch (err: any) {
      setError(err.message || 'Error al crear la entrega');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Validar tipos
      const allowedTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      
      const invalidFiles = newFiles.filter(f => !allowedTypes.includes(f.type));
      if (invalidFiles.length > 0) {
        setError(`Tipo de archivo no permitido: ${invalidFiles[0].name}`);
        return;
      }
      
      // Validar tamaño (10MB)
      const oversized = newFiles.filter(f => f.size > 10 * 1024 * 1024);
      if (oversized.length > 0) {
        setError(`Archivo demasiado grande: ${oversized[0].name} (máx 10MB)`);
        return;
      }
      
      setFiles([...files, ...newFiles]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!createdSubmissionId) return;
    
    setError(null);
    
    try {
      for (const file of files) {
        await uploadAttachment.mutateAsync({
          submissionId: createdSubmissionId,
          file,
        });
      }
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Error al subir archivos');
    }
  };

  const handleSkipUpload = () => {
    setStep('success');
  };

  const handleReset = () => {
    setSelectedRequirement(null);
    setEvidenceDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setFiles([]);
    setStep('form');
    setCreatedSubmissionId(null);
    setError(null);
  };

  if (loadingReqs) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Nueva Entrega de Evidencia</h1>
        <p className="text-slate-500 mt-1">
          {step === 'form' && 'Paso 1: Datos de la entrega'}
          {step === 'upload' && 'Paso 2: Subir archivos adjuntos'}
          {step === 'success' && 'Entrega creada exitosamente'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        <div className={`flex-1 h-2 rounded-full ${step === 'form' ? 'bg-emerald-500' : 'bg-emerald-500'}`} />
        <div className={`flex-1 h-2 rounded-full ${step === 'upload' || step === 'success' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
        <div className={`flex-1 h-2 rounded-full ${step === 'success' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Step 1: Form */}
      {step === 'form' && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Requisito *
            </label>
            <select
              value={selectedRequirement || ''}
              onChange={(e) => setSelectedRequirement(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Selecciona un requisito...</option>
              {requirements?.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.code} - {req.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fecha de Evidencia *
            </label>
            <input
              type="date"
              value={evidenceDate}
              onChange={(e) => setEvidenceDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Descripción de la evidencia, observaciones, etc."
            />
          </div>

          <button
            type="submit"
            disabled={createSubmission.isPending}
            className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {createSubmission.isPending ? 'Creando...' : 'Crear Entrega →'}
          </button>
        </form>
      )}

      {/* Step 2: Upload */}
      {step === 'upload' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Archivos Adjuntos
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-emerald-300 transition-colors">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-2">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-slate-400">
                PDF, PNG, JPG, XLSX, DOCX · Máximo 10MB por archivo
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                accept=".pdf,.png,.jpg,.jpeg,.xlsx,.docx"
              />
              <label
                htmlFor="file-upload"
                className="inline-block mt-3 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 cursor-pointer transition-colors"
              >
                Seleccionar Archivos
              </label>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                {files.length} archivo(s) seleccionado(s)
              </p>
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                  >
                    <X size={16} className="text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSkipUpload}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Omitir
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploadAttachment.isPending}
              className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploadAttachment.isPending ? 'Subiendo...' : `Subir ${files.length} archivo(s)`}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 'success' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-800">
            ¡Entrega Creada Exitosamente!
          </h2>
          <p className="text-slate-600">
            La entrega ha sido registrada y está pendiente de revisión.
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            Crear Otra Entrega
          </button>
        </div>
      )}
    </div>
  );
}
