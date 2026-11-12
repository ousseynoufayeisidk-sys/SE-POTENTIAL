'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { compressImage } from '@/lib/utils';

interface ProofUploaderProps {
  onUpload: (file: File) => Promise<void>;
  onNoProof: (reason: string) => void;
  hasProof: boolean;
  proofPath?: string;
  noProofReason?: string;
}

export function ProofUploader({
  onUpload,
  onNoProof,
  hasProof,
  proofPath,
  noProofReason,
}: ProofUploaderProps) {
  const [showNoProofForm, setShowNoProofForm] = useState(!!noProofReason);
  const [reason, setReason] = useState(noProofReason || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Compression si c'est une image
      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file, 300);
        const compressedFile = new File([compressed], file.name, { type: 'image/jpeg' });
        await onUpload(compressedFile);
      } else {
        await onUpload(file);
      }
      setShowNoProofForm(false);
      setReason('');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Erreur lors du téléchargement du fichier');
    } finally {
      setUploading(false);
    }
  };

  const handleNoProofSubmit = () => {
    if (reason.trim()) {
      onNoProof(reason);
      setShowNoProofForm(false);
    }
  };

  if (hasProof && proofPath) {
    return (
      <div className="space-y-2">
        <Label>Preuve ajoutée</Label>
        <div className="flex items-center gap-2 p-3 bg-baobab/10 rounded-md border border-baobab/20">
          <Check className="h-4 w-4 text-baobab" />
          <span className="text-sm flex-1">Document joint</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              /* TODO: remove proof */
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (showNoProofForm) {
    return (
      <div className="space-y-3">
        <Label>Pourquoi n'avez-vous pas de preuve pour l'instant ?</Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Exemple : Je n'ai pas encore de factures imprimées, je note mes ventes dans un carnet..."
          rows={3}
        />
        <div className="flex gap-2">
          <Button onClick={handleNoProofSubmit} disabled={!reason.trim()} size="sm">
            Confirmer
          </Button>
          <Button variant="outline" onClick={() => setShowNoProofForm(false)} size="sm">
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label>Preuve (optionnel)</Label>
      <div className="flex flex-col gap-2">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          <Camera className="h-4 w-4 mr-2" />
          {uploading ? 'Envoi en cours...' : 'Prendre une photo'}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Télécharger un fichier
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowNoProofForm(true)}
          className="w-full text-sm"
        >
          Je n'ai pas de preuve pour l'instant
        </Button>
      </div>
      <p className="text-xs text-nuit/60">
        Photos de factures, carnets, captures Wave/Orange Money acceptées
      </p>
    </div>
  );
}
