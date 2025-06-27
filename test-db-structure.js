// Teste temporário para verificar estrutura da tabela oficinas
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testDBStructure() {
  try {
    // Tentar buscar uma oficina para ver as colunas disponíveis
    const { data, error } = await supabase
      .from('oficinas')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Erro:', error);
    } else {
      console.log('Estrutura da tabela oficinas:');
      if (data && data.length > 0) {
        console.log('Colunas disponíveis:', Object.keys(data[0]));
      } else {
        console.log('Tabela vazia, vamos tentar inserir um teste para ver as colunas aceitas');
      }
    }

    // Verificar buckets de storage
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('Erro ao listar buckets:', bucketsError);
    } else {
      console.log('Buckets disponíveis:', buckets.map(b => b.name));
    }

  } catch (err) {
    console.error('Erro geral:', err);
  }
}

testDBStructure();
