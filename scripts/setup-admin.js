import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hpxizaqzxiodifaijqym.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweGl6YXF6eGlvZGlmYWlqcXltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzQxNzU2MywiZXhwIjoyMDQ4OTkzNTYzfQ.UW4_g_vkyavnwVRE1Zs4QXkyc4-rx1H0X2tHpVkVAkQ';

async function setupAdmin() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Criar usuário admin
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'admin@admin.com',
      password: '123456',
      email_confirm: true,
      user_metadata: {
        name: 'Admin',
        role: 'admin'
      }
    });

    if (userError) throw userError;
    console.log('Usuário admin criado:', userData);

  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  }
}

setupAdmin();
