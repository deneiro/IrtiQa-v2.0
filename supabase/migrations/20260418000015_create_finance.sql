-- ============================================================
-- Migration: 20260418000015_create_finance
-- Purpose: Create accounts, categories, and transactions for Finances
-- ============================================================

-- 1. Enums
CREATE TYPE finance_account_type AS ENUM ('cash', 'card', 'bank', 'savings', 'other');
CREATE TYPE finance_transaction_type AS ENUM ('income', 'expense', 'transfer');

-- 2. Finance accounts (Wallets/Banks)
CREATE TABLE IF NOT EXISTS public.finance_accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  type          finance_account_type DEFAULT 'cash' NOT NULL,
  balance       NUMERIC(12,2) DEFAULT 0 NOT NULL,
  currency      TEXT DEFAULT 'USD' NOT NULL,
  color         TEXT, -- Visual accent for the account
  icon          TEXT, -- Icon name or emoji
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_finance_accounts_user_id ON public.finance_accounts(user_id);

ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts" ON public.finance_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON public.finance_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON public.finance_accounts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON public.finance_accounts FOR DELETE USING (auth.uid() = user_id);

-- 3. Finance categories
CREATE TABLE IF NOT EXISTS public.finance_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for system-wide categories
  name          TEXT NOT NULL,
  type          finance_transaction_type NOT NULL,
  icon          TEXT,
  color         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_finance_categories_user_id ON public.finance_categories(user_id);

ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own or system categories" ON public.finance_categories FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.finance_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.finance_categories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.finance_categories FOR DELETE USING (auth.uid() = user_id);

-- 4. Finance transactions
CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id        UUID REFERENCES public.finance_accounts(id) ON DELETE CASCADE NOT NULL,
  category_id       UUID REFERENCES public.finance_categories(id) ON DELETE SET NULL,
  to_account_id     UUID REFERENCES public.finance_accounts(id) ON DELETE CASCADE, -- For transfers
  amount            NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  type              finance_transaction_type NOT NULL,
  description       TEXT,
  transaction_date  TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_user_id ON public.finance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_account_id ON public.finance_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_date ON public.finance_transactions(transaction_date);

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.finance_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.finance_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.finance_transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.finance_transactions FOR DELETE USING (auth.uid() = user_id);

-- 5. Trigger to update account balance on transaction changes
CREATE OR REPLACE FUNCTION public.handle_transaction_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.type = 'income') THEN
      UPDATE public.finance_accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF (NEW.type = 'expense') THEN
      UPDATE public.finance_accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    ELSIF (NEW.type = 'transfer') THEN
      UPDATE public.finance_accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
      IF (NEW.to_account_id IS NOT NULL) THEN
        UPDATE public.finance_accounts SET balance = balance + NEW.amount WHERE id = NEW.to_account_id;
      END IF;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.type = 'income') THEN
      UPDATE public.finance_accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF (OLD.type = 'expense') THEN
      UPDATE public.finance_accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    ELSIF (OLD.type = 'transfer') THEN
      UPDATE public.finance_accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
      IF (OLD.to_account_id IS NOT NULL) THEN
        UPDATE public.finance_accounts SET balance = balance - OLD.amount WHERE id = OLD.to_account_id;
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_transaction_change
  AFTER INSERT OR DELETE ON public.finance_transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_transaction_balance();

-- 6. Seed default categories
INSERT INTO public.finance_categories (name, type, icon, color) VALUES
('Salary', 'income', '💰', '#10b981'),
('Bonus', 'income', '🎁', '#3b82f6'),
('Dividends', 'income', '📈', '#8b5cf6'),
('Food', 'expense', '🍔', '#f97316'),
('Transport', 'expense', '🚗', '#3b82f6'),
('Rent', 'expense', '🏠', '#ef4444'),
('Entertainment', 'expense', '🎮', '#ec4899'),
('Health', 'expense', '🏥', '#ef4444'),
('Education', 'expense', '📚', '#8b5cf6'),
('Shopping', 'expense', '🛍️', '#eab308'),
('Utilities', 'expense', '⚡', '#10b981'),
('Other', 'expense', '📁', '#94a3b8');
