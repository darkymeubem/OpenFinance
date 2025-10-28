-- ============================================
-- OpenFinance - Schema PostgreSQL para Supabase
-- ============================================

-- Criar extensão para UUID (se não existir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_credit_card BOOLEAN NOT NULL DEFAULT false,
    month_year VARCHAR(7) NOT NULL, -- Formato: YYYY-MM
    category VARCHAR(100),
    tags TEXT[], -- Array de strings
    location JSONB, -- JSON para armazenar latitude, longitude, address
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimizar as consultas mais comuns
CREATE INDEX idx_transactions_month_year ON transactions(month_year);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_is_credit_card ON transactions(is_credit_card);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_tags ON transactions USING GIN(tags); -- Índice GIN para arrays

-- Trigger para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas colunas (documentação)
COMMENT ON TABLE transactions IS 'Tabela principal de transações financeiras';
COMMENT ON COLUMN transactions.id IS 'Identificador único da transação (UUID)';
COMMENT ON COLUMN transactions.description IS 'Descrição da transação';
COMMENT ON COLUMN transactions.amount IS 'Valor da transação (positivo para receita, negativo para despesa)';
COMMENT ON COLUMN transactions.is_credit_card IS 'Indica se é transação de cartão de crédito';
COMMENT ON COLUMN transactions.month_year IS 'Mês e ano da transação (YYYY-MM)';
COMMENT ON COLUMN transactions.category IS 'Categoria da transação (ex: alimentação, transporte)';
COMMENT ON COLUMN transactions.tags IS 'Tags para categorização adicional';
COMMENT ON COLUMN transactions.location IS 'Localização da transação (latitude, longitude, endereço)';

-- ============================================
-- Políticas RLS (Row Level Security) - OPCIONAL
-- ============================================
-- Descomente se quiser usar autenticação de usuário no futuro

-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Usuários podem ver suas próprias transações"
--     ON transactions FOR SELECT
--     USING (auth.uid() = user_id);

-- CREATE POLICY "Usuários podem inserir suas próprias transações"
--     ON transactions FOR INSERT
--     WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Usuários podem atualizar suas próprias transações"
--     ON transactions FOR UPDATE
--     USING (auth.uid() = user_id);

-- CREATE POLICY "Usuários podem deletar suas próprias transações"
--     ON transactions FOR DELETE
--     USING (auth.uid() = user_id);

-- ============================================
-- Dados de exemplo (OPCIONAL - remova se não quiser)
-- ============================================
-- INSERT INTO transactions (description, amount, is_credit_card, month_year, category, tags, location)
-- VALUES 
--     ('Supermercado Extra', -250.50, false, '2024-10', 'Alimentação', ARRAY['mercado', 'essencial'], 
--      '{"latitude": -23.5505, "longitude": -46.6333, "address": "São Paulo, SP"}'::jsonb),
--     ('Salário Outubro', 5000.00, false, '2024-10', 'Receita', ARRAY['salário', 'renda'], NULL),
--     ('Netflix', -49.90, true, '2024-10', 'Entretenimento', ARRAY['streaming', 'assinatura'], NULL);

