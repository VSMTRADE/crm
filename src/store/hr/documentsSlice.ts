import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';

export interface Document {
  id: string;
  employee_id: string;
  title: string;
  type: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  description?: string;
  expiry_date?: string;
  created_at?: string;
  updated_at?: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

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

// Fetch all documents
export const fetchDocuments = createAsyncThunk(
  'documents/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          employee:employees (
            id,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Upload document
export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async ({ 
    file, 
    employeeId, 
    title, 
    type, 
    description, 
    expiryDate 
  }: { 
    file: File; 
    employeeId: string; 
    title: string; 
    type: string; 
    description?: string; 
    expiryDate?: string; 
  }, { rejectWithValue }) => {
    try {
      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${employeeId}/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Create document record
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          employee_id: employeeId,
          title,
          type,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          description,
          expiry_date: expiryDate,
        }])
        .select(`
          *,
          employee:employees (
            id,
            first_name,
            last_name
          )
        `)
        .single();

      if (error) {
        // If record creation fails, delete the uploaded file
        await supabase.storage.from('documents').remove([filePath]);
        throw error;
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete document
export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async (document: Document, { rejectWithValue }) => {
    try {
      // 1. Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // 2. Delete document record
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      return document.id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Download document
export const getDocumentUrl = async (filePath: string): Promise<string> => {
  const { data } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 3600); // URL valid for 1 hour

  if (!data?.signedUrl) {
    throw new Error('Could not generate download URL');
  }

  return data.signedUrl;
};

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch documents
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
        state.error = action.payload as string;
      })
      // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.unshift(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete document
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
        state.error = action.payload as string;
      });
  },
});

export default documentsSlice.reducer;
