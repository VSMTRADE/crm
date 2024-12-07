import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import { Document } from '../../types';

interface DocumentsState {
  documents: Document[];
  loading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  documents: [],
  loading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async () => {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        employee:employees (
          id,
          first_name,
          last_name
        )
      `);

    if (error) throw error;
    return data as Document[];
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (document: Document) => {
    // First delete the file from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([document.file_path]);

    if (storageError) throw storageError;

    // Then delete the document record
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', document.id);

    if (dbError) throw dbError;

    return document.id;
  }
);

export const getDocumentUrl = async (filePath: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 3600); // URL valid for 1 hour

  if (error) throw error;
  return data.signedUrl;
};

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch documents';
      })
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete document';
      });
  },
});

export default documentsSlice.reducer;
