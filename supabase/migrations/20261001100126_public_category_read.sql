-- Categories are public reference data used by listing cards and worker search.
-- RLS was enabled without a SELECT policy, so anonymous users saw no category.
create policy "Anyone can read active categories"
  on public.categories for select to anon, authenticated
  using (is_active = true);
