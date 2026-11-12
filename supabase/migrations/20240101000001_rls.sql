-- Enable RLS sur toutes les tables
alter table profiles enable row level security;
alter table candidates enable row level security;
alter table applications enable row level security;
alter table prequal_answers enable row level security;
alter table evaluations enable row level security;
alter table evaluation_scores enable row level security;
alter table alerts enable row level security;
alter table jury_decisions enable row level security;
alter table consents enable row level security;
alter table audit_log enable row level security;

-- Helper functions
create or replace function get_user_role() returns role_t as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer;

create or replace function is_candidate() returns boolean as $$
  select get_user_role() = 'candidat';
$$ language sql security definer;

create or replace function is_evaluateur() returns boolean as $$
  select get_user_role() = 'evaluateur';
$$ language sql security definer;

create or replace function is_jury() returns boolean as $$
  select get_user_role() = 'jury';
$$ language sql security definer;

create or replace function is_admin() returns boolean as $$
  select get_user_role() = 'admin';
$$ language sql security definer;

-- PROFILES
create policy "Les utilisateurs peuvent lire leur propre profil"
  on profiles for select
  using (id = auth.uid());

create policy "Les utilisateurs peuvent mettre à jour leur propre profil"
  on profiles for update
  using (id = auth.uid());

-- CANDIDATES
create policy "Les candidats peuvent lire leurs propres données"
  on candidates for select
  using (user_id = auth.uid());

create policy "Les candidats peuvent créer leur profil candidat"
  on candidates for insert
  with check (user_id = auth.uid());

create policy "Les candidats peuvent mettre à jour leurs données"
  on candidates for update
  using (user_id = auth.uid());

create policy "Jury et admin peuvent lire tous les candidats"
  on candidates for select
  using (is_jury() or is_admin());

-- APPLICATIONS
create policy "Les candidats peuvent lire leurs candidatures"
  on applications for select
  using (candidate_id in (select id from candidates where user_id = auth.uid()));

create policy "Les candidats peuvent créer une candidature"
  on applications for insert
  with check (candidate_id in (select id from candidates where user_id = auth.uid()));

create policy "Les évaluateurs peuvent lire les candidatures assignées"
  on applications for select
  using (
    is_evaluateur() and
    id in (select application_id from evaluations where evaluator_id = auth.uid())
  );

create policy "Jury et admin peuvent lire toutes les candidatures"
  on applications for select
  using (is_jury() or is_admin());

-- PREQUAL_ANSWERS
create policy "Les candidats peuvent gérer leurs réponses"
  on prequal_answers for all
  using (
    application_id in (
      select a.id from applications a
      join candidates c on a.candidate_id = c.id
      where c.user_id = auth.uid()
    )
  );

create policy "Évaluateurs peuvent lire les réponses des candidatures assignées"
  on prequal_answers for select
  using (
    is_evaluateur() and
    application_id in (select application_id from evaluations where evaluator_id = auth.uid())
  );

create policy "Jury et admin peuvent lire toutes les réponses"
  on prequal_answers for select
  using (is_jury() or is_admin());

-- EVALUATIONS
create policy "Les évaluateurs peuvent lire leurs évaluations"
  on evaluations for select
  using (evaluator_id = auth.uid());

create policy "Les évaluateurs peuvent mettre à jour leurs évaluations"
  on evaluations for update
  using (evaluator_id = auth.uid());

create policy "Jury et admin peuvent lire toutes les évaluations soumises"
  on evaluations for select
  using ((is_jury() or is_admin()) and status = 'submitted');

create policy "Admin peut créer des évaluations"
  on evaluations for insert
  with check (is_admin());

-- EVALUATION_SCORES (notation en aveugle)
create policy "Les évaluateurs peuvent gérer leurs propres scores"
  on evaluation_scores for all
  using (
    evaluation_id in (
      select id from evaluations where evaluator_id = auth.uid()
    )
  );

create policy "Jury et admin peuvent lire tous les scores soumis"
  on evaluation_scores for select
  using (
    (is_jury() or is_admin()) and
    evaluation_id in (select id from evaluations where status = 'submitted')
  );

-- ALERTS
create policy "Évaluateurs et jury peuvent créer des alertes"
  on alerts for insert
  with check (is_evaluateur() or is_jury());

create policy "Jury et admin peuvent lire et gérer les alertes"
  on alerts for all
  using (is_jury() or is_admin());

-- JURY_DECISIONS
create policy "Jury peut créer et lire les décisions"
  on jury_decisions for all
  using (is_jury() or is_admin());

-- CONSENTS
create policy "Les candidats peuvent gérer leurs consentements"
  on consents for all
  using (
    candidate_id in (select id from candidates where user_id = auth.uid())
  );

create policy "Admin peut lire les consentements"
  on consents for select
  using (is_admin());

-- AUDIT_LOG
create policy "Jury et admin peuvent lire les logs"
  on audit_log for select
  using (is_jury() or is_admin());
