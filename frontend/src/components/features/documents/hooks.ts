import { useState } from "react";
import type { Folder, Document } from "../../../types/document";

// ---------------------------------------------------------------------------
// useFolderNavigation
// ---------------------------------------------------------------------------
export interface FolderNavigationState {
  currentFolder: number | null;
  folderPath: Folder[];
  navigateToFolder: (folder: Folder | null) => void;
  navigateToBreadcrumb: (index: number) => void;
}

export function useFolderNavigation(): FolderNavigationState {
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [folderPath, setFolderPath] = useState<Folder[]>([]);

  const navigateToFolder = (folder: Folder | null) => {
    if (folder) {
      setCurrentFolder(folder.id);
      setFolderPath((prev) => [...prev, folder]);
    } else {
      setCurrentFolder(null);
      setFolderPath([]);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index < 0) {
      setCurrentFolder(null);
      setFolderPath([]);
    } else {
      setCurrentFolder(folderPath[index].id);
      setFolderPath((prev) => prev.slice(0, index + 1));
    }
  };

  return { currentFolder, folderPath, navigateToFolder, navigateToBreadcrumb };
}

// ---------------------------------------------------------------------------
// useDocumentForm
// ---------------------------------------------------------------------------
export interface DocFormState {
  title: string;
  content: string;
}

export interface DocumentFormState {
  showDocForm: boolean;
  docForm: DocFormState;
  editingDocId: number | null;
  openCreate: () => void;
  startEdit: (doc: Document) => void;
  cancel: () => void;
  setDocForm: React.Dispatch<React.SetStateAction<DocFormState>>;
}

export function useDocumentForm(): DocumentFormState {
  const [showDocForm, setShowDocForm] = useState(false);
  const [docForm, setDocForm] = useState<DocFormState>({ title: "", content: "" });
  const [editingDocId, setEditingDocId] = useState<number | null>(null);

  const openCreate = () => {
    setEditingDocId(null);
    setDocForm({ title: "", content: "" });
    setShowDocForm(true);
  };

  const startEdit = (doc: Document) => {
    setEditingDocId(doc.id);
    setDocForm({ title: doc.title, content: doc.content });
    setShowDocForm(true);
  };

  const cancel = () => {
    setShowDocForm(false);
    setEditingDocId(null);
    setDocForm({ title: "", content: "" });
  };

  return { showDocForm, docForm, editingDocId, openCreate, startEdit, cancel, setDocForm };
}

// ---------------------------------------------------------------------------
// useFolderInput
// ---------------------------------------------------------------------------
export interface FolderInputState {
  showFolderInput: boolean;
  newFolderName: string;
  openInput: () => void;
  closeInput: () => void;
  setNewFolderName: React.Dispatch<React.SetStateAction<string>>;
}

export function useFolderInput(): FolderInputState {
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const openInput = () => {
    setNewFolderName("");
    setShowFolderInput(true);
  };

  const closeInput = () => {
    setShowFolderInput(false);
    setNewFolderName("");
  };

  return { showFolderInput, newFolderName, openInput, closeInput, setNewFolderName };
}
