'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, FileText, CheckCircle2, AlertCircle, 
  ChevronRight, ArrowRight, Table as TableIcon, Loader2 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';

const CSVUploadModal = ({ isOpen, onClose, onRefresh }) => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1); // 1: Upload, 2: Mapping/Preview, 3: Success/Summary
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({
    date: '',
    amount: '',
    category: '',
    description: '',
    type: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const resetState = () => {
    setStep(1);
    setFile(null);
    setParsedData([]);
    setHeaders([]);
    setMapping({ date: '', amount: '', category: '', description: '', type: '' });
    setIsUploading(false);
    setUploadResult(null);
  };

  useEffect(() => {
    if (!isOpen) resetState();
  }, [isOpen]);

  const autoMapHeaders = useCallback((cols) => {
    setMapping(prevMapping => {
      const newMapping = { ...prevMapping };
      cols.forEach(col => {
        const lower = col.toLowerCase().trim();
        if (lower.includes('date') || lower.includes('time') || lower.includes('when')) newMapping.date = col;
        if (lower.includes('amount') || lower.includes('price') || lower.includes('value') || lower.includes('cost')) newMapping.amount = col;
        if (lower.includes('category') || lower.includes('tag') || lower.includes('label')) newMapping.category = col;
        if (lower.includes('description') || lower.includes('note') || lower.includes('memo') || lower.includes('payee')) newMapping.description = col;
        if (lower.includes('type')) newMapping.type = col;
      });
      return newMapping;
    });
  }, []);

  const parseCSV = useCallback((file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setParsedData(results.data);
          const cols = Object.keys(results.data[0]);
          setHeaders(cols);
          autoMapHeaders(cols);
          setStep(2);
        } else {
          toast.error(t('csv_upload.err_empty'));
        }
      },
      error: (err) => {
        toast.error(t('csv_upload.err_parse', { error: err.message }));
      }
    });
  }, [t, autoMapHeaders]);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile && selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      toast.error(t('csv_upload.err_valid_csv'));
    }
  }, [t, parseCSV]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'text/csv': ['.csv'] },
    multiple: false 
  });

  const handleConfirmImport = async () => {
    if (!mapping.date || !mapping.amount) {
      toast.error(t('csv_upload.err_map'));
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const transactions = parsedData.map(row => ({
        date: row[mapping.date],
        amount: row[mapping.amount],
        category: row[mapping.category] || 'General',
        description: row[mapping.description] || '',
        type: row[mapping.type] || 'Expense'
      }));

      const response = await axios.post('/api/upload-expenses', { transactions }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setUploadResult(response.data.summary);
        setStep(3);
        onRefresh();
        toast.success(t('csv_upload.success_msg'));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || t('csv_upload.err_upload'));
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-app-bg/80 backdrop-blur-sm transition-colors"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl bg-app-card border border-app-border rounded-3xl overflow-hidden shadow-2xl glass-panel transition-colors"
      >
        {/* Header */}
        <div className="p-6 border-b border-app-border flex justify-between items-center bg-app-bg/10">
          <div>
            <h2 className="text-xl font-black text-text-main flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              {t('csv_upload.title')}
            </h2>
            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-1">
              {t('csv_upload.step', { step })}: {step === 1 ? t('csv_upload.step1') : step === 2 ? t('csv_upload.step2') : t('csv_upload.step3')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-primary/10 rounded-full transition-all text-text-muted hover:text-primary">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer
                  ${isDragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-app-border hover:border-primary/50 hover:bg-primary/[0.02]'}
                `}
              >
                <input {...getInputProps()} />
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Upload className={`w-10 h-10 ${isDragActive ? 'text-primary animate-bounce' : 'text-primary/50'}`} />
                </div>
                <h3 className="text-lg font-bold text-text-main mb-2">{t('csv_upload.drop_here')}</h3>
                <p className="text-text-muted text-sm max-w-xs mx-auto font-medium">
                  {t('csv_upload.support_info')}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-4 border border-app-border transition-colors">
                  <h4 className="text-[10px] font-black text-text-dim uppercase mb-3 flex items-center gap-2 tracking-widest">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    {t('csv_upload.rec_format')}
                  </h4>
                  <ul className="text-xs text-text-muted space-y-2 italic font-medium">
                    <li>• {t('csv_upload.fmt_date')}</li>
                    <li>• {t('csv_upload.fmt_amt')}</li>
                    <li>• {t('csv_upload.fmt_desc')}</li>
                    <li>• {t('csv_upload.fmt_cat')}</li>
                  </ul>
                </div>
                <div className="glass-panel p-4 border border-app-border transition-colors">
                  <h4 className="text-[10px] font-black text-text-dim uppercase mb-3 flex items-center gap-2 tracking-widest">
                    <AlertCircle className="w-3.5 h-3.5 text-warning" />
                    {t('csv_upload.good_to_know')}
                  </h4>
                  <p className="text-xs text-text-muted italic leading-relaxed font-medium">
                    {t('csv_upload.auto_detect')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Mapping & Preview */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.keys(mapping).map((field) => (
                  <div key={field} className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-text-dim tracking-wider">
                      {field} {['date', 'amount'].includes(field) && <span className="text-error">*</span>}
                    </label>
                    <select 
                      value={mapping[field]}
                      onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                      className="w-full bg-app-bg/50 border border-app-border rounded-xl px-3 py-2 text-xs text-text-main font-bold focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer hover:bg-primary/5"
                    >
                      <option value="">{t('csv_upload.select_col')}</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div className="glass-panel overflow-hidden border border-app-border transition-colors shadow-sm">
                <div className="bg-app-bg/20 px-6 py-3 border-b border-app-border flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-black uppercase tracking-widest text-text-main">{t('csv_upload.preview')}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-app-bg/5 text-text-dim border-b border-app-border uppercase tracking-tighter">
                        <th className="px-6 py-3 font-black">{t('dash.date_col')}</th>
                        <th className="px-6 py-3 font-black">{t('tx.col_desc')}</th>
                        <th className="px-6 py-3 font-black">{t('dash.cat_col')}</th>
                        <th className="px-6 py-3 font-black text-right">{t('dash.amt_col')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border">
                      {parsedData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="text-text-muted hover:bg-primary/[0.02] transition-colors">
                          <td className="px-6 py-4 font-medium">{row[mapping.date] || '-'}</td>
                          <td className="px-6 py-4 truncate max-w-[150px] italic font-medium">{row[mapping.description] || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-black uppercase">
                              {row[mapping.category] || 'General'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-text-main">
                            ₹{parseFloat(row[mapping.amount])?.toLocaleString(language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN') || '0'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl border border-app-border text-text-main font-bold text-sm hover:bg-app-bg/50 transition-all shadow-sm"
                >
                  {t('csv_upload.back')}
                </button>
                <button 
                  onClick={handleConfirmImport}
                  disabled={isUploading || !mapping.date || !mapping.amount}
                  className={`btn-primary px-10 py-3 rounded-xl flex items-center gap-2 font-black shadow-lg shadow-primary/20 transition-all
                    ${(isUploading || !mapping.date || !mapping.amount) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                  `}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('csv_upload.importing')}
                    </>
                  ) : (
                    <>
                      {t('csv_upload.confirm')}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && uploadResult && (
            <div className="text-center py-10 space-y-8">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-12 h-12 text-success" />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-text-main">{t('csv_upload.success_title')}</h3>
                <p className="text-text-muted font-medium">{t('csv_upload.success_desc')}</p>
              </div>

              <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
                <div className="glass-panel p-6 border-t-4 border-success transition-colors">
                  <p className="text-[10px] font-black uppercase text-text-dim mb-1 tracking-widest">{t('csv_upload.added')}</p>
                  <p className="text-3xl font-black text-text-main">{uploadResult.successful}</p>
                </div>
                <div className="glass-panel p-6 border-t-4 border-warning transition-colors">
                  <p className="text-[10px] font-black uppercase text-text-dim mb-1 tracking-widest">{t('csv_upload.duplicates')}</p>
                  <p className="text-3xl font-black text-text-main">{uploadResult.duplicates}</p>
                </div>
                <div className="glass-panel p-6 border-t-4 border-error transition-colors">
                  <p className="text-[10px] font-black uppercase text-text-dim mb-1 tracking-widest">{t('csv_upload.failed')}</p>
                  <p className="text-3xl font-black text-text-main">{uploadResult.failed.length}</p>
                </div>
              </div>

              {uploadResult.failed.length > 0 && (
                <div className="text-left max-w-lg mx-auto bg-error/5 border border-error/20 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-error uppercase mb-2">{t('csv_upload.errors_id')}</p>
                  <ul className="text-[10px] text-text-dim space-y-1 font-medium">
                    {uploadResult.failed.slice(0, 3).map((f, i) => (
                      <li key={i}>• {f.reason} (Row {i+1})</li>
                    ))}
                    {uploadResult.failed.length > 3 && <li>• and {uploadResult.failed.length - 3} more...</li>}
                  </ul>
                </div>
              )}

              <button 
                onClick={onClose}
                className="btn-primary w-full max-w-sm py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 mt-4"
              >
                {t('csv_upload.close_view')}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CSVUploadModal;
