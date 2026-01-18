import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useAppData } from '../../contexts/AppDataContext';
import useAccessibility from '../../hooks/useAccessibility';

// --- Ultra-Prism Local Icons ---
const IconPlus = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
const IconImage = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
);
const IconCheck = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const IconX = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

const ManualMedicineEntry = ({ onCancel, onSuccess }) => {
    const { actions } = useAppData();
    const { speak } = useAccessibility();
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        dosage: '',
        frequency: '',
        expiryDate: '',
        activeIngredients: '',
        usage: '',
        manufacturer: ''
    });
    const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                speak('Medicine photo added.');
            };
            reader.readAsDataURL(file);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API delay
        setTimeout(() => {
            const newMedicine = {
                id: Date.now(),
                ...formData,
                activeIngredients: formData.activeIngredients.split(',').map(i => i.trim()),
                image: image // In real app, this would be a URL from backend
            };

            actions.addMedicine(newMedicine);
            speak(`${newMedicine.name} saved successfully.`);
            setIsSubmitting(false);
            onSuccess?.();
        }, 1000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="max-w-4xl mx-auto"
        >
            <div className="bg-white rounded-[4rem] shadow-[0_80px_160px_-40px_rgba(79,70,229,0.2)] border border-slate-50 overflow-hidden">
                <div className="bg-[#020617] p-16 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-150"><IconPlus /></div>
                    <h2 className="text-5xl font-black tracking-tighter mb-4 relative z-10">Add Medicine Manually</h2>
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-400 opacity-80 relative z-10">Enter medication details below</p>
                </div>

                <form onSubmit={handleSubmit} className="p-16 space-y-12">
                    {/* Image Upload Hub */}
                    <div className="space-y-6">
                        <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest pl-2">Medicine Image</span>
                        <div
                            {...getRootProps()}
                            className={`relative h-64 rounded-[3rem] border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-slate-50 hover:border-indigo-200'
                                }`}
                        >
                            <input {...getInputProps()} />
                            {image ? (
                                <>
                                    <img src={image} alt="Preview" className="w-full h-full object-cover opacity-60" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/40 text-white font-black uppercase tracking-widest text-xs">
                                        Update Image
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-sm">
                                        <IconImage />
                                    </div>
                                    <p className="text-xl font-black text-slate-400">Add Medicine Image</p>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Drag image or click to browse</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Fields Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {[
                            { label: 'Medicine Name', name: 'name', placeholder: 'e.g., Paracetamol' },
                            { label: 'Category', name: 'category', placeholder: 'e.g., Pain Relief' },
                            { label: 'Dosage', name: 'dosage', placeholder: 'e.g., 500mg' },
                            { label: 'Frequency', name: 'frequency', placeholder: 'e.g., 4 times a day' },
                            { label: 'Expiry Date', name: 'expiryDate', type: 'date' },
                            { label: 'Manufacturer', name: 'manufacturer', placeholder: 'e.g., GSK' }
                        ].map((field, i) => (
                            <div key={i} className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">{field.label}</label>
                                <input
                                    required
                                    type={field.type || 'text'}
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    className="w-full px-10 py-6 bg-slate-50 border-2 border-slate-50 rounded-[2.5rem] focus:bg-white focus:border-indigo-100 outline-none font-black text-slate-800 placeholder:text-slate-300 transition-all text-lg"
                                />
                            </div>
                        ))}
                        <div className="md:col-span-2 space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">Active Ingredients (Optional)</label>
                            <input
                                name="activeIngredients"
                                value={formData.activeIngredients}
                                onChange={handleChange}
                                placeholder="e.g., Acetaminophen, Caffeine"
                                className="w-full px-10 py-6 bg-slate-50 border-2 border-slate-50 rounded-[2.5rem] focus:bg-white focus:border-indigo-100 outline-none font-black text-slate-800 placeholder:text-slate-300 transition-all text-lg"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">Usage Instructions</label>
                            <textarea
                                name="usage"
                                value={formData.usage}
                                onChange={handleChange}
                                placeholder="Enter how to use this medicine..."
                                rows="3"
                                className="w-full px-10 py-8 bg-slate-50 border-2 border-slate-50 rounded-[3rem] focus:bg-white focus:border-indigo-100 outline-none font-black text-slate-800 placeholder:text-slate-300 transition-all text-lg resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-6 pt-10">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-12 py-8 bg-slate-100 text-slate-400 rounded-[3rem] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center gap-4"
                        >
                            <IconX /> Cancel
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isSubmitting}
                            className="flex-1 py-8 bg-indigo-600 text-white rounded-[3rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-[0_30px_60px_-15px_rgba(79,70,229,0.4)] hover:bg-indigo-700 transition-all flex items-center justify-center gap-6 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="w-8 h-8 border-4 border-indigo-200 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <><IconCheck /> Save Medicine</>
                            )}
                        </motion.button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default ManualMedicineEntry;
