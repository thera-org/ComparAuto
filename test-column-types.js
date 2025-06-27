// Teste para verificar tipos de colunas do PostgreSQL
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testColumnTypes() {
  try {
    // Consultar informações da tabela
    const { data, error } = await supabase
      .rpc('get_column_info', {
        table_name: 'oficinas'
      })
      .select();
    
    if (error) {
      console.log('RPC não disponível, vamos tentar inserir um teste para ver o erro específico');
      
      // Teste com dados simples
      const testData = {
        nome: 'Teste',
        email: 'teste@teste.com',
        telefone: '11999999999',
        endereco: 'Teste',
        descricao: 'Teste',
        dias_funcionamento: ['Domingo', 'Segunda-feira'],
        servicos_oferecidos: [{ nome: 'Teste', valor: '100' }],
        formas_pagamento: ['Dinheiro', 'Cartão']
      };
      
      const { error: insertError } = await supabase
        .from('oficinas')
        .insert(testData)
        .select();
        
      if (insertError) {
        console.error('Erro ao inserir teste:', insertError);
        console.log('Detalhes:', insertError.details);
        console.log('Hint:', insertError.hint);
        console.log('Message:', insertError.message);
      }
    } else {
      console.log('Informações das colunas:', data);
    }

  } catch (err) {
    console.error('Erro geral:', err);
  }
}

testColumnTypes();
