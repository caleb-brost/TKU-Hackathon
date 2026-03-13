create table if not exists tickets (
  id                   uuid primary key default gen_random_uuid(),
  type                 text not null check (type in ('pothole', 'crack')),
  latitude             float8 not null,
  longitude            float8 not null,
  severity             text not null check (severity in ('low', 'medium', 'high')),
  confidence           float8 check (confidence between 0 and 1),
  status               text not null default 'new' check (status in ('new', 'completed')),
  description          text,
  image_url            text,
  completion_image_url text,
  employee_id          text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table if not exists route_requests (
  id                   uuid primary key default gen_random_uuid(),
  selected_ticket_ids  uuid[] not null,
  start_address        text not null,
  end_address          text not null,
  generated_route      jsonb,
  created_at           timestamptz not null default now()
);

