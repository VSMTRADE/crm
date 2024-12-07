import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { databaseService, Product, Category } from '../../services/database';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

const validationSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string(),
  price: yup
    .number()
    .required('Preço é obrigatório')
    .min(0, 'Preço deve ser maior que 0'),
  stock: yup
    .number()
    .required('Estoque é obrigatório')
    .min(0, 'Estoque deve ser maior ou igual a 0'),
  category_id: yup.string(),
});

export default function ProductForm({ open, onClose, product }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await databaseService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      category_id: product?.category_id || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (product) {
          // Update product
          await databaseService.updateProduct(product.id, values);
        } else {
          // Create new product
          await databaseService.createProduct(values);
        }
        onClose();
      } catch (error) {
        console.error('Error saving product:', error);
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {product ? 'Editar Produto' : 'Novo Produto'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="name"
                label="Nome"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="Descrição"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="price"
                label="Preço"
                type="number"
                value={formik.values.price}
                onChange={formik.handleChange}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="stock"
                label="Estoque"
                type="number"
                value={formik.values.stock}
                onChange={formik.handleChange}
                error={formik.touched.stock && Boolean(formik.errors.stock)}
                helperText={formik.touched.stock && formik.errors.stock}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                name="category_id"
                label="Categoria"
                value={formik.values.category_id}
                onChange={formik.handleChange}
                error={formik.touched.category_id && Boolean(formik.errors.category_id)}
                helperText={formik.touched.category_id && formik.errors.category_id}
              >
                <MenuItem value="">
                  <em>Nenhuma</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            {product ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
